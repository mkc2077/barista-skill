#!/usr/bin/env python3
"""
Barista Skill MCP Server
将 barista-skill 咖啡师教练技能封装为 MCP (Model Context Protocol) 服务。

通过 8 个专业工具提供咖啡冲煮、风味诊断、杯测评分、研磨校准、
参数调整、风味轮查询、感官训练与学习资源推荐能力。

支持任何 MCP 兼容客户端（Claude Desktop / TRAE / Cursor / VS Code 等）。
"""

import sys
import os
import json
import re
from pathlib import Path
from typing import Optional

from mcp.server.fastmcp import FastMCP

# ---------------------------------------------------------------------------
# 知识库加载
# ---------------------------------------------------------------------------

REFERENCES_DIR = Path(__file__).resolve().parent.parent / "references"


def load_reference(filename: str) -> str:
    """加载 references/ 目录下的 Markdown 参考文件。"""
    filepath = REFERENCES_DIR / filename
    if not filepath.exists():
        return f"[错误] 文件 {filename} 不存在"
    return filepath.read_text(encoding="utf-8")


def load_all_references() -> dict[str, str]:
    """加载所有参考文件到字典。"""
    result = {}
    if not REFERENCES_DIR.exists():
        return result
    for f in REFERENCES_DIR.glob("*.md"):
        result[f.name] = f.read_text(encoding="utf-8")
    return result


# 预加载所有参考文件
KNOWLEDGE = load_all_references()

# ---------------------------------------------------------------------------
# 数据表（从参考文件中提取的结构化数据）
# ---------------------------------------------------------------------------

# 17 种冲煮法起步参数
RECIPES = {
    "espresso": {
        "name": "意式浓缩",
        "dose": "18g",
        "yield": "约36g (1:2)",
        "temp": "92-94°C",
        "time": "25-30秒",
        "grind": "中等偏细",
        "steps": "称18g粉→铺平→轻压→开机计时→到36g停(约27秒)",
        "adjust_bitter": "粉磨粗一点 (苦调粗)",
        "adjust_sour": "粉磨细一点 (酸调细)",
    },
    "pour_over": {
        "name": "手冲",
        "dose": "15g",
        "yield": "240g (1:16)",
        "temp": "90-92°C (深烘88°C, 浅烘93°C)",
        "time": "2:30-3:30",
        "grind": "中等 (粗砂糖)",
        "steps": "粉入滤杯→先倒30g水闷蒸30秒→分2-3次加水到240g画圈浇→等滤完",
        "adjust_bitter": "粉磨粗一点",
        "adjust_sour": "粉磨细一点",
    },
    "french_press": {
        "name": "法压壶",
        "dose": "15g",
        "yield": "250g",
        "temp": "93°C",
        "time": "浸泡4分钟",
        "grind": "粗研磨 (海盐)",
        "steps": "粉水混合→浸泡4分钟→压下→倒出",
        "adjust_bitter": "粉磨更粗",
        "adjust_sour": "粉磨细一点或延长浸泡",
    },
    "aeropress": {
        "name": "爱乐压",
        "dose": "15-17g",
        "yield": "220-250g",
        "temp": "80-90°C (深烘低, 浅烘高)",
        "time": "浸泡1分钟+压20-30秒",
        "grind": "中细 (比手冲细, 比意式粗)",
        "steps": "装粉倒水→搅两下→闷1分钟→放滤盖慢慢压(20-30秒)",
        "adjust_bitter": "粉磨粗一点或水降温",
        "adjust_sour": "粉磨细一点或水升温",
    },
    "moka_pot": {
        "name": "摩卡壶",
        "dose": "18-20g",
        "yield": "下壶冷水至安全阀下",
        "temp": "中小火",
        "time": "出咖啡1-2分钟",
        "grind": "中细 (细砂糖偏细)",
        "steps": "下壶加冷水→粉碗装粉铺平别压→拧紧→中小火→出咖啡转最小火→咕噜声立刻关火离炉",
        "adjust_bitter": "火关小/粉磨粗/别煮到咕噜太久",
        "adjust_sour": "—",
    },
    "cold_brew": {
        "name": "冷萃",
        "dose": "50-70g",
        "yield": "500-700g",
        "temp": "常温水或冷水",
        "time": "冰箱12-24小时",
        "grind": "粗研磨 (海盐)",
        "steps": "粉水搅匀→盖好放冰箱→时间到过滤即可",
        "adjust_bitter": "粉磨更粗或时间缩短",
        "adjust_sour": "—",
    },
    "ice_drip": {
        "name": "冰滴",
        "dose": "40-60g",
        "yield": "400-600g冰水",
        "temp": "冰水混合",
        "time": "4-8小时 (每秒1滴)",
        "grind": "中粗研磨",
        "steps": "粉铺平→调阀门让冰水慢滴→接住咖啡→冷藏后喝",
        "adjust_bitter": "粉磨粗/冰水多加水",
        "adjust_sour": "阀门调慢/粉磨细",
    },
    "clever_dripper": {
        "name": "聪明杯",
        "dose": "15-20g",
        "yield": "240-300g",
        "temp": "90-93°C",
        "time": "浸泡2-3分钟",
        "grind": "中研磨 (粗砂糖)",
        "steps": "放滤纸加粉→倒水到目标量→盖好闷2-3分钟→放到杯上打开阀门滴下",
        "adjust_bitter": "粉磨粗",
        "adjust_sour": "粉磨细",
    },
    "iced_pour_over": {
        "name": "冰手冲",
        "dose": "15g",
        "yield": "冰约100g+热水150g",
        "temp": "90-93°C (浅烘可高)",
        "time": "同热手冲",
        "grind": "中细",
        "steps": "粉入滤杯→少量水闷蒸30s→分次注水到目标热水量→直接落在冰上冷却",
        "adjust_bitter": "粉磨粗",
        "adjust_sour": "粉磨细",
    },
}

