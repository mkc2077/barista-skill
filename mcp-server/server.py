#!/usr/bin/env python3
"""Barista Skill MCP Server (bilingual zh/en).

Wraps the barista coffee-coach skill as a Model Context Protocol (MCP) service.
20 tools cover coffee brewing, reference search, flavor diagnosis, SCA cupping scoring, grinder
calibration, parameter tuning, the flavor wheel, sensory training, classic milk
drinks, learning resources, SCA certification paths, CVA scoring, Q-Grader exams & study plans,
green coffee grading, defect beans, triangle test protocols, and SCA source search. Every tool
takes a `language` argument ("zh" or "en") and returns localized output; data falls back to Chinese.

Compatible with any MCP client (Claude Desktop / TRAE / Cursor / VS Code ...).
"""

from pathlib import Path
from mcp.server.fastmcp import FastMCP
import json



def _t(field, lang):
    """Localize a {zh, en} dict; fall back to zh then the raw value."""
    if isinstance(field, dict):
        return field.get(lang, field.get("zh", ""))
    return field


REFERENCES_DIR = Path(__file__).resolve().parent.parent / "references"

def _load_data(filename):
    """Load data from data/<filename>.json with graceful degradation.

    Reads the JSON file from the data/ directory.
    If the file is missing, returns empty dict or empty list.
    """
    data_path = Path(__file__).resolve().parent.parent / "data" / filename
    if not data_path.exists():
        if filename.endswith("wheel.json") or filename.endswith("dimensions.json"):
            return []
        return {}
    return json.loads(data_path.read_text(encoding="utf-8"))


# Package version ? single source: data/version.json
__version__ = _load_data("version.json").get("version", "0.0.0+unknown")

RECIPES = _load_data("recipes.json")


MILK_DRINKS = _load_data("milk_drinks.json")


FLAVOR_DIAGNOSIS = _load_data("flavor_diagnosis.json")


CUPPING_DIMENSIONS = _load_data("cupping.json")


GRINDER_SETTINGS = _load_data("grinder.json")


PARAMETERS_BY_ROAST = _load_data("parameters_roast.json")


PARAMETERS_BY_ORIGIN = _load_data("parameters_origin.json")


PARAMETERS_BY_PROCESS = _load_data("parameters_process.json")


FLAVOR_WHEEL = _load_data("flavor_wheel.json")


LEARNING_RESOURCES = _load_data("learning_resources.json")


MANTRAS = _load_data("mantras.json")

SCA_CERTIFICATION = _load_data("sca_certification.json")
SCA_CVA = _load_data("sca_cva.json")
QGRADER_EXAMS = _load_data("qgrader_exams.json")
QGRADER_STUDY = _load_data("qgrader_study_resources.json")
GREEN_GRADING = _load_data("green_coffee_grading.json")
DEFECT_BEANS = _load_data("defect_beans.json")
COFFEE_CHEMISTRY = _load_data("coffee_chemistry_sensory.json")
SCA_OFFICIAL_SOURCES = _load_data("sca_official_sources.json")


mcp = FastMCP("barista")


@mcp.tool()
def get_recipe(method: str, roast_level: str = "medium", experience: str = "beginner", language: str = "zh") -> str:
    """获取指定冲煮法的稳妥起步参数 / Get stable starter params for a brew method.

    Args:
        method: 冲煮方法 / brew method:
            espresso, pour_over, french_press, aeropress, moka_pot, cold_brew,
            ice_drip, clever_dripper, iced_pour_over, drip_bag, syphon, turkish,
            flash_brew, vietnamese_phin  (14 methods)
        roast_level: 烘焙度 / roast: light/medium/dark (默认 medium)
        experience: 经验水平 / experience: beginner/intermediate/advanced (默认 beginner)
        language: 输出语言 / output language: zh or en (默认 zh)
    Returns: 参数表 (localized).
    """
    lang = language if language in ("zh", "en") else "zh"
    recipe = RECIPES.get(method)
    if not recipe:
        avail = ", ".join(RECIPES.keys())
        err = f"未找到冲煮法 '{method}'。可用方法: {avail}" if lang == "zh" else f"Brew method '{method}' not found. Available: {avail}"
        return json.dumps({"ok": False, "error": err}, ensure_ascii=False, indent=2)

    roast = PARAMETERS_BY_ROAST.get(roast_level, PARAMETERS_BY_ROAST["medium"])
    fields = {
        "method": method,
        "name": _t(recipe["name"], lang),
        "dose": _t(recipe["dose"], lang),
        "yield": _t(recipe["yield"], lang),
        "temp": _t(recipe["temp"], lang),
        "time": _t(recipe["time"], lang),
        "grind": _t(recipe["grind"], lang),
        "gear": _t(recipe["gear"], lang),
        "roast_hint": _t(roast["mantra"], lang),
        "steps": _t(recipe["steps"], lang),
        "adjust_bitter": _t(recipe["adjust_bitter"], lang),
        "adjust_sour": _t(recipe["adjust_sour"], lang),
        "experience": experience
    }
    if experience == "beginner":
        fields["mantra"] = _t(MANTRAS["grind"], lang) + " | " + _t(MANTRAS["rule"], lang)
    elif experience == "advanced":
        fields["advanced_notes"] = {
            "solubility": _t(roast["solubility"], lang),
            "water_temp": roast["water_temp"],
            "grind_lean": _t(roast["grind"], lang),
            "principle": _t(roast["principle"], lang),
            "golden_cup": "萃取率 18-22%, TDS 1.15-1.35%" if lang == "zh" else "extraction 18-22%, TDS 1.15-1.35%"
        }
    h = "参数为通用起步值，具体器具/豆子需微调。单变量铁律: 一次只改一个变量。" if lang == "zh" else "Params are generic start points; adjust for your gear/beans. Iron law: change ONE variable at a time."
    fields["verify"] = h
    return json.dumps(fields, ensure_ascii=False, indent=2)




@mcp.tool()
def get_milk_drink(drink: str, language: str = "zh") -> str:
    """获取经典奶咖配方 / Get a classic milk-drink recipe (online cross-checked ratios).

    Args:
        drink: 款式 / drink:
            macchiato, cortado, flat_white, cappuccino, latte, mocha, con_panna,
            americano, irish_coffee, vienna, affogato  (11 drinks)
        language: 输出语言 / output language: zh or en (默认 zh)
    Returns: 配方表 (localized).
    """
    lang = language if language in ("zh", "en") else "zh"
    d = MILK_DRINKS.get(drink)
    if not d:
        avail = ", ".join(MILK_DRINKS.keys())
        err = f"未找到奶咖 '{drink}'。可用: {avail}" if lang == "zh" else f"Milk drink '{drink}' not found. Available: {avail}"
        return json.dumps({"ok": False, "error": err}, ensure_ascii=False, indent=2)
    fields = {
        "drink": drink,
        "name": _t(d["name"], lang),
        "espresso": _t(d["espresso"], lang),
        "milk": _t(d["milk"], lang),
        "foam": _t(d["foam"], lang),
        "volume": d["volume"],
        "notes": _t(d["notes"], lang),
        "source": "比例于 2026-07-15 联网核对 (expertcafe/completehomebarista/coffee-guide.jp)" if lang == "zh" else "Ratios cross-checked online 2026-07-15 (expertcafe/completehomebarista/coffee-guide.jp)"
    }
    return json.dumps(fields, ensure_ascii=False, indent=2)


