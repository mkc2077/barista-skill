"""knowledge_sync.py — P1 知识引擎：定期自动更新知识库（新配方 / 新冲煮手法）。

两种触发面，同一套 sync 管线：
  - 方案B（本地独立版）：app 启动后由 MCP 工具 `set_knowledge_schedule` 驻留调度；
  - 方案A（Skill）：模型按提示词每周调用 MCP 工具 `check_knowledge_updates` 主动触发。

管线（纯 stdlib，无新依赖）：
  AnySearch 联网拉取 → 标题去重（精确 + difflib 相似度）→ add_documents 增量入库
  （source 前缀 `auto:`）→ 状态持久化（data/knowledge_sync_state.json）。

失败策略（PixelRAG 血泪教训——失败显式化，绝不静默闭卷）：
  网络/API 失败 → 记录错误 + 上次成功时间保留，下次重试；返回给调用方显式错误信息。
"""
from __future__ import annotations

import difflib
import json
import re
import threading
import time
import urllib.request
import urllib.error
from pathlib import Path
from typing import Callable, Dict, List, Optional

HERE = Path(__file__).resolve().parent
REPO = HERE.parent
DATA = REPO / "data"
STATE_FILE = DATA / "knowledge_sync_state.json"

ANYSEARCH_ENDPOINT = "https://api.anysearch.com/v1/search"
AUTO_SOURCE_PREFIX = "auto:"
DEFAULT_TOPICS = [
    "咖啡 新特调配方 最新",
    "精品咖啡 新冲煮手法 教程",
    "世界咖啡冲煮大赛 冠军方案 最新",
    "咖啡磨豆机 新品 评测",
]
# 间隔映射：daily / weekly / monthly
INTERVAL_DAILY = 24 * 3600
INTERVAL_WEEKLY = 7 * 24 * 3600
INTERVAL_MONTHLY = 30 * 24 * 3600
INTERVALS = {"daily": INTERVAL_DAILY, "weekly": INTERVAL_WEEKLY, "monthly": INTERVAL_MONTHLY}
DEFAULT_INTERVAL = INTERVAL_WEEKLY
# check_knowledge_updates 判断「该更新了」的阈值
STALE_THRESHOLD = 7 * 24 * 3600
# 去重：相似度阈值（difflib ratio）
DEDUP_RATIO = 0.85

# rag_index.add_documents 注入点（测试时替换为 fake）
ADD_DOCS: Optional[Callable] = None


def _default_add_docs(texts: List, source_prefix: str = AUTO_SOURCE_PREFIX) -> dict:
    """延迟导入 rag_index（避免循环依赖 + 允许 sentence-transformers 缺失时优雅返回）。"""
    import rag_index as _ri
    return _ri.add_documents(texts, source_prefix=source_prefix)


def _now() -> float:
    return time.time()


# ---------------------------------------------------------------------------
# AnySearch client（stdlib urllib）
# ---------------------------------------------------------------------------

def _search_topic(topic: str, api_key: str = "", max_results: int = 5) -> List[dict]:
    """POST AnySearch /v1/search，返回原始结果数组；失败抛异常（调用方显式处理）。"""
    payload = {"query": topic, "max_results": max_results, "format": "markdown"}
    headers = {"Content-Type": "application/json"}
    if api_key and api_key.strip():
        headers["Authorization"] = "Bearer " + api_key.strip()
    req = urllib.request.Request(
        ANYSEARCH_ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    results = data.get("results")
    if not isinstance(results, list):
        return []
    out = []
    for r in results:
        if isinstance(r, dict) and r.get("title"):
            out.append({
                "title": str(r.get("title", "")).strip(),
                "url": str(r.get("url", "")).strip(),
                "snippet": str(r.get("snippet") or r.get("content") or "").strip(),
            })
    return out


# ---------------------------------------------------------------------------
# 去重
# ---------------------------------------------------------------------------

def _norm_title(title: str) -> str:
    """归一化标题用于去重：小写、去空白/标点/emoji 噪音。"""
    t = re.sub(r"[^\w\u4e00-\u9fff]+", "", title.lower())
    return t


def _is_dup(title: str, seen: List[str]) -> bool:
    """精确命中或与任一已见标题相似度 >= DEDUP_RATIO 即视为重复。"""
    nt = _norm_title(title)
    if not nt:
        return True
    for s in seen:
        ns = _norm_title(s)
        if not ns:
            continue
        if nt == ns:
            return True
        if difflib.SequenceMatcher(None, nt, ns).ratio() >= DEDUP_RATIO:
            return True
    return False


# ---------------------------------------------------------------------------
# 状态持久化
# ---------------------------------------------------------------------------

def _load_state() -> dict:
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text("utf-8"))
        except Exception:
            pass
    return {"last_success": 0.0, "last_error": "", "seen_titles": [], "added_total": 0, "synced_at": []}


def _save_state(state: dict) -> None:
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    # 只保留最近 500 个标题，防无限膨胀
    state["seen_titles"] = state.get("seen_titles", [])[-500:]
    STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2), "utf-8")


# ---------------------------------------------------------------------------
# 主同步管线
# ---------------------------------------------------------------------------