# 风味问题诊断表
FLAVOR_DIAGNOSIS = {
    "bitter": {
        "symptoms": ["太苦", "焦苦", "中药味", "焦味"],
        "beginner": "粉磨粗一点；水少泡一会儿（缩短时间）。口诀：苦调粗",
        "advanced": "调粗研磨 / 降低水温1-2°C / 缩短萃取时间 / 降低粉量比；排查过萃",
        "root_cause": "碳水化合物过度溶出（过萃）",
    },
    "sour": {
        "symptoms": ["太酸", "尖酸", "刺舌", "青涩"],
        "beginner": "粉磨细一点；多泡一会儿（延长时间）。口诀：酸调细",
        "advanced": "调细研磨 / 升高水温 / 延长萃取时间 / 提高粉量比；排查欠萃",
        "root_cause": "果酸类先溶出但糖类未充分萃取（欠萃）",
    },
    "weak": {
        "symptoms": ["淡如水", "没味道", "空", "寡淡"],
        "beginner": "粉磨细一点，或少放水多放粉",
        "advanced": "提高粉量、调细研磨、降低粉水比（如手冲1:15→1:14）",
        "root_cause": "萃取不足或粉水比过高",
    },
    "too_strong": {
        "symptoms": ["太浓", "厚重", "发闷"],
        "beginner": "粉磨粗一点，或多放水少放粉",
        "advanced": "降低粉量、调粗研磨、提高粉水比",
        "root_cause": "浓度过高或过萃",
    },
    "fast_flow": {
        "symptoms": ["水流太快", "咖啡很稀"],
        "beginner": "粉磨细一点",
        "advanced": "调细研磨、提高粉量、检查布粉均匀度",
        "root_cause": "研磨太粗或布粉不均导致通道效应",
    },
    "slow_flow": {
        "symptoms": ["水半天流不出", "堵住"],
        "beginner": "粉磨粗一点",
        "advanced": "调粗研磨、减少粉量、检查填压力度",
        "root_cause": "研磨太细或粉量过多",
    },
    "astringent": {
        "symptoms": ["涩口", "干巴巴", "刮舌头"],
        "beginner": "粉磨粗一点，水别太烫",
        "advanced": "调粗研磨、降水温、排查通道效应与过萃",
        "root_cause": "过萃或通道效应导致高分子物质过度提取",
    },
    "aroma_no_flavor": {
        "symptoms": ["闻着香喝着没味"],
        "beginner": "多放点粉、粉磨细一点",
        "advanced": "提高粉量、调细研磨、确认水温与新鲜度",
        "root_cause": "萃取不足或豆子不新鲜",
    },
}

# SCA 杯测 100 分评分维度
CUPPING_DIMENSIONS = [
    {"id": "fragrance_aroma", "name": "干香/湿香 Fragrance/Aroma", "max": 10, "type": "质量", "desc": "干香=研磨后注水前挥发性香气；湿香=注水破渣后香气"},
    {"id": "flavor", "name": "风味 Flavor", "max": 10, "type": "质量", "desc": "水溶性滋味+挥发性气味综合感知，含鼻后嗅觉"},
    {"id": "aftertaste", "name": "余韵 Aftertaste", "max": 10, "type": "质量", "desc": "吞咽后口腔残留滋味，回甘持久给高分"},
    {"id": "acidity", "name": "酸质 Acidity", "max": 10, "type": "质量", "desc": "按酸的品质而非强度评判，明亮果酸为优"},
    {"id": "body", "name": "醇厚度 Body", "max": 10, "type": "质量", "desc": "纯触感评估：油脂感、黏度、质量感"},
    {"id": "uniformity", "name": "一致性 Uniformity", "max": 10, "type": "勾选", "desc": "5杯×2分，不一致扣2分/杯"},
    {"id": "balance", "name": "平衡感 Balance", "max": 10, "type": "质量", "desc": "各维度是否均衡和谐"},
    {"id": "clean_cup", "name": "干净度 Clean Cup", "max": 10, "type": "勾选", "desc": "5杯×2分，有缺陷味扣2分/杯"},
    {"id": "sweetness", "name": "甜度 Sweetness", "max": 10, "type": "勾选", "desc": "5杯×2分，无甜感扣2分/杯"},
    {"id": "overall", "name": "总评 Overall", "max": 10, "type": "质量", "desc": "杯测者综合主观评价"},
]