@mcp.tool()
def get_craft_recipe(base: str = "espresso_classic", include_tea: bool = False, language: str = "zh") -> str:
    """特调咖啡 SOP 模板（独立大类）/ Craft coffee SOP template (standalone major category).

    Args:
        base: 咖啡基底萃取方案 / coffee base extraction spec:
            espresso_classic (中深烘浓缩 / mid-dark espresso),
            soe_ristretto (中浅烘 SOE ristretto / light SOE short cut),
            pour_over (手冲基底 / pour-over base),
            cold_brew (冷萃基底 / cold brew base)
        include_tea: 是否含茶底 / include a tea base (default False)
        language: 输出语言 / output language: zh or en (默认 zh)
    Returns: 8 项必填 SOP 框架；具体克数/萃取参数/门店当下配方需联网核实补全。
    """
    lang = language if language in ("zh", "en") else "zh"
    BASES = {"espresso_classic", "soe_ristretto", "pour_over", "cold_brew"}
    if base not in BASES:
        avail = ", ".join(sorted(BASES))
        err = f"未找到基底 '{base}'。可用: {avail}" if lang == "zh" else f"Base '{base}' not found. Available: {avail}"
        return json.dumps({"ok": False, "error": err}, ensure_ascii=False, indent=2)

    BASE_INFO = {
        "espresso_classic": {"zh": "A. 中深烘浓缩：豆=中深烘拼配；粉 18g / 出液 36g (1:2) / 92-94C / 9 bar / 25-30s",
                             "en": "A. Mid-dark espresso: beans=medium-dark blend; 18g / 36g out (1:2) / 92-94C / 9 bar / 25-30s"},
        "soe_ristretto":   {"zh": "B. 中浅烘 SOE ristretto：豆=中浅烘单一产地；粉 18-20g / 出液 18-27g (1:1-1:1.5) / 93-95C / 9 bar / 20-25s，只取前中段",
                             "en": "B. Light SOE ristretto: beans=mid-light SOE; 18-20g / 18-27g out (1:1-1:1.5) / 93-95C / 9 bar / 20-25s, front-mid cut only"},
        "pour_over":       {"zh": "C. 手冲基底：粉 15-20g / 总水 225-300g (1:15-1:16) / 90-92C / 2:00-2:45；滤杯按风格选(V60锥形=明亮酸香 / Kalita波浪=圆厚甜感)",
                             "en": "C. Pour-over base: 15-20g / 225-300g (1:15-1:16) / 90-92C / 2:00-2:45; dripper by style (V60 cone=bright acid / Kalita wave=round body)"},
        "cold_brew":       {"zh": "D. 冷萃基底：粉 1:8-1:12 冷水浸泡 / 冷藏 12-24h / 粗研磨；完成后过滤可稀释到 1:15 饮用",
                             "en": "D. Cold brew base: 1:8-1:12 cold steep / refrigerated 12-24h / coarse grind; filter, dilute to 1:15 to drink"},
    }
    tea_raw = "茶类+茶水比+水温+时间（如茉莉 1:50-1:80/80-85C/1.5-2.5min；乌龙 1:40-1:60/90-95C/1.5-3min；红茶 1:40-1:60/92-95C/2-4min；冷泡茶 1:100/4-8h）"
    TEA_INFO = {"zh": tea_raw, "en": "Tea + ratio + temp + time (e.g. jasmine 1:50-1:80/80-85C/1.5-2.5min; oolong 1:40-1:60/90-95C/1.5-3min; black 1:40-1:60/92-95C/2-4min; cold-brew tea 1:100/4-8h)"}

    fields = {
        "base_spec": BASE_INFO[base][lang],
        "tea_base": TEA_INFO[lang] if include_tea else "无 / None",
        "homemade": "辅料名 [g] — 做法 SOP（如糖浆 1:1/1:2；香草/焦糖/生姜/肉桂变体；果泥/果酱/cascara syrup）" if lang == "zh" else "Adjunct name [g] — prep SOP (e.g. syrups 1:1/1:2; vanilla/caramel/ginger/cinnamon variants; puree/jam/cascara syrup)",
        "store_bought": "椰子水/气泡水/鲜榨果汁/奶/枫糖/可可抹茶粉 g — 注明品牌取向与甜度校准" if lang == "zh" else "Coconut water/sparkling/fresh juice/milk/maple/cocoa-matcha g — note brand orientation & sweetness calibration",
        "cup_ice": "杯=玻璃杯/高球/陶瓷拿铁杯 g；冰=无/普通/大方冰/碎冰 g" if lang == "zh" else "Glass=standard/highball/ceramic-latte g; ice=none/regular/block/crushed g",
        "build_sop": "1) 先入杯 2) 次入 3) 次入 4) 咖啡液顶部缓注 5) 收尾；口诀={...}" if lang == "zh" else "1) fill glass 2) then 3) then 4) slow-pour coffee on top 5) finish; mantra={...}",
        "presentation": "是否搅拌/分几口/分层顺序；饮用窗口=X min；含酒精注明" if lang == "zh" else "Stir/no stir/sips/layer order; drinking window=X min; note alcohol",
        "source_placeholder": "[title](url)，获取于 YYYY-MM-DD" if lang == "zh" else "[title](url), retrieved YYYY-MM-DD",
        "verify": "具体克数/萃取参数需联网核实门店当下配方，标注来源链接 + 获取日期。详见 references/craft-coffee.md。" if lang == "zh" else "Specific grams/extraction params need online verification of the shop current recipe, with source link + retrieval date. See references/craft-coffee.md.",
    }
    return json.dumps(fields, ensure_ascii=False, indent=2)