def sync_once(
    topics: Optional[List[str]] = None,
    api_key: str = "",
    max_results: int = 5,
    language: str = "zh",
    add_docs: Optional[Callable] = None,
) -> dict:
    """执行一次完整同步。返回统计信息；网络/索引失败时带 error 字段返回（不抛异常）。

    Args:
        topics: 主题清单，默认 DEFAULT_TOPICS
        api_key: AnySearch Bearer key（可空 = 匿名额度）
        max_results: 每主题拉取条数
        language: 结果语言偏好（zh/en），暂用于 source_id 标记
        add_docs: 注入点（测试用）
    """
    adder = add_docs or ADD_DOCS or _default_add_docs
    state = _load_state()
    topics = topics or DEFAULT_TOPICS
    lang = language if language in ("zh", "en") else "zh"

    fetched, added, skipped_dup, errors = 0, 0, 0, 0
    new_items: List[tuple] = []  # (source_suffix, text)

    for topic in topics:
        try:
            results = _search_topic(topic, api_key=api_key, max_results=max_results)
        except Exception as e:  # noqa: BLE001 — 显式降级，不静默
            errors += 1
            state["last_error"] = f"topic={topic}: {e}"
            continue
        for r in results:
            fetched += 1
            if _is_dup(r["title"], state["seen_titles"]):
                skipped_dup += 1
                continue
            state["seen_titles"].append(r["title"])
            suffix = _slug(r["title"]) + "-" + str(int(_now()))
            text = f"# {r['title']}\n\n来源：{r['url']}\n\n{r['snippet']}"
            new_items.append((suffix, text))

    if new_items:
        try:
            result = adder(new_items, source_prefix=AUTO_SOURCE_PREFIX)
            added = result.get("added", len(new_items))
        except Exception as e:  # noqa: BLE001 — sentence-transformers 缺失等
            errors += 1
            state["last_error"] = f"add_documents: {e}"
            # 标题已计入 seen_titles，避免下次重试重复拉取；索引下次补建
            added = 0

    if errors == 0:
        state["last_success"] = _now()
        state["last_error"] = ""
        state["synced_at"].append({"t": _now(), "added": added, "topics": len(topics)})
        state["synced_at"] = state["synced_at"][-20:]
    state["added_total"] = state.get("added_total", 0) + added
    _save_state(state)

    return {
        "topics": len(topics),
        "fetched": fetched,
        "added": added,
        "skipped_dup": skipped_dup,
        "errors": errors,
        "last_error": state["last_error"],
        "last_success": state["last_success"],
    }


def _slug(text: str, limit: int = 24) -> str:
    """标题 → 安全文件名片段（保留中英文数字，其余替换为 -）。"""
    s = re.sub(r"[^\w\u4e00-\u9fff]+", "-", text.strip()).strip("-")
    return s[:limit] if s else "item"


# ---------------------------------------------------------------------------
# 调度器（threading，daemon）
# ---------------------------------------------------------------------------

class KnowledgeScheduler:
    """后台定时同步线程。set_interval 可热更新；stop() 优雅退出。"""

    def __init__(self, topics: Optional[List[str]] = None, api_key: str = "",
                 interval_seconds: int = DEFAULT_INTERVAL, add_docs: Optional[Callable] = None):
        self.topics = list(topics or DEFAULT_TOPICS)
        self.api_key = api_key
        self.interval = interval_seconds
        self.add_docs = add_docs
        self._stop_evt = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self.last_result: Optional[dict] = None

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop_evt.clear()
        self._thread = threading.Thread(target=self._loop, name="knowledge-sync", daemon=True)
        self._thread.start()

    def _loop(self) -> None:
        while not self._stop_evt.wait(self.interval):
            try:
                self.last_result = sync_once(self.topics, self.api_key, add_docs=self.add_docs)
            except Exception as e:  # noqa: BLE001
                self.last_result = {"error": str(e)}

    def set_interval(self, seconds: int) -> None:
        self.interval = max(60, int(seconds))

    def stop(self) -> None:
        self._stop_evt.set()
        if self._thread:
            self._thread.join(timeout=5)

    def status(self) -> dict:
        return {
            "running": bool(self._thread and self._thread.is_alive()),
            "interval_seconds": self.interval,
            "topics": self.topics,
            "last_result": self.last_result,
        }


# 全局单例（server.py 复用；方案B 配置写入后 start）
GLOBAL_SCHEDULER = KnowledgeScheduler()


def schedule_status() -> dict:
    return GLOBAL_SCHEDULER.status()


def set_schedule(interval: str = "weekly", topics: Optional[List[str]] = None,
                 api_key: str = "", start: bool = True) -> dict:
    """方案B Settings 调用的入口：配置 + 启动调度器。interval: daily/weekly/monthly。"""
    seconds = INTERVALS.get(interval, DEFAULT_INTERVAL)
    GLOBAL_SCHEDULER.set_interval(seconds)
    if topics:
        GLOBAL_SCHEDULER.topics = list(topics)
    GLOBAL_SCHEDULER.api_key = api_key
    if start:
        GLOBAL_SCHEDULER.start()
    return GLOBAL_SCHEDULER.status()


def needs_update(state: Optional[dict] = None, threshold: float = STALE_THRESHOLD) -> bool:
    """距上次成功同步超过阈值（默认 7 天）即认为需要更新。无状态视为需要。"""
    st = state or _load_state()
    last = float(st.get("last_success", 0.0))
    if last <= 0:
        return True
    return (_now() - last) > threshold