# 研磨度参考刻度
GRINDER_SETTINGS = {
    "comandante_c40": {
        "name": "Comandante C40",
        "type": "手摇磨",
        "settings": {
            "turkish": "5-10格",
            "espresso": "10-15格",
            "pour_over": "20-25格",
            "french_press": "30-35格",
        },
    },
    "1zpresso_jx_pro": {
        "name": "1Zpresso JX-Pro",
        "type": "手摇磨",
        "settings": {
            "espresso": "1.0-1.2圈",
            "pour_over": "2.0-2.4圈",
        },
    },
    "timemore_c3": {
        "name": "Timemore C2/C3",
        "type": "手摇磨",
        "settings": {
            "espresso": "8-10格",
            "pour_over": "14-18格",
        },
    },
    "mahlkonig_ek43": {
        "name": "Mahlkönig EK43",
        "type": "商用电动",
        "settings": {
            "espresso_soe": "1.3-1.8",
            "pour_over": "7-8.5",
        },
    },
    "eureka_mignon": {
        "name": "Eureka Mignon系列",
        "type": "家用电动",
        "settings": "零点以上数格范围调整",
    },
    "baratza_sette_270": {
        "name": "Baratza Sette 270",
        "type": "家用电动",
        "settings": {
            "espresso": "5-10档",
        },
    },
}

# 参数调整矩阵（按烘焙度）
PARAMETERS_BY_ROAST = {
    "light": {
        "solubility": "低",
        "water_temp": "93-96°C",
        "grind": "偏细",
        "time": "偏长",
        "principle": "豆子结构紧密，需更多能量萃取；明亮酸质和花香需充分萃取",
        "mantra": "浅烘磨细温要高",
    },
    "medium": {
        "solubility": "中等",
        "water_temp": "90-93°C",
        "grind": "中等",
        "time": "标准",
        "principle": "平衡型，接近金杯标准参数",
        "mantra": "—",
    },
    "dark": {
        "solubility": "高",
        "water_temp": "88-91°C",
        "grind": "偏粗",
        "time": "偏短",
        "principle": "受热时间长，细胞结构疏松，易溶；过快萃取会苦涩",
        "mantra": "深烘磨粗温要低",
    },
}

# 按产区参数调整
PARAMETERS_BY_ORIGIN = {
    "ethiopia": {"water_temp": "92-94°C", "ratio": "1:16-1:17", "grind": "中细偏细", "flavor": "花香、柑橘、莓果、茶感"},
    "kenya": {"water_temp": "93-95°C", "ratio": "1:15-1:16", "grind": "中细", "flavor": "浓郁浆果、番茄、咸鲜"},
    "colombia": {"water_temp": "90-93°C", "ratio": "1:15-1:16", "grind": "中等", "flavor": "平衡、焦糖、坚果"},
    "brazil": {"water_temp": "88-91°C", "ratio": "1:14-1:15", "grind": "中粗", "flavor": "坚果、巧克力、低酸"},
    "panama_geisha": {"water_temp": "92-94°C", "ratio": "1:16-1:18", "grind": "中细", "flavor": "茉莉花、佛手柑、优雅"},
    "yunnan": {"water_temp": "90-93°C", "ratio": "1:15-1:16", "grind": "中等", "flavor": "平衡、红糖、坚果"},
}

# 按处理法参数调整
PARAMETERS_BY_PROCESS = {
    "washed": {"adjustment": "稍高水温或稍细研磨；粉水比可略高(1:16-1:17)", "flavor": "风味干净清晰、酸度明亮"},
    "natural": {"adjustment": "稍低水温或稍粗研磨防过萃；粉水比可略低(1:15-1:16)", "flavor": "果香浓郁、甜感高、醇厚"},
    "honey": {"adjustment": "中等参数，按蜜处理程度微调", "flavor": "甜感突出、平衡"},
    "anaerobic": {"adjustment": "通常需降低水温(88-92°C)避免过度提取发酵风味", "flavor": "风味独特强烈、发酵感、酒香"},
}

# 风味轮九大类别
FLAVOR_WHEEL = {
    "水果": ["柑橘", "莓果", "热带水果", "核果", "果干"],
    "花香": ["茉莉花", "玫瑰", "咖啡花"],
    "坚果可可": ["杏仁", "榛果", "黑巧克力", "牛奶巧克力"],
    "焦糖甜感": ["焦糖", "蜂蜜", "红糖", "枫糖"],
    "香料": ["肉桂", "丁香", "黑胡椒"],
    "烘烤": ["烤面包", "烟熏", "烟草"],
    "发酵酒香": ["红酒感", "朗姆酒", "发酵"],
    "酸感发酵": ["醋酸", "酒石酸", "柠檬酸"],
    "其他": ["土味", "草药", "橡胶"],
}

# 学习资源
LEARNING_RESOURCES = {
    "beginner": [
        {"name": "咖啡沙龙", "url": "coffeesalon.com", "type": "中文社区", "desc": "业界和爱好者推崇的咖啡主题网站"},
        {"name": "中国咖啡网", "url": "gafei.com", "type": "中文资讯", "desc": "涵盖咖啡知识、品鉴、技术学习交流"},
        {"name": "Sweet Maria's (YouTube)", "url": "youtube.com", "type": "视频", "desc": "走访各产地的视频，可见原产地处理过程"},
    ],
    "intermediate": [
        {"name": "Barista Hustle", "url": "baristahustle.com", "type": "英文研究站", "desc": "浓缩萃取率等方面的深度研究"},
        {"name": "Perfect Daily Grind", "url": "perfectdailygrind.com", "type": "英文媒体", "desc": "涵盖萃取、产区、烘焙等全维度专业内容"},
        {"name": "EHS咖啡西点学院", "url": "ehs-academy.cn", "type": "中文培训", "desc": "从品种到萃取、拉花的全面知识"},
        {"name": "明谦咖啡学院", "url": "mqcoffee.com", "type": "中文培训", "desc": "SCA认证考试、CQI Q-Grader认证"},
    ],
    "professional": [
        {"name": "WCR Sensory Lexicon", "url": "worldcoffeeresearch.org", "type": "标准参照", "desc": "110种风味属性的标准参照体系，免费下载"},
        {"name": "SCA Sensory Skills课程", "url": "sca.coffee", "type": "认证课程", "desc": "系统化感官训练，含36味闻香瓶、三角杯测"},
        {"name": "CQI Q-Grader认证", "url": "coffeeinstitute.org", "type": "认证", "desc": "咖啡品质鉴定师，含味觉/嗅觉测试"},
        {"name": "Le Nez du Café (咖啡鼻子)", "url": "winearomas.com", "type": "训练工具", "desc": "36味闻香瓶，Q-Grader必考工具"},
    ],
}