@mcp.tool()
def diagnose_flavor(problem: str, experience: str = "beginner", flow_rate: str = "", language: str = "zh") -> str:
    """根据风味问题诊断并给调整建议 / Diagnose a flavor problem and suggest fixes.

    Args:
        problem: 风味问题描述 / flavor problem, e.g. "太苦"/"too bitter","太酸"/"too sour".
        experience: 经验水平 / experience: beginner/intermediate/advanced (默认 beginner)
        flow_rate: 水流速度描述(可选) / flow rate, e.g. "很快"/"fast","很慢"/"slow"
        language: 输出语言 / output language: zh or en (默认 zh)
    Returns: 诊断结果与调整建议 (JSON 中需人话改写层落地)。
    """
    lang = language if language in ("zh", "en") else "zh"
    p = problem.lower()
    matched = None
    for key, diag in FLAVOR_DIAGNOSIS.items():
        if any(sym in p or sym in problem for sym in diag["symptoms"]):
            matched = key
            break
    if not matched:
        avail = "; ".join("/".join(d["symptoms"]) for d in FLAVOR_DIAGNOSIS.values())
        err = f"未能识别风味问题 '{problem}'。可识别: {avail}" if lang == "zh" else f"Could not recognize flavor problem '{problem}'. Known: {avail}"
        return json.dumps({"ok": False, "error": err}, ensure_ascii=False, indent=2)
    diag = FLAVOR_DIAGNOSIS[matched]
    fields = {
        "problem": problem,
        "matched": matched,
        "symptoms": diag["symptoms"],
        "root_cause": _t(diag["root_cause"], lang),
        "experience": experience,
        "flow_rate": flow_rate,
    }
    if experience == "beginner":
        fields["beginner_fix"] = _t(diag["beginner"], lang)
        fields["mantra"] = _t(MANTRAS["grind"], lang) + " | " + _t(MANTRAS["rule"], lang)
        if matched in ("bitter", "sour") and not flow_rate:
            fields["flow_diagnostic_question"] = ("做的时候水是很快就流完了,还是磨蹭很久才流完?" if lang == "zh" else "Did the water run through fast, or take a long time to finish?")
            fields["flow_diagnostic_hints"] = ("流得快 -> 粉太粗/水太多；流得慢 -> 可能其实过萃了" if lang == "zh" else "Fast -> too coarse / too much water; Slow -> may actually be over-extracted")
    else:
        fields["advanced_fix"] = _t(diag["advanced"], lang)
        fields["science"] = ("化合物溶出顺序: 果酸类(先) -> 脂类 -> 糖类(甜) -> 碳水化合物(苦, 后)；金杯区间: 萃取率 18-22%, TDS 1.15-1.35%" if lang == "zh" else "Dissolution order: acids(first) -> lipids -> sugars(sweet) -> carbs(bitter, last); Golden cup: extraction 18-22%, TDS 1.15-1.35%")
    fields["verify"] = ("单变量铁律：一次只改一个变量，喝一口再判断。" if lang == "zh" else "Iron law: change ONE variable at a time, sip before next change.")
    return json.dumps(fields, ensure_ascii=False, indent=2)


@mcp.tool()
def calculate_cupping_score(
    fragrance_aroma: float, flavor: float, aftertaste: float, acidity: float,
    body: float, uniformity: float, balance: float, clean_cup: float,
    sweetness: float, overall: float, taint_cups: int = 0, fault_cups: int = 0,
    language: str = "zh",
) -> str:
    """计算 SCA 杯测 100 分最终得分 / Compute the SCA cupping 100-point final score.

    Ten dimensions, each 6.00-10.00; deductions for taint (2 pts/cup) and fault (4 pts/cup).
    Specialty threshold: >= 80. Args score the ten dimensions in order.

    Args:
        fragrance_aroma..overall: 干香/湿香..总评 (6-10)
        taint_cups: 小瑕疵杯数 / tainted cups (-2 each)
        fault_cups: 大缺陷杯数 / faulty cups (-4 each)
        language: 输出语言 / output language: zh or en (默认 zh)
    Returns: 最终得分、等级与明细 (localized).
    """
    lang = language if language in ("zh", "en") else "zh"
    # map each dimension id to its score argument
    score_map = {
        "fragrance_aroma": fragrance_aroma, "flavor": flavor, "aftertaste": aftertaste,
        "acidity": acidity, "body": body, "uniformity": uniformity, "balance": balance,
        "clean_cup": clean_cup, "sweetness": sweetness, "overall": overall,
    }
    warnings = []
    total = 0.0
    L = {"zh": {"title": "SCA 杯测评分结果", "dim": "维度", "tot": "十项总分", "td": "小瑕疵扣分", "fd": "大缺陷扣分",
                "fin": "最终得分", "grade": "等级判定", "sp": "特别优秀", "ex": "优秀", "vg": "非常好",
                "below": "低于精品等级", "spec": "精品级", "yes": "是", "no": "否", "thr": "门槛 >= 80", "warn": "警告",
                "sk": "简化版评分"},
         "en": {"title": "SCA Cupping Score", "dim": "Dimension", "tot": "Ten-item total", "td": "Taint deduction",
                "fd": "Fault deduction", "fin": "Final score", "grade": "Grade", "sp": "Outstanding",
                "ex": "Excellent", "vg": "Very Good", "below": "Below Specialty", "spec": "Specialty",
                "yes": "yes", "no": "no", "thr": "threshold >= 80", "warn": "Warnings",
                "sk": "simplified scoring"}}[lang]
    lines = [f"## {L['title']}", "", f"| {L['dim']} | Score |", "|------|------|"]
    for dim in CUPPING_DIMENSIONS:
        s = score_map[dim["id"]]
        total += s
        if s < 6.0 or s > 10.0:
            warnings.append(f"! {_t(dim['name'], lang)} = {s}, out of 6.00-10.00")
        lines.append(f"| {_t(dim['name'], lang)} | {s:.2f} |")
    deduction = taint_cups * 2 + fault_cups * 4
    final = total - deduction
    if final >= 90: grade = L["sp"]; spec = True
    elif final >= 85: grade = L["ex"]; spec = True
    elif final >= 80: grade = L["vg"]; spec = True
    else: grade = L["below"]; spec = False
    lines += [f"| **{L['tot']}** | **{total:.2f}** |", f"| {L['td']} | -{taint_cups*2:.2f} ({taint_cups}x2) |",
              f"| {L['fd']} | -{fault_cups*4:.2f} ({fault_cups}x4) |", f"| **{L['fin']}** | **{final:.2f}** |",
              "", f"### {L['grade']}", f"**{grade}** | {L['spec']}: {'yes' if spec else 'no'} ({L['thr']})",
              "", f"_{L['sk']}_"]
    if warnings:
        lines += ["", f"### ! {L['warn']}", "\n".join(warnings)]
    return "\n".join(lines)


@mcp.tool()
def calibrate_grinder(grinder_model: str, target_method: str = "espresso", language: str = "zh") -> str:
    """获取磨豆机校准方法与推荐刻度 / Get grinder calibration & recommended settings.

    Args:
        grinder_model: 磨豆机型号 / grinder: comandante_c40, 1zpresso_jx_pro, timemore_c3, mahlkonig_ek43, eureka_mignon, baratza_sette_270
        target_method: 目标冲煮法 / target: espresso, pour_over, french_press, turkish
        language: 输出语言 / output language: zh or en (默认 zh)
    Returns: 校准步骤与推荐刻度 (JSON 中需人话改写层落地)。
    """
    lang = language if language in ("zh", "en") else "zh"
    g = GRINDER_SETTINGS.get(grinder_model)
    if not g:
        avail = ", ".join(GRINDER_SETTINGS.keys())
        err = f"未找到磨豆机 '{grinder_model}'。可用: {avail}" if lang == "zh" else f"Grinder '{grinder_model}' not found. Available: {avail}"
        return json.dumps({"ok": False, "error": err}, ensure_ascii=False, indent=2)
    settings = g["settings"]
    targeted = {}
    if isinstance(settings, dict):
        mn = {"turkish": {"zh": "土耳其咖啡", "en": "Turkish"}, "espresso": {"zh": "意式浓缩", "en": "Espresso"},
              "espresso_soe": {"zh": "SOE意式", "en": "SOE espresso"}, "pour_over": {"zh": "手冲", "en": "Pour-over"},
              "french_press": {"zh": "法压/冷萃", "en": "French press/cold brew"}}
        for mth, cfg in settings.items():
            targeted[mth] = {"label": _t(mn.get(mth, mth), lang), "setting": _t(cfg, lang), "is_target": (mth == target_method)}
    else:
        targeted = _t(settings, lang)
    fields = {
        "grinder_model": grinder_model,
        "name": _t(g["name"], lang),
        "type": _t(g["type"], lang),
        "target_method": target_method,
        "recommended_settings": targeted,
        "zero_steps": _t(g.get("calibration", {"zh": "", "en": ""}), lang),
        "principle": ("1. 固定粉量 Dose(意式18g) 2. 固定液重 Yield(意式36g=1:2) 3. 调研磨度使时间到目标范围(意式25-32秒)" if lang == "zh" else "1. Fix dose (espresso 18g) 2. Fix yield (espresso 36g=1:2) 3. Tune grind to hit target time (espresso 25-32s)"),
        "common_issues": ("- 刻度漂移 -> 定期重新校准零点 - 清洁后研磨不均 -> 锁紧刀盘螺丝并重新校准 - 换豆后味道突变 -> 充分 purge 旧粉再调参" if lang == "zh" else "- dial drift -> recalibrate zero - uneven after cleaning -> tighten burr screws & recalibrate - flavor jump after bean swap -> purge old grounds then re-tune"),
    }
    fields["verify"] = ("校准后做一杯测时间与产量，对照目标范围；一次只改一个变量。" if lang == "zh" else "After calibrating brew one shot, check time & yield vs target; change ONE variable at a time.")
    return json.dumps(fields, ensure_ascii=False, indent=2)


