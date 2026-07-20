#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Jimmy (吉米-咖啡届直男 / 小红书 Jim950707) 咖啡特调配方 —— 自动同步框架

============================================================================
重要（务必先读）
============================================================================
本工具**不会编造配方**。该博主只在小红书以视频形式发布内容，要把视频变成
结构化配方，必须同时具备：
  (1) 已登录的小红书会话（cookie + 请求签名）；
  (2) 视频理解后端（语音 ASR + 画面 OCR/视觉）来读取视频里的配方与 SOP。
这两者都不随本脚本提供。因此数据集初始为空，只从你提供的**已核实数据**中
灌入。两种安全的灌入方式：
  - 手动导入：你基于真实转录稿准备一份 JSON，运行 --manual-import；
  - 接入后端：自行实现一个 Extractor 调用你的 ASR/OCR 服务。
XhsCookieSource 监测器为「尽力而为」（非官方 API，需 cookie + 签名），鉴权
或签名失败时优雅返回空列表，不会崩溃、不会伪造数据。

============================================================================
运行模式
============================================================================
  --check                 仅监测新视频并报告，不写数据
  --sync                  监测 -> 提取 -> 幂等合并 -> 写数据 + 日志
  --manual-import PATH    导入你准备的已核实配方 JSON（最可靠路径）
  --dry-run               与 --sync/--manual-import 联用，只计算变更不落盘
  --config PATH           指定配置文件（默认 data/jimmy_sync_config.json）
  --data-path PATH        覆盖数据集路径（测试用）
  --state-path PATH       覆盖状态文件路径（测试用）
  --log-path PATH         覆盖日志文件路径（测试用）