# 新手口诀卡
MANTRAS = {
    "grind": "苦调粗，酸调细；淡了粉多水少，浓了粉少水多；水流快调细，水流慢调粗。",
    "roast": "深烘磨粗温要低，浅烘磨细温要高；新豆要醒别急着，老豆磨细升点温。",
    "temp": "酸升温，苦降温（但仍优先调研磨）。",
    "rule": "一次只改一个变量（研磨、水温、粉水比、时间四选一），改完喝一口再判断。",
}


# ---------------------------------------------------------------------------
# MCP Server 初始化
# ---------------------------------------------------------------------------

mcp = FastMCP("barista")


# ---------------------------------------------------------------------------
# 工具 1: get_recipe — 按冲煮法获取起步参数
# ---------------------------------------------------------------------------

@mcp.tool()
def get_recipe(method: str, roast_level: str = "medium", experience: str = "beginner") -> str:
    """获取指定冲煮法的稳妥起步参数。

    Args:
        method: 冲煮方法，可选值: espresso(意式浓缩), pour_over(手冲),
                french_press(法压壶), aeropress(爱乐压), moka_pot(摩卡壶),
                cold_brew(冷萃), ice_drip(冰滴), clever_dripper(聪明杯),
                iced_pour_over(冰手冲)
        roast_level: 烘焙度，可选值: light(浅烘), medium(中烘), dark(深烘)。默认 medium
        experience: 用户经验水平，可选值: beginner(新手), intermediate(进阶), advanced(资深)。默认 beginner

    Returns:
        包含粉量、水量、水温、时间、研磨度、步骤和调整建议的参数表
    """
    recipe = RECIPES.get(method)
    if not recipe:
        available = ", ".join(RECIPES.keys())
        return f"未找到冲煮法 '{method}'。可用方法: {available}"

    roast_params = PARAMETERS_BY_ROAST.get(roast_level, PARAMETERS_BY_ROAST["medium"])

    lines = [
        f"## {recipe['name']} 起步参数",
        f"",
        f"| 参数 | 值 |",
        f"|------|------|",
        f"| 粉量 | {recipe['dose']} |",
        f"| 出液/水量 | {recipe['yield']} |",
        f"| 水温 | {recipe['temp']} |",
        f"| 时间 | {recipe['time']} |",
        f"| 研磨度 | {recipe['grind']} |",
        f"| 烘焙度调整 | {roast_params['mantra']} |",
        f"",
        f"### 步骤",
        f"{recipe['steps']}",
        f"",
        f"### 风味调整",
        f"- 太苦 → {recipe['adjust_bitter']}",
        f"- 太酸 → {recipe['adjust_sour']}",
    ]

    if experience == "beginner":
        lines.extend([
            f"",
            f"### 新手口诀",
            f"> {MANTRAS['grind']}",
            f"> {MANTRAS['rule']}",
        ])
    elif experience == "advanced":
        lines.extend([
            f"",
            f"### 烘焙度参数调整",
            f"- 溶解度: {roast_params['solubility']}",
            f"- 建议水温: {roast_params['water_temp']}",
            f"- 研磨倾向: {roast_params['grind']}",
            f"- 原理: {roast_params['principle']}",
            f"- 金杯目标: 萃取率 18-22%, TDS 1.15-1.35%",
        ])

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# 工具 2: diagnose_flavor — 风味问题诊断
# ---------------------------------------------------------------------------

@mcp.tool()
def diagnose_flavor(problem: str, experience: str = "beginner", flow_rate: str = "") -> str:
    """根据用户描述的风味问题，诊断原因并给出调整建议。

    Args:
        problem: 风味问题描述，如"太苦""太酸""涩口""太淡""水流太快"等
        experience: 用户经验水平: beginner/intermediate/advanced。默认 beginner
        flow_rate: 水流速度描述（可选），如"很快""很慢""正常"

    Returns:
        诊断结果与调整建议
    """
    problem_lower = problem.lower()

    # 匹配问题类型
    matched_key = None
    for key, diag in FLAVOR_DIAGNOSIS.items():
        for symptom in diag["symptoms"]:
            if symptom in problem_lower or symptom in problem:
                matched_key = key
                break
        if matched_key:
            break

    if not matched_key:
        available = "; ".join([f"{d['symptoms']}" for d in FLAVOR_DIAGNOSIS.values()])
        return f"未能识别风味问题 '{problem}'。可识别的问题包括: {available}"

    diag = FLAVOR_DIAGNOSIS[matched_key]

    lines = [
        f"## 风味诊断结果",
        f"",
        f"**问题类型**: {' / '.join(diag['symptoms'])}",
        f"**根本原因**: {diag['root_cause']}",
        f"",
    ]

    if experience == "beginner":
        lines.extend([
            f"### 调整建议（新手版）",
            f"{diag['beginner']}",
            f"",
            f"### 口诀",
            f"> {MANTRAS['grind']}",
            f"> {MANTRAS['rule']}",
        ])
        # 诊断式提问
        if matched_key in ("bitter", "sour") and not flow_rate:
            lines.extend([
                f"",
                f"### 诊断提问",
                f"做的时候水是很快就流完了，还是磨蹭很久才流完？",
                f"- 流得快 → 粉太粗/水太多",
                f"- 流得慢 → 可能其实过萃了",
            ])
    else:
        lines.extend([
            f"### 调整建议（资深版）",
            f"{diag['advanced']}",
            f"",
            f"### 科学原理",
            f"化合物溶出顺序: 果酸类(先) → 脂类 → 糖类(甜) → 碳水化合物(苦, 后)",
            f"金杯区间: 萃取率 18-22%, TDS 1.15-1.35%",
        ])

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# 工具 3: calculate_cupping_score — SCA 杯测评分计算
# ---------------------------------------------------------------------------