@mcp.tool()
def get_parameters_guide(roast_level: str = "", origin: str = "", process: str = "",
                         taste_preference: str = "", language: str = "zh") -> str:
    """按豆性与口味偏好给参数调整建议 / Parameter-tuning advice by roast/origin/process/taste.

    Args:
        roast_level: 烘焙度 / roast: light/medium/dark
        origin: 产区 / origin: ethiopia/kenya/colombia/brazil/panama_geisha/yunnan
        process: 处理法 / process: washed/natural/honey/anaerobic
        taste_preference: 口味偏好 / taste: acidity/sweetness/less_bitter/body/clarity
        language: 输出语言 / output language: zh or en (默认 zh)
    Returns: 参数调整建议矩阵 (localized).
    """
    lang = language if language in ("zh", "en") else "zh"
    L = {"zh": {"title": "参数灵活应用指南", "gold": "SCA 金杯标准", "param": "参数", "std": "标准",
                "ex": "萃取率", "tds": "浓度 TDS", "roast": "按烘焙度", "ori": "按产区", "proc": "按处理法",
                "taste": "口味偏好", "none": "请至少给一个查询项(roast/origin/process 任选)"},
         "en": {"title": "Parameter tuning guide", "gold": "SCA Golden Cup standard", "param": "Param",
                "std": "Standard", "ex": "Extraction", "tds": "TDS", "roast": "By roast", "ori": "By origin",
                "proc": "By process", "taste": "Taste preference", "none": "Give at least one query (roast/origin/process)"}}[lang]
    lines = [f"## {L['title']}", "", f"### {L['gold']}", f"| {L['param']} | {L['std']} |", "|------|------|",
             f"| {L['ex']} | 18%-22% |", f"| {L['tds']} | 1.15%-1.35% |", ""]
    if roast_level:
        r = PARAMETERS_BY_ROAST.get(roast_level, PARAMETERS_BY_ROAST["medium"])
        lines += [f"### {L['roast']} ({roast_level})", f"- {L['gold'].split(' ')[0]}: {_t(r['solubility'], lang)}",
                  f"- {L['std']}: {r['water_temp']}", f"- grind: {_t(r['grind'], lang)}", f"- {_t(r['principle'], lang)}"]
    if origin:
        o = PARAMETERS_BY_ORIGIN.get(origin)
        if o:
            lines += ["", f"### {L['ori']} ({origin})", f"- temp: {o['water_temp']}", f"- ratio: {o['ratio']}",
                      f"- grind: {_t(o['grind'], lang)}", f"- flavor: {_t(o['flavor'], lang)}"]
        else:
            avail = ", ".join(PARAMETERS_BY_ORIGIN.keys())
            lines += ["", origin + (f" 未找到,可用: {avail}" if lang == "zh" else f" not found, available: {avail}")]
    if process:
        pr = PARAMETERS_BY_PROCESS.get(process)
        if pr:
            lines += ["", f"### {L['proc']} ({process})", _t(pr['adjustment'], lang), "", _t(pr['flavor'], lang)]
        else:
            avail = ", ".join(PARAMETERS_BY_PROCESS.keys())
            lines += ["", process + (f" 未找到,可用: {avail}" if lang == "zh" else f" not found, available: {avail}")]
    taste_map = {
        "acidity": {"zh": "升水温/调细研磨/延长/提粉量比", "en": "raise temp / finer / longer / raise ratio"},
        "sweetness": {"zh": "稍提粉量比/避免过萃看甜感区", "en": "slightly higher ratio / avoid over-extraction to hit sweet zone"},
        "less_bitter": {"zh": "调粗/降水温/缩短/降粉量比", "en": "coarser / lower temp / shorter / lower ratio"},
        "body": {"zh": "调细/稍高粉量/或法压类浸泡", "en": "finer / higher dose / or immersion like French press"},
        "clarity": {"zh": "调粗/稍高水温/避免过萃", "en": "coarser / slightly higher temp / avoid over-extraction"},
    }
    if taste_preference and taste_preference in taste_map:
        lines += ["", f"### {L['taste']} ({taste_preference})", _t(taste_map[taste_preference], lang)]
    if not (roast_level or origin or process):
        lines += ["", f"> {L['none']}"]
    return "\n".join(lines)


@mcp.tool()
def get_flavor_wheel(category: str = "", language: str = "zh") -> str:
    """查询 SCA 风味轮类别与描述词 / Query SCA flavor wheel categories & descriptors.

    Args:
        category: 类别筛选(可选) / optional category filter, e.g. "水果"/"Fruit","花香"/"Floral"
        language: 输出语言 / output language: zh or en (默认 zh)
    Returns: 风味轮类别与描述词 (localized).
    """
    lang = language if language in ("zh", "en") else "zh"
    L = {"zh": {"title": "SCA 咖啡风味轮", "struct": "风味轮采用同心圆辐射结构,由内向外分层:",
                "nine": "九大类别与描述词", "gap": "「缝隙距离」原理",
                "g1": "两风味项缝隙越窄 -> 越相似", "g2": "缝隙越宽 -> 差异越大",
                "g3": "从中心向外:先确定基本味觉->找所属大类->定位具体描述词", "inner": "最内圈:五种基本味觉(甜/酸/咸/苦/鲜)",
                "r1": "第一环:九大类别", "r2": "第二环:子类", "r3": "最外圈:约99种描述词",
                "nf": "未找到类别", "avail": "可用类别"},
         "en": {"title": "SCA Coffee Flavor Wheel", "struct": "Concentric radial structure, innermost out:",
                "nine": "Nine categories & descriptors", "gap": "'Gap distance' principle",
                "g1": "Narrower gap -> more similar", "g2": "Wider gap -> more different",
                "g3": "Search from center: base taste -> category -> specific descriptor", "inner": "Innermost: 5 basic tastes (sweet/sour/salty/bitter/umami)",
                "r1": "1st ring: 9 categories", "r2": "2nd ring: sub-groups", "r3": "Outermost: ~99 descriptors",
                "nf": "Category not found", "avail": "Available categories"}}[lang]
    lines = [f"## {L['title']}", "", L['struct'], f"- {L['inner']}", f"- {L['r1']}", f"- {L['r2']}", f"- {L['r3']}",
             "", f"### {L['nine']}", ""]
    cat_low = category.lower() if category else ""
    found = False
    for zh_cat, en_cat, flavors in FLAVOR_WHEEL:
        name = zh_cat if lang == "zh" else en_cat
        if cat_low and not (category in (zh_cat, en_cat) or cat_low in (zh_cat.lower(), en_cat.lower())):
            continue
        found = True
        lines.append(f"**{name}**: {', '.join(_t(flavors, lang))}")
    if cat_low and not found:
        avail = ", ".join((zh_c if lang == "zh" else en_c) for zh_c, en_c, _ in FLAVOR_WHEEL)
        lines.append(f"{L['nf']} '{category}'. {L['avail']}: {avail}")
    lines += ["", f"### {L['gap']}", f"- {L['g1']}", f"- {L['g2']}", f"- {L['g3']}"]
    return "\n".join(lines)