依赖：仅 Python 标准库（>=3.8）。不引入第三方包，便于在 CI / cron 中直接跑。
"""
from __future__ import annotations

import argparse
import datetime as _dt
import hashlib
import json
import re
import sys
import urllib.request
import urllib.error
from pathlib import Path
from typing import Any, Dict, List, Optional

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DATA = REPO_ROOT / "data" / "jimmy_craft_recipes.json"
DEFAULT_STATE = REPO_ROOT / "data" / "jimmy_sync_state.json"
DEFAULT_LOG = REPO_ROOT / "data" / "jimmy_sync_log.json"
DEFAULT_CONFIG = REPO_ROOT / "data" / "jimmy_sync_config.json"

# --------------------------------------------------------------------------- #
# 小工具
# --------------------------------------------------------------------------- #
def now_iso() -> str:
    return _dt.datetime.now(_dt.timezone.utc).isoformat()


def load_json(p: Path) -> Optional[Any]:
    if not p.exists():
        return None
    return json.loads(p.read_text(encoding="utf-8"))


def save_json(p: Path, obj: Any) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")


def slugify(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "x"


# --------------------------------------------------------------------------- #
# 数据模型
# --------------------------------------------------------------------------- #
class VideoMeta:
    def __init__(self, note_id: str, title: str, video_url: str = "",
                 cover: str = "", published_ts: int = 0, source: str = "xiaohongshu"):
        self.note_id = note_id
        self.title = title
        self.video_url = video_url
        self.cover = cover
        self.published_ts = published_ts
        self.source = source

    def to_dict(self) -> Dict[str, Any]:
        return {
            "note_id": self.note_id, "title": self.title,
            "video_url": self.video_url, "cover": self.cover,
            "published_ts": self.published_ts, "source": self.source,
        }


# --------------------------------------------------------------------------- #
# 数据源（可插拔）：负责「发现新视频」
# --------------------------------------------------------------------------- #
class VideoSource:
    def __init__(self, cfg: Dict[str, Any]):
        self.cfg = cfg

    def list_new_videos(self, state: Dict[str, Any]) -> List[VideoMeta]:
        raise NotImplementedError


class ManualSource(VideoSource):
    """从用户放置的下料文件读取（默认 data/jimmy_new_videos.json）。
    适用于定时任务里你先把新视频元数据放好的场景。"""

    def list_new_videos(self, state: Dict[str, Any]) -> List[VideoMeta]:
        drop = Path(self.cfg.get("manual_drop_path",
                                 str(REPO_ROOT / "data" / "jimmy_new_videos.json")))
        if not drop.exists():
            return []
        raw = load_json(drop) or []
        notes = raw.get("videos", raw) if isinstance(raw, dict) else raw
        out = []
        for n in notes:
            out.append(VideoMeta(
                note_id=str(n.get("note_id", "")),
                title=str(n.get("title", "")),
                video_url=str(n.get("video_url", "")),
                cover=str(n.get("cover", "")),
                published_ts=int(n.get("published_ts", 0) or 0),
                source="manual_drop",
            ))
        return out


class XhsCookieSource(VideoSource):
    """尽力而为的小红书非官方 API 监测。需要有效的 cookie；通常还需 x-s/x-t
    签名（由小红书前端 JS 计算），纯 Python 无法稳定生成，故很可能返回 []。
    这是预期行为，不视为错误。"""

    def list_new_videos(self, state: Dict[str, Any]) -> List[VideoMeta]:
        auth = self.cfg.get("auth", {})
        cookie = auth.get("cookie", "")
        uid = self.cfg.get("blogger", {}).get("user_id", "")
        if not cookie or str(cookie).startswith("<"):
            print("[xhs] 未配置有效 cookie，跳过监测。", file=sys.stderr)
            return []
        if not uid or str(uid).startswith("<"):
            print("[xhs] 未配置 blogger.user_id（数字 ID），跳过监测。", file=sys.stderr)
            return []
        url = (f"https://edith.xiaohongshu.com/api/sns/web/v1/user_posted"
               f"?num=30&cursor=&user_id={uid}")
        try:
            req = urllib.request.Request(url, headers={
                "cookie": cookie,
                "user-agent": auth.get("user_agent",
                                       "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"),
                "referer": "https://www.xiaohongshu.com/",
            })
            with urllib.request.urlopen(req, timeout=15) as r:
                data = json.loads(r.read().decode("utf-8"))
            notes = (data.get("data", {}) or {}).get("notes", []) or []
            out = []
            for n in notes:
                out.append(VideoMeta(
                    note_id=str(n.get("id", "")),
                    title=str(n.get("title", "")),
                    cover=str((n.get("cover", {}) or {}).get("url", "")),
                    published_ts=int(n.get("time", 0) or 0),
                    source="xiaohongshu",
                ))
            return out
        except urllib.error.HTTPError as e:
            print(f"[xhs] 监测被拒（HTTP {e.code}，多为签名/登录墙）：{e.reason}",
                  file=sys.stderr)
            return []
        except Exception as e:  # 网络/解析等任何异常都降级为空
            print(f"[xhs] 监测失败（预期内，需 cookie + 签名）：{e}", file=sys.stderr)
            return []


# --------------------------------------------------------------------------- #
# 提取器（可插拔）：负责「视频 -> 配方」
# --------------------------------------------------------------------------- #
class Extractor:
    def extract(self, video: VideoMeta) -> List[Dict[str, Any]]:
        raise NotImplementedError


class ManualExtractor(Extractor):
    """不依赖视频。配合 --manual-import 使用：直接读取用户准备的配方 JSON。"""

    def extract(self, video: VideoMeta) -> List[Dict[str, Any]]:
        # 手动导入模式下不走 monitor，video 仅为占位，真实数据来自文件。
        return []


class StubExtractor(Extractor):
    """默认后端占位：提醒使用者接入 ASR/OCR。"""

    def extract(self, video: VideoMeta) -> List[Dict[str, Any]]:
        raise NotImplementedError(
            "未配置视频理解后端。请实现 Extractor（ASR + OCR/视觉）并在配置中设置 "
            "extractor='your_backend'；或使用 --manual-import 直接灌入已核实转录稿。"
        )


# --------------------------------------------------------------------------- #
# 合并（幂等）
# --------------------------------------------------------------------------- #
def derive_recipe_id(r: Dict[str, Any]) -> str:
    if r.get("recipe_id"):
        return str(r["recipe_id"])
    vid = (r.get("source_video") or {}).get("note_id", "")
    name = (r.get("drink_name") or {}).get("zh") or (r.get("drink_name") or {}).get("en") or ""
    if vid and name:
        return f"jimmy-{vid}-{slugify(name)}"
    if name:
        return f"jimmy-{hashlib.md5(name.encode('utf-8')).hexdigest()[:8]}"
    return f"jimmy-{hashlib.md5(json.dumps(r, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:8]}"


def normalize_recipe(r: Dict[str, Any], today: str) -> Dict[str, Any]:
    r = dict(r)
    r["recipe_id"] = derive_recipe_id(r)
    if not r.get("provenance"):
        r["provenance"] = "VERIFIED_USER_IMPORT"
    if not r.get("verified_at"):
        r["verified_at"] = today
    return r


def merge_recipes(dataset: Dict[str, Any],
                  new_recipes: List[Dict[str, Any]]) -> (Dict[str, Any], Dict[str, Any]):
    today = now_iso()[:10]
    existing: Dict[str, Dict[str, Any]] = {
        r["recipe_id"]: r for r in dataset.get("recipes", []) if r.get("recipe_id")
    }
    added, updated, unchanged = [], [], 0
    for nr in new_recipes:
        nr = normalize_recipe(nr, today)
        rid = nr["recipe_id"]
        if rid not in existing:
            added.append(nr)
            existing[rid] = nr
        else:
            old_blob = json.dumps(existing[rid], sort_keys=True, ensure_ascii=False)
            new_blob = json.dumps(nr, sort_keys=True, ensure_ascii=False)
            if old_blob != new_blob:
                updated.append(nr)
                existing[rid] = nr
            else:
                unchanged += 1
    dataset["recipes"] = list(existing.values())
    changes = {
        "added": [r["recipe_id"] for r in added],
        "updated": [r["recipe_id"] for r in updated],
        "unchanged": unchanged,
    }
    return dataset, changes


# --------------------------------------------------------------------------- #
# 来源/提取器工厂
# --------------------------------------------------------------------------- #
def build_source(name: str, cfg: Dict[str, Any]) -> VideoSource:
    return {"manual": ManualSource, "xhs": XhsCookieSource}.get(name, ManualSource)(cfg)


def build_extractor(name: str, cfg: Dict[str, Any]) -> Extractor:
    # 默认 Stub；使用者可在本文件注册自己的后端类。
    if name in ("manual",):
        return ManualExtractor()
    return StubExtractor()


# --------------------------------------------------------------------------- #
# 模式实现
# --------------------------------------------------------------------------- #
def load_import_recipes(path: Path) -> List[Dict[str, Any]]:
    raw = load_json(path)
    if raw is None:
        raise SystemExit(f"找不到导入文件：{path}")
    if isinstance(raw, dict):
        if "recipes" in raw:
            return raw["recipes"]
        # 单条配方
        return [raw]
    if isinstance(raw, list):
        return raw
    raise SystemExit("导入文件格式应为配方对象、{'recipes':[...]} 或配方数组。")


def run_manual_import(cfg, import_path: Path, data_path: Path,
                      state_path: Path, log_path: Path, dry_run: bool) -> Dict[str, Any]:
    recipes = load_import_recipes(import_path)
    dataset = load_json(data_path) or {"_meta": {}, "recipes": []}
    dataset, changes = merge_recipes(dataset, recipes)
    if not dry_run:
        dataset["_meta"].update({
            "provenance": "VERIFIED_USER_IMPORT",
            "last_sync": now_iso(),
            "last_sync_status": "ok",
        })
        save_json(data_path, dataset)
        append_log(log_path, {
            "mode": "manual-import", "source": str(import_path),
            "changes": changes, "status": "ok",
        })
    else:
        print("[dry-run] 计划变更：", json.dumps(changes, ensure_ascii=False))
    return changes


def run_monitor(cfg, mode: str, data_path: Path, state_path: Path,
                log_path: Path, dry_run: bool) -> Dict[str, Any]:
    state = load_json(state_path) or {"seen_note_ids": [], "last_cursor": ""}
    source = build_source(cfg.get("source", "manual"), cfg)
    extractor = build_extractor(cfg.get("extractor", "stub"), cfg)
    videos = source.list_new_videos(state)
    unseen = [v for v in videos if v.note_id and v.note_id not in state["seen_note_ids"]]
    print(f"[monitor] 发现视频 {len(videos)} 条，其中未见 {len(unseen)} 条。")
    for v in unseen:
        print(f"  - {v.note_id}  {v.title}")

    if mode == "check" or dry_run:
        if mode == "check":
            return {"mode": "check", "unseen": [v.note_id for v in unseen]}

    # --sync
    collected: List[Dict[str, Any]] = []
    skipped = 0
    for v in unseen:
        try:
            collected.extend(extractor.extract(v))
        except NotImplementedError as e:
            print(f"[sync] 跳过 {v.note_id}：{e}", file=sys.stderr)
            skipped += 1
    dataset = load_json(data_path) or {"_meta": {}, "recipes": []}
    dataset, changes = merge_recipes(dataset, collected)
    if not dry_run:
        state["seen_note_ids"] = list({*state["seen_note_ids"], *[v.note_id for v in unseen]})
        save_json(state_path, state)
        if collected:
            dataset["_meta"].update({
                "provenance": "VERIFIED_BACKEND",
                "last_sync": now_iso(),
                "last_sync_status": "ok" if not skipped else "partial",
            })
            save_json(data_path, dataset)
        append_log(log_path, {
            "mode": "sync", "new_videos": len(unseen),
            "extracted": len(collected), "skipped": skipped,
            "changes": changes,
            "status": "ok" if (not unseen or collected) else "no_backend",
        })
    else:
        print("[dry-run] 计划变更：", json.dumps(changes, ensure_ascii=False))
    return {"mode": "sync", "unseen": len(unseen), "extracted": len(collected),
            "skipped": skipped, "changes": changes}


def append_log(log_path: Path, entry: Dict[str, Any]) -> None:
    logs = load_json(log_path) or []
    if not isinstance(logs, list):
        logs = [logs]
    entry = {"ts": now_iso(), **entry}
    logs.append(entry)
    # 仅保留最近 200 条
    save_json(log_path, logs[-200:])


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Jimmy 特调配方自动同步框架（不编造数据）")
    ap.add_argument("--check", action="store_true", help="仅监测新视频并报告")
    ap.add_argument("--sync", action="store_true", help="监测+提取+合并+写入")
    ap.add_argument("--manual-import", dest="manual_import", metavar="PATH",
                    help="导入已核实配方 JSON（最可靠路径）")
    ap.add_argument("--dry-run", action="store_true", help="只计算变更，不落盘")
    ap.add_argument("--config", default=str(DEFAULT_CONFIG), help="配置文件路径")
    ap.add_argument("--data-path", default=str(DEFAULT_DATA), help="数据集路径（覆盖）")
    ap.add_argument("--state-path", default=str(DEFAULT_STATE), help="状态文件路径（覆盖）")
    ap.add_argument("--log-path", default=str(DEFAULT_LOG), help="日志文件路径（覆盖）")
    args = ap.parse_args(argv)

    cfg_path = Path(args.config)
    cfg = load_json(cfg_path) or {}
    data_path = Path(args.data_path)
    state_path = Path(args.state_path)
    log_path = Path(args.log_path)

    if args.manual_import:
        changes = run_manual_import(cfg, Path(args.manual_import), data_path,
                                     state_path, log_path, args.dry_run)
        print("手动导入完成：", json.dumps(changes, ensure_ascii=False))
        return 0
    if args.sync:
        run_monitor(cfg, "sync", data_path, state_path, log_path, args.dry_run)
        return 0
    if args.check:
        run_monitor(cfg, "check", data_path, state_path, log_path, args.dry_run)
        return 0

    ap.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