@mcp.tool()
def calculate_cupping_score(
    fragrance_aroma: float,
    flavor: float,
    aftertaste: float,
    acidity: float,
    body: float,
    uniformity: float,
    balance: float,
    clean_cup: float,
    sweetness: float,
    overall: float,
    taint_cups: int = 0,
    fault_cups: int = 0,
) -> str:
    """计算 SCA 杯测 100 分最终得分。

    十维度评分，每项满分 10 分（6.00-10.00），扣分后得出最终得分。
    精品级门槛: >= 80 分。

    Args:
        fragrance_aroma: 干香/湿香 (6-10)
        flavor: 风味 (6-10)
        aftertaste: 余韵 (6-10)
        acidity: 酸质 (6-10)
        body: 醇厚度 (6-10)
        uniformity: 一致性 (6-10, 5杯×2分)
        balance: 平衡感 (6-10)
        clean_cup: 干净度 (6-10, 5杯×2分)
        sweetness: 甜度 (6-10, 5杯×2分)
        overall: 总评 (6-10)
        taint_cups: 有小瑕疵的杯数 (每杯扣2分)
        fault_cups: 有大缺陷的杯数 (每杯扣4分)

    Returns:
        最终得分、等级判定和各维度明细
    """
    scores = {
        "干香/湿香 Fragrance/Aroma": fragrance_aroma,
        "风味 Flavor": flavor,
        "余韵 Aftertaste": aftertaste,
        "酸质 Acidity": acidity,
        "醇厚度 Body": body,
        "一致性 Uniformity": uniformity,
        "平衡感 Balance": balance,
        "干净度 Clean Cup": clean_cup,
        "甜度 Sweetness": sweetness,
        "总评 Overall": overall,
    }

    # 验证分数范围
    warnings = []
    for name, score in scores.items():
        if score < 6.0 or score > 10.0:
            warnings.append(f"⚠️ {name} = {score}，超出有效范围 6.00-10.00")

    total = sum(scores.values())
    deduction = taint_cups * 2 + fault_cups * 4
    final_score = total - deduction

    # 等级判定
    if final_score >= 90:
        grade = "特别优秀 Outstanding"
        specialty = True
    elif final_score >= 85:
        grade = "优秀 Excellent"
        specialty = True
    elif final_score >= 80:
        grade = "非常好 Very Good"
        specialty = True
    else:
        grade = "低于精品等级 Below Specialty"
        specialty = False

    lines = [
        f"## SCA 杯测评分结果",
        f"",
        f"| 维度 | 得分 |",
        f"|------|------|",
    ]
    for name, score in scores.items():
        lines.append(f"| {name} | {score:.2f} |")

    lines.extend([
        f"| **十项总分** | **{total:.2f}** |",
        f"| 小瑕疵扣分 | -{taint_cups * 2:.2f} ({taint_cups}杯×2分) |",
        f"| 大缺陷扣分 | -{fault_cups * 4:.2f} ({fault_cups}杯×4分) |",
        f"| **最终得分** | **{final_score:.2f}** |",
        f"",
        f"### 等级判定",
        f"**{grade}** | 精品级: {'是 ✅' if specialty else '否 ❌'} (门槛 ≥ 80)",
    ])

    if warnings:
        lines.extend(["", "### ⚠️ 警告", "\n".join(warnings)])

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# 工具 4: calibrate_grinder — 磨豆机校准建议
# ---------------------------------------------------------------------------