SENSORY = _load_data("sensory.json")



@mcp.tool()
def get_sensory_training(training_type: str = "overview", language: str = "zh") -> str:
    """获取感官训练方案 / Get a coffee sensory training plan.

    Args:
        training_type: 训练类型 / type: overview, taste, olfactory, cupping, memory
        language: 输出语言 / output language: zh or en (默认 zh)
    Returns: 系统化感官训练方案 (localized).
    """
    lang = language if language in ("zh", "en") else "zh"
    entry = SENSORY.get(training_type, SENSORY["overview"])
    return entry.get(lang, entry["zh"])


@mcp.tool()
def get_learning_resources(level: str = "beginner", language: str = "zh") -> str:
    """按阶段推荐学习资源 / Recommend learning resources by stage.

    Args:
        level: 学习阶段 / stage: beginner/intermediate/professional, or 'all'
        language: 输出语言 / output language: zh or en (默认 zh)
    Returns: 学习资源列表与路线图 (localized).
    """
    lang = language if language in ("zh", "en") else "zh"
    lob = {"zh": {"beginner": "入门级", "intermediate": "进阶级", "professional": "专业级", "title": "咖啡学习资源推荐",
                  "roadmap": "三阶段成长路线图", "res": "资源", "type": "类型", "feat": "特点"},
           "en": {"beginner": "Beginner", "intermediate": "Intermediate", "professional": "Professional", "title": "Coffee learning resources",
                  "roadmap": "Three-stage roadmap", "res": "Resource", "type": "Type", "feat": "Highlights"}}[lang]
    lines = [f"## {lob['title']}", ""]
    def table(lvl):
        res = LEARNING_RESOURCES.get(lvl, [])
        lines.append(f"### {lob.get(lvl, lvl)}\n")
        lines.append(f"| {lob['res']} | {lob['type']} | {lob['feat']} |")
        lines.append("|------|------|------|")
        for r in res:
            lines.append(f"| {r['name']} | {_t(r['type'], lang)} | {_t(r['desc'], lang)} |")
        lines.append("")
    if level == "all":
        for lvl in ("beginner", "intermediate", "professional"):
            table(lvl)
    else:
        table(level)
    lines += [f"### {lob['roadmap']}",
              (f"1. 入门(0-3月): 咖啡沙龙+中国咖啡网 -> 掌握2种冲煮法 -> 建立基础风味词汇\n"
               f"2. 进阶(3-12月): Barista Hustle萃取理论 -> 系统杯测练习 -> SCA Brewing Foundation\n"
               f"3. 专业(12月+): SCA Sensory Skills全级别 -> Q-Grader认证 -> Le Nez du Cafe 36味训练"
               if lang == "zh"
               else f"1. Beginner (0-3m): Coffeesalon + gafei.com -> master 2 brew methods -> basic flavor vocab\n"
                    f"2. Intermediate (3-12m): Barista Hustle extraction theory -> systematic cupping -> SCA Brewing Foundation\n"
                    f"3. Professional (12m+): SCA Sensory Skills full -> Q-Grader cert -> Le Nez du Cafe 36-aroma training")]
    return "\n".join(lines)
@mcp.tool()
def search_references(query: str, language: str = "zh", top_k: int = 3) -> str:
    """精确定位与漂移对因 reference 文档的全文关键词检索。

    检索范围涵盖 references/ 目录下 37 篇中/英 reference 文档（23 cn + 14 en）。
    提供三条命中项 + 文件名，让服务器端与 client 端可快速定位知识来源。
    Returns top_k reference matches with file names and matched excerpts.
    """
    import pathlib, re, fnmatch

    L = lambda en, zh: en if language == "en" else zh
    REFS = pathlib.Path(__file__).resolve().parent.parent / "references"
    if not REFS.exists():
        return L(
            "references/ directory missing; no docs to search.",
            "references/ 目录缺失，无文档可搜索。",
        )

    # Collect all md files under references/ and references/en/
    files = {}
    for base in [REFS, REFS / "en"]:
        if base.exists():
            for p in base.glob("*.md"):
                name = p.stem  # e.g. "recipes-baseline"
                if name not in files:
                    files[name] = []
                files[name].append(p)

    if not files:
        return L(
            "No .md files found under references/.",
            "references/ 下未找到任何 .md 文件。",
        )

    # Score each file: title match weight + body match count
    terms = query.lower().split()
    scored = []
    for name, paths in files.items():
        # Use the zh path if available, else first available
        zh_path = next((p for p in paths if "/en/" not in str(p)), paths[0])
        content = zh_path.read_text("utf-8")
        title_hit = sum(1 for t in terms if t in name.lower()) * 3
        body_hit = sum(1 for t in terms if t in content.lower()[:2000])
        score = title_hit + body_hit
        if score > 0:
            scored.append((score, name, paths, content))

    if not scored:
        return L(
            f'No reference files matched query "{query}". Try broader terms.',
            f'引用文档中未找到与 "{query}" 匹配的参考文件。尝试更宽泛的关键词。',
        )

    # Sort by score descending, take top_k
    scored.sort(reverse=True, key=lambda x: x[0])
    top = scored[:top_k]

    header = L(
        "## Search results ({0} of {1} references matched)",
        "## 检索结果（命中 {0}/{1} 份参考文档）",
    ).format(len(scored), len(files))
    lines = [header, ""]
    lines.append("")

    for rank, (score, name, paths, content) in enumerate(top, 1):
        names = sorted(set(p.name for p in paths))
        line_head = L(
            f"### {rank}. {name}.md ({score} hits) — {', '.join(names)}",
            f"### {rank}. {name}.md（{score} 命中）— {', '.join(names)}",
        )
        lines.append(line_head)
        # Truncate excerpt: first 12 non-empty lines, max 300 chars
        excerpt_lines = []
        for ln in content.splitlines()[:15]:
            if ln.strip():
                excerpt_lines.append(ln.strip()[:300])
            if len(excerpt_lines) >= 10:
                break
        excerpt = '\n'.join(excerpt_lines)
        lines.extend([excerpt, ""])

    lines.append(L(
        "> Tip: content snapshots are dated 2026-07-17. Online verification recommended for champion recipes and pressure profiles.",
        "> 提示：参考内容为 2026-07-17 快照。冠军配方与变压曲线建议联网核实最新数据。",
    ))
    return "\n".join(lines)