@mcp.tool()
def calibrate_grinder(grinder_model: str, target_method: str = "espresso") -> str:
    """获取磨豆机的校准方法与推荐刻度。

    Args:
        grinder_model: 磨豆机型号，可选: comandante_c40, 1zpresso_jx_pro,
                       timemore_c3, mahlkonig_ek43, eureka_mignon, baratza_sette_270
        target_method: 目标冲煮法: espresso, pour_over, french_press, turkish

    Returns:
        校准步骤与推荐刻度
    """
    grinder = GRINDER_SETTINGS.get(grinder_model)
    if not grinder:
        available = ", ".join(GRINDER_SETTINGS.keys())
        return f"未找到磨豆机 '{grinder_model}'。可用型号: {available}"

    lines = [
        f"## {grinder['name']} 校准指南",
        f"",
        f"**类型**: {grinder['type']}",
        f"",
        f"### 推荐刻度",
    ]

    if "settings" in grinder and isinstance(grinder["settings"], dict):
        for method, setting in grinder["settings"].items():
            method_names = {
                "turkish": "土耳其咖啡", "espresso": "意式浓缩", "espresso_soe": "SOE意式",
                "pour_over": "手冲", "french_press": "法压/冷萃",
            }
            display = method_names.get(method, method)
            highlight = " ← 当前选择" if method == target_method or (method == "espresso" and target_method == "espresso") else ""
            lines.append(f"- {display}: **{setting}**{highlight}")
    else:
        lines.append(f"- {grinder['settings']}")

    # 通用校准步骤
    if grinder["type"] == "手摇磨":
        lines.extend([
            f"",
            f"### 归零校准步骤",
            "1. 旋转调节环至刀盘完全闭合（听到金属摩擦声），此为「零点」",
            f"2. 以零点为基准，逆时针旋转到目标刻度",
            f"3. 记录零点位置，后续以此为基准",
            f"",
            f"### 校准原则 (Dose → Yield → Time)",
            f"1. 固定粉量 Dose（如意式18g）",
            f"2. 固定液重 Yield（如意式36g = 1:2）",
            f"3. 调整研磨度使时间到达目标范围（意式25-32秒）",
        ])
    elif grinder_model == "mahlkonig_ek43":
        lines.extend([
            f"",
            f"### EK43 意式刻度校准步骤",
            f"1. 将刻度调整到 1 的位置",
            f"2. 用内六角扳手拧松刻度旋钮螺丝（共2个）",
            f"3. 开机状态下用一字螺丝刀顺时针调小刀盘间隙，直到听见轻微摩擦声",
            f"4. 逆时针调粗一点点，找到零界点（无摩擦声）",
            f"5. 关机，锁死刻度旋钮螺丝",
            f"",
            f"### 高级校准 (Matt Perger 方法)",
            f"用白板笔在刀盘做标记→故意调至摩擦→拆开观察擦除痕迹→",
            f"在磨损对角处垫纸片→反复调整直到标记均匀擦除",
        ])
    else:
        lines.extend([
            f"",
            f"### 通用校准原则",
            f"找零点（刀盘接触）→ 以此为基准设定研磨度",
            f"意式研磨通常在零点以上数格范围内调整",
        ])

    lines.extend([
        f"",
        f"### 常见问题",
        f"- 刻度漂移 → 定期重新校准零点",
        f"- 清洁后研磨不均 → 锁紧刀盘螺丝并重新校准",
        f"- 换豆后味道突变 → 充分 purge 旧粉再调参",
    ])

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# 工具 5: get_parameters_guide — 参数灵活应用指南
# ---------------------------------------------------------------------------

@mcp.tool()
def get_parameters_guide(
    roast_level: str = "",
    origin: str = "",
    process: str = "",
    taste_preference: str = "",
) -> str:
    """根据咖啡豆特性和口味偏好获取参数调整建议。

    可单独或组合查询按烘焙度、产区、处理法的参数调整，以及按口味偏好的调整方向。

    Args:
        roast_level: 烘焙度: light/medium/dark（可选）
        origin: 产区: ethiopia/kenya/colombia/brazil/panama_geisha/yunnan（可选）
        process: 处理法: washed/natural/honey/anaerobic（可选）
        taste_preference: 口味偏好: acidity(突出酸度)/sweetness(增强甜感)/
                          less_bitter(减少苦味)/body(增强醇厚)/clarity(风味清晰)（可选）

    Returns:
        参数调整建议矩阵
    """
    lines = ["## 参数灵活应用指南", ""]

    # 金杯标准
    lines.extend([
        f"### SCA 金杯标准",
        f"| 参数 | 标准 |",
        f"|------|------|",
        f"| 萃取率 | 18%-22% |",
        f"| 浓度 TDS | 1.15%-1.35% |",
        f"| 粉水比 | 1:15-1:20 (手冲) |",
        f"| 水温 | 92-96°C |",
        f"",
    ])

    # 按烘焙度
    if roast_level:
        params = PARAMETERS_BY_ROAST.get(roast_level)
        if params:
            lines.extend([
                f"### 按烘焙度调整 ({roast_level})",
                f"| 参数 | 建议 |",
                f"|------|------|",
                f"| 溶解度 | {params['solubility']} |",
                f"| 水温 | {params['water_temp']} |",
                f"| 研磨度 | {params['grind']} |",
                f"| 时间 | {params['time']} |",
                f"| 原理 | {params['principle']} |",
                f"| 口诀 | {params['mantra']} |",
                f"",
            ])

    # 按产区
    if origin:
        params = PARAMETERS_BY_ORIGIN.get(origin)
        if params:
            lines.extend([
                f"### 按产区调整 ({origin})",
                f"| 参数 | 建议 |",
                f"|------|------|",
                f"| 水温 | {params['water_temp']} |",
                f"| 粉水比 | {params['ratio']} |",
                f"| 研磨倾向 | {params['grind']} |",
                f"| 风味特征 | {params['flavor']} |",
                f"",
            ])

    # 按处理法
    if process:
        params = PARAMETERS_BY_PROCESS.get(process)
        if params:
            lines.extend([
                f"### 按处理法调整 ({process})",
                f"| 参数 | 建议 |",
                f"|------|------|",
                f"| 风味特点 | {params['flavor']} |",
                f"| 萃取调整 | {params['adjustment']} |",
                f"",
            ])

    # 按口味偏好
    taste_map = {
        "acidity": ("突出酸度", "调粗研磨/降低水温/缩短时间/降低粉水比"),
        "sweetness": ("增强甜感", "精确控制在甜味溶出窗口/稍提高水温/适当延长萃取"),
        "less_bitter": ("减少苦味", "调粗研磨/降低水温/缩短萃取时间/提高粉水比"),
        "body": ("增强醇厚度", "降低粉水比(浓度更高)/稍细研磨"),
        "clarity": ("追求风味清晰度", "提高萃取均匀度/适中粉水比"),
    }
    if taste_preference and taste_preference in taste_map:
        name, advice = taste_map[taste_preference]
        lines.extend([
            f"### 按口味偏好调整 ({name})",
            f"**调整方向**: {advice}",
            f"",
        ])

    lines.extend([
        f"### 核心原理",
        f"化合物溶出顺序: 果酸类(先) → 脂类 → 糖类(甜) → 碳水化合物(苦, 后)",
        f"",
        f"### 铁律",
        f"> 一次只改一个变量（研磨、水温、粉水比、时间四选一），改完喝一口再判断。",
    ])

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# 工具 6: get_flavor_wheel — 风味轮查询
# ---------------------------------------------------------------------------