# --- v3.0 SCA / Q-Grader / CVA / Green Coffee tools -------------------------


@mcp.tool()
def get_sca_path(language: str = "zh") -> str:
    """SCA 认证全景图：CSP 六模块 + Q-Grader 独立认证 / SCA certification landscape.

    Args:
        language: 输出语言 / output language: zh or en (default zh)
    Returns: Markdown 路线图 (localized).
    """
    lang = language if language in ("zh", "en") else "zh"
    L = lambda en, zh: en if lang == "en" else zh
    lines = [f"## {L('SCA Certification Landscape', 'SCA 认证全景图')}", ""]
    csp = SCA_CERTIFICATION.get("csp_modules", {})
    lines.append(f"### {L('CSP Six Modules', 'CSP 六大模块')}")
    lines.append(f"| {L('Module', '模块')} | {L('Levels', '级别')} | {L('For', '适合')} |")
    lines.append("|------|------|------|")
    for m in csp.get("modules", []):
        levels = "/".join(m.get("levels", []))
        lines.append(f"| {_t(m['name'], lang)} | {levels} | {_t(m.get('for_whom', ''), lang)} |")
    qg = SCA_CERTIFICATION.get("qgrader", {})
    cur = qg.get("current", {})
    lines += ["", f"### {L('Q-Grader (standalone)', 'Q-Grader（独立认证）')}",
              f"- {_t(cur.get('name', {}), lang)}",
              f"- {L('Issuer', '颁发')}: {_t(cur.get('issuer', {}), lang)}",
              f"- {L('Validity', '有效期')}: {cur.get('validity_years', 3)} {L('years', '年')}",
              f"- {L('Based on', '基于')}: {cur.get('based_on', 'CVA')}",
              f"- {L('See qgrader-complete-guide.md for exam details', '详见 qgrader-complete-guide.md 考试详情')}"]
    lines += ["", f"> {_t(csp.get('_intro', {}), lang)}"]
    return "\n".join(lines)


@mcp.tool()
def get_sca_course(module: str, level: str = "foundation", language: str = "zh") -> str:
    """查询 CSP 某模块某级别课程详情 / Get CSP module-level course detail.

    Args:
        module: 模块 id / module id: introduction_to_coffee, barista_skills, brewing,
            sensory_skills, roasting, green_coffee (6 modules)
        level: 级别 / level: foundation / intermediate / professional
        language: 输出语言 / output language: zh or en (default zh)
    Returns: 课程详情 (localized JSON).
    """
    lang = language if language in ("zh", "en") else "zh"
    modules = SCA_CERTIFICATION.get("csp_modules", {}).get("modules", [])
    m = next((x for x in modules if x["id"] == module), None)
    if not m:
        avail = ", ".join(x["id"] for x in modules)
        err = f"未找到模块 '{module}'。可用: {avail}" if lang == "zh" else f"Module '{module}' not found. Available: {avail}"
        return json.dumps({"ok": False, "error": err}, ensure_ascii=False, indent=2)
    if level not in m.get("levels", []):
        err = f"模块 '{module}' 不含级别 '{level}'。可用: {', '.join(m['levels'])}" if lang == "zh" else f"Module '{module}' has no level '{level}'. Available: {', '.join(m['levels'])}"
        return json.dumps({"ok": False, "error": err}, ensure_ascii=False, indent=2)
    dh = m.get("duration_hours")
    if isinstance(dh, dict):
        dh_val = dh.get(level, dh.get("foundation"))
    else:
        dh_val = dh
    prereq = m.get("prerequisite")
    if isinstance(prereq, dict):
        prereq_val = prereq.get(level)
    else:
        prereq_val = prereq
    fields = {
        "module": module, "level": level,
        "name": _t(m["name"], lang),
        "desc": _t(m.get("desc", ""), lang),
        "duration_hours": dh_val,
        "for_whom": _t(m.get("for_whom", ""), lang),
        "prerequisite": prereq_val,
    }
    return json.dumps(fields, ensure_ascii=False, indent=2)


@mcp.tool()
def get_qgrader_exam(category: str = "all", language: str = "zh") -> str:
    """查询 Q-Grader 考试 8 大类详情 / Get Q-Grader exam categories (8 categories).

    Args:
        category: 类别 id / category id: written_general_knowledge,
            sensory_skill_gustation, olfactory_Le_Nez, cupping_scoring,
            triangulation, organic_acid_matching, green_coffee_grading,
            roasted_coffee_identification  or 'all' (default all)
        language: 输出语言 / output language: zh or en (default zh)
    Returns: 考试单元详情 (localized JSON).
    """
    lang = language if language in ("zh", "en") else "zh"
    cats = QGRADER_EXAMS.get("exam_categories", [])
    if category == "all":
        summary = [{"id": c["id"], "name": _t(c["name"], lang),
                     "unit_count": c.get("unit_count", c.get("unit_count_range"))} for c in cats]
        return json.dumps({"categories": summary, "total_range": QGRADER_EXAMS.get("total_units_summary", {})}, ensure_ascii=False, indent=2)
    c = next((x for x in cats if x["id"] == category), None)
    if not c:
        avail = ", ".join(x["id"] for x in cats)
        err = f"未找到考试类别 '{category}'。可用: {avail}" if lang == "zh" else f"Exam category '{category}' not found. Available: {avail}"
        return json.dumps({"ok": False, "error": err}, ensure_ascii=False, indent=2)
    fields = {
        "id": c["id"], "name": _t(c["name"], lang),
        "unit_count": c.get("unit_count", c.get("unit_count_range")),
        "format": _t(c.get("format", ""), lang),
        "pass_threshold": _t(c.get("pass_threshold", ""), lang),
    }
    if "calibration" in c:
        fields["calibration"] = _t(c["calibration"], lang)
    if "sub_units" in c:
        fields["sub_units"] = [{"id": s["id"], "label": _t(s["label"], lang)} for s in c["sub_units"]]
    if "see_also" in c:
        fields["see_also"] = c["see_also"]
    return json.dumps(fields, ensure_ascii=False, indent=2)


@mcp.tool()
def get_qgrader_study_plan(days: int = 30, focus: str = "all", language: str = "zh") -> str:
    """按天数生成 Q-Grader 备考计划 / Generate a Q-Grader study plan by days.

    Args:
        days: 备考总天数 / total days (default 30; range 14-180)
        focus: 重点 / focus: all, written, gustation, olfactory, cupping,
            triangulation, acids, green, roast (default all)
        language: 输出语言 / output language: zh or en (default zh)
    Returns: 分日备考计划 (localized Markdown).
    """
    lang = language if language in ("zh", "en") else "zh"
    if days < 14 or days > 180:
        err = f"days 应在 14-180 范围，收到 {days}" if lang == "zh" else f"days should be 14-180, got {days}"
        return json.dumps({"ok": False, "error": err}, ensure_ascii=False, indent=2)
    WEIGHTS = {
        "written_general_knowledge": 0.10, "sensory_skill_gustation": 0.15,
        "olfactory_Le_Nez": 0.20, "cupping_scoring": 0.15, "triangulation": 0.15,
        "organic_acid_matching": 0.08, "green_coffee_grading": 0.10,
        "roasted_coffee_identification": 0.07,
    }
    FOCUS_MAP = {"written": "written_general_knowledge", "gustation": "sensory_skill_gustation",
                 "olfactory": "olfactory_Le_Nez", "cupping": "cupping_scoring",
                 "triangulation": "triangulation", "acids": "organic_acid_matching",
                 "green": "green_coffee_grading", "roast": "roasted_coffee_identification"}
    if focus != "all" and focus in FOCUS_MAP:
        fk = FOCUS_MAP[focus]
        focused = {k: (0.6 if k == fk else 0.4 / 7) for k in WEIGHTS}
    else:
        focused = WEIGHTS
    alloc = {k: max(1, round(days * w)) for k, w in focused.items()}
    diff = days - sum(alloc.values())
    if diff != 0:
        max_key = max(focused, key=focused.get)
        alloc[max_key] += diff
    L = lambda en, zh: en if lang == "en" else zh
    lines = [f"## {L('Q-Grader Study Plan', 'Q-Grader 备考计划')} ({days} {L('days', '天')})", ""]
    day_start = 1
    for cat_id, cat_days in alloc.items():
        cat = next((x for x in QGRADER_EXAMS.get("exam_categories", []) if x["id"] == cat_id), None)
        if not cat:
            continue
        cat_name = _t(cat["name"], lang)
        day_end = day_start + cat_days - 1
        lines.append(f"### {L('Day', '第')} {day_start}-{day_end} {L(':', '天：')} {cat_name} ({cat_days} {L('days', '天')})")
        study = QGRADER_STUDY.get("by_exam_category", {}).get(cat_id, {})
        for group_key in ("official", "community_curated", "tool", "alternative", "practice"):
            for s in study.get(group_key, []):
                lines.append(f"- [{s.get('name', '')}]({s.get('url', '')}) — {_t(s.get('desc', ''), lang)}")
        if "see_also" in study:
            sa = study["see_also"]
            if isinstance(sa, str):
                lines.append(f"- {L('See also', '详见')}: {sa}")
        day_start = day_end + 1
    lines += ["", f"> {L('Q-Grader certification valid 3 years; recert includes CVA updates.', 'Q-Grader 认证有效期 3 年，重新认证含 CVA 更新模块。')}"]
    return "\n".join(lines)


@mcp.tool()
def get_green_grade(primary_count: int = 0, secondary_count: int = 0,
                    screen_size: int = 0, moisture_pct: float = 0.0,
                    language: str = "zh") -> str:
    """按 SCA 标准评估生豆等级 / Evaluate green coffee grade per SCA.

    Args:
        primary_count: 一级瑕疵总数（350g 样品） / primary defect count (per 350g)
        secondary_count: 二级瑕疵同类计数（每 5 个 = 1 个完整缺陷当量） / secondary raw count
        screen_size: 筛网目数 / screen size (e.g. 18)
        moisture_pct: 含水率 % / moisture % (e.g. 11.0)
        language: 输出语言 / output language: zh or en (default zh)
    Returns: 等级判定 + 瑕疵详情 (localized JSON).
    """
    lang = language if language in ("zh", "en") else "zh"
    if primary_count < 0 or secondary_count < 0:
        err = "瑕疵数不能为负" if lang == "zh" else "Defect counts cannot be negative"
        return json.dumps({"ok": False, "error": err}, ensure_ascii=False, indent=2)
    warnings = []
    sec_equiv = secondary_count // 5
    full_equiv = primary_count + sec_equiv
    grade = "off_grade"
    grade_label = ""
    for g in GREEN_GRADING.get("grade_table", []):
        pm = g.get("primary_max", 0)
        sm = g.get("secondary_max", 0)
        if pm == -1 or sm == -1:
            continue
        if primary_count <= pm and sec_equiv <= sm:
            grade = g["grade"]
            grade_label = _t(g["label"], lang)
            break
    if not grade_label:
        for g in GREEN_GRADING.get("grade_table", []):
            if g["grade"] == grade:
                grade_label = _t(g["label"], lang)
                break
    moisture_ok = True
    if moisture_pct > 0 and (moisture_pct < 10 or moisture_pct > 12):
        moisture_ok = False
        warnings.append(f"含水率 {moisture_pct}% 超出 10-12% 区间" if lang == "zh" else f"Moisture {moisture_pct}% outside 10-12%")
    screen_note = ""
    if screen_size > 0:
        if screen_size >= 18:
            screen_note = "精品级筛网" if lang == "zh" else "Specialty screen"
        elif screen_size >= 15:
            screen_note = "可接受筛网" if lang == "zh" else "Acceptable screen"
        else:
            screen_note = "筛网偏小" if lang == "zh" else "Screen too small"
    fields = {
        "primary_count": primary_count,
        "secondary_count": secondary_count,
        "secondary_full_equivalent": sec_equiv,
        "full_equivalent_total": full_equiv,
        "grade": grade,
        "grade_label": grade_label,
        "moisture_pct": moisture_pct,
        "moisture_ok": moisture_ok,
        "screen_size": screen_size,
        "screen_note": screen_note,
        "specialty_threshold": _t(GREEN_GRADING.get("specialty_threshold", {}).get("note", ""), lang),
        "warnings": warnings,
    }
    return json.dumps(fields, ensure_ascii=False, indent=2)


@mcp.tool()
def get_defect_bean(defect_id: str = "", category: str = "all", language: str = "zh") -> str:
    """查询 SCA 瑕疵豆分类（一级/二级）/ Query SCA defect bean categories.

    Args:
        defect_id: 瑕疵 id / defect id (empty = list all)
        category: 类别 / category: primary / secondary / all (default all)
        language: 输出语言 / output language: zh or en (default zh)
    Returns: 瑕疵豆详情 (localized JSON).
    """
    lang = language if language in ("zh", "en") else "zh"
    primary = DEFECT_BEANS.get("primary_defects", [])
    secondary = DEFECT_BEANS.get("secondary_defects", [])
    if defect_id:
        all_defs = primary + secondary
        d = next((x for x in all_defs if x["id"] == defect_id), None)
        if not d:
            avail = ", ".join(x["id"] for x in all_defs)
            err = f"未找到瑕疵 id '{defect_id}'。可用: {avail}" if lang == "zh" else f"Defect '{defect_id}' not found. Available: {avail}"
            return json.dumps({"ok": False, "error": err}, ensure_ascii=False, indent=2)
        is_primary = any(x["id"] == defect_id for x in primary)
        fields = {
            "id": d["id"], "name": _t(d["name"], lang),
            "appearance": _t(d.get("appearance", ""), lang),
            "cause": _t(d.get("cause", ""), lang),
            "category": "primary" if is_primary else "secondary",
        }
        if "equivalent_count" in d:
            fields["equivalent_count"] = d["equivalent_count"]
        if "equivalent_count_full" in d:
            fields["equivalent_count_full"] = d["equivalent_count_full"]
        return json.dumps(fields, ensure_ascii=False, indent=2)
    out = []
    if category in ("primary", "all"):
        out += [{"id": d["id"], "name": _t(d["name"], lang), "category": "primary"} for d in primary]
    if category in ("secondary", "all"):
        out += [{"id": d["id"], "name": _t(d["name"], lang), "category": "secondary"} for d in secondary]
    return json.dumps({"defects": out}, ensure_ascii=False, indent=2)