@mcp.tool()
def get_flavor_wheel(category: str = "") -> str:
    """查询 SCA 咖啡风味轮的类别与具体描述词。

    Args:
        category: 风味类别（可选）: 水果/花香/坚果可可/焦糖甜感/香料/烘烤/发酵酒香/酸感发酵/其他。
                  留空则返回全部九大类别。

    Returns:
        风味轮类别与描述词列表
    """
    if category and category in FLAVOR_WHEEL:
        flavors = FLAVOR_WHEEL[category]
        return f"## 风味轮类别: {category}\n\n包含描述词: {', '.join(flavors)}"

    lines = [
        f"## SCA 咖啡风味轮",
        f"",
        f"风味轮采用同心圆辐射结构，由内向外分层：",
        f"- 最内圈: 五种基本味觉（甜、酸、咸、苦、鲜）",
        f"- 第一环: 九大风味类别",
        f"- 第二环: 子类",
        f"- 最外圈: 约99种具体描述词",
        f"",
        f"### 九大类别与描述词",
        f"",
    ]

    for cat, flavors in FLAVOR_WHEEL.items():
        lines.append(f"**{cat}**: {', '.join(flavors)}")

    lines.extend([
        f"",
        "### 「缝隙距离」原理",
        f"- 两个风味项之间缝隙越窄 → 关联度越高、越相似",
        f"- 缝隙越宽 → 关联度越弱、差异越大",
        f"- 使用方法: 从中心向外检索——先确定基本味觉→找所属大类→定位具体描述词",
    ])

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# 工具 7: get_sensory_training — 感官训练方案
# ---------------------------------------------------------------------------

@mcp.tool()
def get_sensory_training(training_type: str = "overview") -> str:
    """获取咖啡感官训练方案。

    Args:
        training_type: 训练类型:
            overview(概览), taste(味觉识别训练), olfactory(嗅觉记忆训练),
            cupping(对比品鉴练习), memory(个人风味记忆库搭建)

    Returns:
        系统化感官训练方案
    """

    if training_type == "taste":
        return (
            "## 基础味觉识别训练\n\n"
            "### 五味标准训练溶液（1L水中溶解）\n"
            "| 味觉 | 配方 |\n|------|------|\n"
            "| 甜 | 24g 蔗糖 |\n| 酸 | 1.2g 柠檬酸 |\n"
            "| 咸 | 4g 氯化钠 |\n| 苦 | 0.54g 咖啡因 |\n"
            "| 鲜 | 2g 味精 |\n\n"
            "### 进阶强度训练\n"
            "1. 每种味觉配置4个强度等级\n"
            "2. 独立品尝→同类混搭→不同类混合→盲喝测试\n\n"
            "### 咖啡酸质专项（CQI标准）\n"
            "- 柠檬酸: 柑橘类酸质\n- 苹果酸: 青苹果型酸\n"
            "- 酒石酸: 葡萄型酸\n- 醋酸: 不愉悦的酸\n"
            "- 绿原酸: 烘焙中分解为奎宁酸与咖啡酸"
        )

    elif training_type == "olfactory":
        return (
            "## 嗅觉记忆建立方法\n\n"
            "### 关键认知\n"
            "常说的「苹果味」并非味觉，而是鼻后嗅觉（retronasal olfaction）。\n"
            "可通过「棒棒糖实验」区分——捏鼻吃水果味棒棒糖只尝到甜味，松鼻瞬间风味明了。\n\n"
            "### Le Nez du Café 36味闻香瓶\n"
            "按烘焙化学变化分四大群组：\n"
            "| 群组 | 烘焙阶段 | 香气特征 | 代表 |\n|------|---------|---------|------|\n"
            "| 酶催化组 | 浅烘 | 花香、果香 | 玫瑰、咖啡花、柠檬、杏桃 |\n"
            "| 焦糖化组 | 中烘 | 坚果、焦糖 | 蜂蜜、焦糖、黑巧克力、烤杏仁 |\n"
            "| 干馏组 | 深烘 | 树酯、碳烧 | 丁香、胡椒、烟草、烟熏 |\n"
            "| 瑕疵组 | — | 不愉悦风味 | 土味、马铃薯、青豆、橡胶 |\n\n"
            "### 日常嗅觉记忆建立\n"
            "利用常见食材建立嗅觉记忆库：水果(柠檬/莓果/桃子)、花香(玫瑰/茉莉)、\n"
            "坚果(杏仁/榛果)、香料(肉桂/丁香/香草)。核心原则：大量尝试、记住生活中随处可见的气息。"
        )

    elif training_type == "cupping":
        return (
            "## 对比品鉴练习\n\n"
            "| 训练类型 | 内容 | 难度递进 |\n|---------|------|---------|\n"
            "| 三角杯测 | 三杯中两杯相同，找出不同的那杯 | 不同产区→不同处理法→不同烘焙度→同农场不同批次 |\n"
            "| 产区比较 | 对比不同产区风味差异 | 先大区对比，后同区不同国家 |\n"
            "| 瑕疵杯测 | 训练识别不好的风味 | 从明显瑕疵到细微瑕疵 |\n"
            "| 烘焙度对比 | 同一豆子不同烘焙度对比 | 理解烘焙度对风味的影响 |\n\n"
            "### 三角杯测方法\n"
            "1. 准备三杯咖啡，其中两杯相同、一杯不同\n"
            "2. 逐一啜吸品鉴，找出不同的那一杯\n"
            "3. 咖啡相似度越高越难——从不同产区开始，逐步增加难度"
        )

    elif training_type == "memory":
        return (
            "## 个人化咖啡风味记忆库搭建\n\n"
            "### 六步建立个人风味记忆库\n"
            "1. **味觉基础库**: 配置酸甜咸苦鲜标准溶液，4级强度，反复品尝记忆\n"
            "2. **鼻后嗅觉库**: 通过棒棒糖/新鲜水果盲测，建立鼻后嗅觉与味觉联动记忆\n"
            "3. **干香湿香库**: 闻香瓶36味/T100系统训练，辅以日常食材\n"
            "4. **咖啡风味映射库**: 用杯测方式品鉴不同产区/处理法/烘焙度，记录并对照风味轮定位\n"
            "5. **温度变化库**: 同一杯咖啡在高/中/低温下的风味变化记录\n"
            "6. **感官卫生维护**: 戒烟、戒酒、戒辣等刺激性食物，保持感官灵敏度"
        )

    else:  # overview
        return (
            "## 咖啡感官训练概览\n\n"
            "感官训练分四个模块，建议按顺序进行：\n\n"
            "1. **基础味觉识别训练** (training_type='taste')\n"
            "   - 五味标准溶液训练 + 4级强度 + 咖啡酸质专项\n\n"
            "2. **嗅觉记忆建立** (training_type='olfactory')\n"
            "   - 鼻后嗅觉认知 + Le Nez du Café 36味闻香瓶 + 日常食材记忆\n\n"
            "3. **对比品鉴练习** (training_type='cupping')\n"
            "   - 三角杯测 + 产区比较 + 瑕疵识别 + 烘焙度对比\n\n"
            "4. **个人风味记忆库** (training_type='memory')\n"
            "   - 六步搭建个人化咖啡嗅觉与味觉记忆库\n\n"
            "### 风味轮使用\n"
            "从中心向外检索：先确定基本味觉→找所属大类→定位具体描述词\n"
            "可使用 get_flavor_wheel 工具查询具体类别与描述词"
        )


# ---------------------------------------------------------------------------
# 工具 8: get_learning_resources — 学习资源推荐
# ---------------------------------------------------------------------------

@mcp.tool()
def get_learning_resources(level: str = "beginner") -> str:
    """获取按学习阶段分类的咖啡学习资源推荐。

    Args:
        level: 学习阶段: beginner(入门), intermediate(进阶), professional(专业)。
               也可传 all 获取全部级别。

    Returns:
        学习资源列表与学习路径建议
    """
    lines = ["## 咖啡学习资源推荐", ""]

    if level == "all":
        for lvl, resources in LEARNING_RESOURCES.items():
            level_names = {"beginner": "入门级", "intermediate": "进阶级", "professional": "专业级"}
            lines.append(f"### {level_names.get(lvl, lvl)}\n")
            lines.append("| 资源 | 类型 | 特点 |")
            lines.append("|------|------|------|")
            for r in resources:
                lines.append(f"| {r['name']} | {r['type']} | {r['desc']} |")
            lines.append("")
    else:
        resources = LEARNING_RESOURCES.get(level, LEARNING_RESOURCES["beginner"])
        level_names = {"beginner": "入门级（0-3个月）", "intermediate": "进阶级（3-12个月）", "professional": "专业级（12个月+）"}
        lines.append(f"### {level_names.get(level, level)}\n")
        lines.append("| 资源 | 类型 | 特点 |")
        lines.append("|------|------|------|")
        for r in resources:
            lines.append(f"| {r['name']} | {r['type']} | {r['desc']} |")
        lines.append("")

    lines.extend([
        f"### 三阶段成长路线图",
        f"1. **入门（0-3月）**: 咖啡沙龙+中国咖啡网 → 掌握2种冲煮法 → 建立基础风味词汇",
        f"2. **进阶（3-12月）**: Barista Hustle萃取理论 → 系统杯测练习 → SCA Brewing Foundation",
        f"3. **专业（12月+）**: SCA Sensory Skills全级别 → Q-Grader认证 → Le Nez du Café 36味训练",
    ])

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# 启动服务
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    mcp.run(transport="stdio")