@mcp.tool()
def calculate_cva_score(affective_overall: float, descriptive_richness: float = 0.0,
                        extrinsic_score: float = 0.0, language: str = "zh") -> str:
    """计算 CVA 情感评估总分 + 旧 100 分制对照 / Compute CVA Affective score + legacy 100-pt mapping.

    CVA SCA-104 Affective Assessment uses 1-9 scale (1-3 bad / 4-6 average / 7-9 excellent).

    Args:
        affective_overall: 情感总分 (1-9) / affective overall (1-9)
        descriptive_richness: 描述性丰富度 (0-15, optional) / descriptive richness
        extrinsic_score: 外在属性分 (0-100, optional) / extrinsic score
        language: 输出语言 / output language: zh or en (default zh)
    Returns: CVA 评估结果 (localized Markdown).
    """
    lang = language if language in ("zh", "en") else "zh"
    L = lambda en, zh: en if lang == "en" else zh
    warnings = []
    if affective_overall < 1 or affective_overall > 9:
        warnings.append(f"affective_overall={affective_overall} 超出 1-9 范围" if lang == "zh" else f"affective_overall={affective_overall} out of 1-9")
    legacy_100 = (affective_overall - 1) / 8 * 100
    cva_table = SCA_CVA.get("affective_to_legacy_100", {})
    band_label = ""
    for entry in cva_table.get("lookup_table", []):
        if entry["affective_9"] == int(round(affective_overall)):
            band_label = _t(entry["band"], lang)
            break
    spec_threshold = cva_table.get("specialty_threshold", {})
    is_specialty = affective_overall >= spec_threshold.get("affective_9", 7)
    lines = [
        f"## {L('CVA Affective Result', 'CVA 情感评估结果')}", "",
        f"| {L('Affective (1-9)', '情感总分 (1-9)')} | {affective_overall:.2f} |",
        f"| {L('Legacy 100-pt', '旧 100 分制对照')} | {legacy_100:.2f} |",
        f"| {L('Band', '评级')} | {band_label} |",
        f"| {L('Specialty', '精品级')} | {'yes' if is_specialty else 'no'} (>={spec_threshold.get('affective_9', 7)}) |",
    ]
    if descriptive_richness > 0:
        lines.append(f"| {L('Descriptive richness', '描述性丰富度')} | {descriptive_richness:.2f} / 15 |")
    if extrinsic_score > 0:
        lines.append(f"| {L('Extrinsic', '外在属性')} | {extrinsic_score:.2f} / 100 |")
    lines += ["", f"### {L('Formula', '换算公式')}", f"`100_pt = (affective_9 - 1) / 8 * 100`"]
    if warnings:
        lines += ["", f"### ! {L('Warnings', '警告')}", "\n".join(warnings)]
    return "\n".join(lines)


@mcp.tool()
def get_triangle_protocol(rounds: int = 4, difficulty: str = "origin",
                          language: str = "zh") -> str:
    """获取 SCA 三角杯测协议 / Get SCA triangle test protocol.

    Args:
        rounds: 轮数 / rounds (default 4; Q-Grader 4-6)
        difficulty: 难度 / difficulty: origin, process, roast, batch (default origin)
        language: 输出语言 / output language: zh or en (default zh)
    Returns: 三角杯测协议详情 (localized JSON).
    """
    lang = language if language in ("zh", "en") else "zh"
    DIFFICULTY_ORDER = {"origin": 1, "process": 2, "roast": 3, "batch": 4}
    if rounds < 1 or rounds > 10:
        err = f"rounds 应在 1-10 范围，收到 {rounds}" if lang == "zh" else f"rounds should be 1-10, got {rounds}"
        return json.dumps({"ok": False, "error": err}, ensure_ascii=False, indent=2)
    if difficulty not in DIFFICULTY_ORDER:
        avail = ", ".join(sorted(DIFFICULTY_ORDER.keys()))
        err = f"未知难度 '{difficulty}'。可用: {avail}" if lang == "zh" else f"Unknown difficulty '{difficulty}'. Available: {avail}"
        return json.dumps({"ok": False, "error": err}, ensure_ascii=False, indent=2)
    pass_count = int(rounds * 0.75)
    fields = {
        "rounds": rounds,
        "difficulty": difficulty,
        "difficulty_progression": "origin -> process -> roast -> batch (easy -> hard)" if lang == "en" else "origin -> process -> roast -> batch（由易到难）",
        "cups_per_round": 3,
        "odd_count": 1,
        "same_count": 2,
        "pass_threshold": f"{pass_count}/{rounds} rounds (75%)" if lang == "en" else f"{pass_count}/{rounds} 轮 (75%)",
        "total_cups": rounds * 3,
        "see_also": "references/triangle-test-protocol.md",
    }
    return json.dumps(fields, ensure_ascii=False, indent=2)


@mcp.tool()
def search_sca_sources(query: str, category: str = "all", language: str = "zh") -> str:
    """检索 SCA / CQI / WCR 官方来源索引 / Search SCA/CQI/WCR source index.

    Args:
        query: 关键词 / query keywords (e.g. "CVA", "defect", "Q-Grader")
        category: 类别筛选 / category filter: association, certification, assessment,
            reference, research, media, cn_community, education (default all)
        language: 输出语言 / output language: zh or en (default zh)
    Returns: 匹配的来源条目 (localized Markdown).
    """
    lang = language if language in ("zh", "en") else "zh"
    terms = query.lower().split()
    matched = []
    for group_key in ("official", "community_curated"):
        for s in SCA_OFFICIAL_SOURCES.get(group_key, []):
            if category != "all" and s.get("category") != category:
                continue
            hay = (s.get("name", "") + " " + _t(s.get("scope", ""), lang) + " " + s.get("url", "")).lower()
            if any(t in hay for t in terms) or not terms:
                matched.append((group_key, s))
    if not matched:
        msg = f"未找到匹配 '{query}' 的来源" if lang == "zh" else f"No sources matched '{query}'"
        return f"## {msg}"
    title = "来源检索结果" if lang == "zh" else "Source search results"
    lines = [f"## {title} ({len(matched)} hits)", ""]
    for group, s in matched:
        lines.append(f"### {_t(s.get('scope', s.get('name', '')), lang)}")
        lines.append(f"- **{s.get('name')}** [{group}]")
        lines.append(f"- URL: {s.get('url')}")
        lines.append(f"- category: {s.get('category')}")
        if "trust" in s:
            lines.append(f"- trust: {s.get('trust')}")
        lines.append("")
    return "\n".join(lines)


def main() -> None:
    """Entry point used by the console script `barista-mcp`."""
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
