#!/usr/bin/env python3
"""Barista Skill MCP Server (bilingual zh/en).

Wraps the barista coffee-coach skill as a Model Context Protocol (MCP) service.
9 tools cover coffee brewing, flavor diagnosis, SCA cupping scoring, grinder
calibration, parameter tuning, the flavor wheel, sensory training, classic milk
drinks, and learning resources. Every tool takes a `language` argument ("zh" or
"en") and returns localized output; data falls back to Chinese.

Compatible with any MCP client (Claude Desktop / TRAE / Cursor / VS Code ...).
"""

from pathlib import Path
from mcp.server.fastmcp import FastMCP


def _t(field, lang):
    """Localize a {zh, en} dict; fall back to zh then the raw value."""
    if isinstance(field, dict):
        return field.get(lang, field.get("zh", ""))
    return field


REFERENCES_DIR = Path(__file__).resolve().parent.parent / "references"


# 14 brewing methods - stable starter parameters (bilingual)
RECIPES = {
    "espresso": {
        "name": {"zh": "意式浓缩", "en": "Espresso"},
        "dose": "18g", "yield": {"zh": "约36g (1:2)", "en": "~36g (1:2)"},
        "temp": "92-94C", "time": {"zh": "25-30秒", "en": "25-30s"},
        "grind": {"zh": "中等偏细", "en": "medium-fine"},
        "gear": {"zh": "半自动咖啡机+手柄/粉碗+磨豆机", "en": "semi-auto machine+portafilter+grinder"},
        "steps": {"zh": "称18g粉→铺平→轻压→开机计时→到36g停(约27秒)",
                  "en": "Weigh 18g→level→light tamp→start & time→stop at 36g (~27s)"},
        "adjust_bitter": {"zh": "粉磨粗一点(苦调粗)", "en": "grind coarser"},
        "adjust_sour": {"zh": "粉磨细一点(酸调细)", "en": "grind finer"},
    },
    "pour_over": {
        "name": {"zh": "手冲", "en": "Pour-over"},
        "dose": "15g", "yield": {"zh": "240g (1:16)", "en": "240g (1:16)"},
        "temp": {"zh": "90-92C(深烘88,浅烘93)", "en": "90-92C (dark 88, light 93)"},
        "time": {"zh": "2:30-3:30", "en": "2:30-3:30"},
        "grind": {"zh": "中等(粗砂糖)", "en": "medium (raw sugar)"},
        "gear": {"zh": "手冲壶+滤杯(V60)+滤纸+磨豆机+秤", "en": "kettle+dripper(V60)+filter+grinder+scale"},
        "steps": {"zh": "粉入滤杯→先倒30g水闷蒸30秒→分2-3次画圈加水到240g→等滤完",
                  "en": "Add grounds→bloom 30g 30s→pour 2-3 stages to 240g→let drip"},
        "adjust_bitter": {"zh": "粉磨粗一点", "en": "grind coarser"},
        "adjust_sour": {"zh": "粉磨细一点", "en": "grind finer"},
    },
    "french_press": {
        "name": {"zh": "法压壶", "en": "French Press"},
        "dose": "15g", "yield": "250g", "temp": "93C",
        "time": {"zh": "浸泡4分钟", "en": "steep 4 min"},
        "grind": {"zh": "粗研磨(海盐)", "en": "coarse (sea salt)"},
        "gear": {"zh": "法压壶+磨豆机+秤", "en": "French press+grinder+scale"},
        "steps": {"zh": "粉水混合→浸泡4分钟→压下→倒出", "en": "Mix→steep 4 min→press→pour"},
        "adjust_bitter": {"zh": "粉磨更粗", "en": "grind coarser"},
        "adjust_sour": {"zh": "粉磨细一点或延长浸泡", "en": "grind finer or steep longer"},
    },
    "aeropress": {
        "name": {"zh": "爱乐压", "en": "AeroPress"},
        "dose": "15-17g", "yield": "220-250g",
        "temp": {"zh": "80-90C(深烘低,浅烘高)", "en": "80-90C (dark lower, light higher)"},
        "time": {"zh": "浸泡1分钟+压20-30秒", "en": "steep 1 min + press 20-30s"},
        "grind": {"zh": "中细(比手冲细,比意式粗)", "en": "medium-fine"},
        "gear": {"zh": "爱乐压+滤纸/金属滤+磨豆机", "en": "AeroPress+paper/metal filter+grinder"},
        "steps": {"zh": "装粉倒水→搅两下→闷1分钟→盖滤盖慢慢压(20-30秒)",
                  "en": "Add grounds & water→stir→steep 1 min→press slowly (20-30s)"},
        "adjust_bitter": {"zh": "粉磨粗一点或水降温", "en": "grind coarser or lower temp"},
        "adjust_sour": {"zh": "粉磨细一点或水升温", "en": "grind finer or raise temp"},
    },
    "moka_pot": {
        "name": {"zh": "摩卡壶", "en": "Moka Pot"},
        "dose": "18-20g", "yield": {"zh": "下壶冷水至安全阀下", "en": "cold water below safety valve"},
        "temp": {"zh": "中小火", "en": "medium-low heat"},
        "time": {"zh": "出咖啡1-2分钟", "en": "1-2 min flow"},
        "grind": {"zh": "中细(细砂糖偏细)", "en": "medium-fine"},
        "gear": {"zh": "摩卡壶+磨豆机+热源", "en": "moka pot+grinder+stove"},
        "steps": {"zh": "下壶加冷水→粉碗装粉铺平别压→拧紧→中小火→出咖啡转最小火→咕噜声立刻关火",
                  "en": "Cold water→fill basket level, no tamp→tighten→medium heat→low on flow→cut at gurgle"},
        "adjust_bitter": {"zh": "火关小/粉磨粗/别煮到咕噜太久", "en": "lower heat / coarser / stop before gurgle"},
        "adjust_sour": {"zh": "—", "en": "—"},
    },
    "cold_brew": {
        "name": {"zh": "冷萃", "en": "Cold Brew"},
        "dose": "50-70g", "yield": "500-700g",
        "temp": {"zh": "常温水或冷水", "en": "room temp or cold water"},
        "time": {"zh": "冰箱12-24小时", "en": "fridge 12-24h"},
        "grind": {"zh": "粗研磨(海盐)", "en": "coarse (sea salt)"},
        "gear": {"zh": "带盖容器/瓶+滤网/滤袋+冰箱", "en": "lidded jar+strainer+fridge"},
        "steps": {"zh": "粉水搅匀→盖好放冰箱→时间到过滤即可", "en": "Stir grounds & water→cover→fridge→strain"},
        "adjust_bitter": {"zh": "粉磨更粗或时间缩短", "en": "coarser or shorter time"},
        "adjust_sour": {"zh": "粉磨细一点或延长时间", "en": "finer or longer time"},
    },
    "ice_drip": {
        "name": {"zh": "冰滴", "en": "Ice Drip / Cold Drip"},
        "dose": "40-60g", "yield": {"zh": "400-600g冰水", "en": "400-600g ice water"},
        "temp": {"zh": "冰水混合", "en": "ice water"}, "time": {"zh": "4-8小时(每秒1滴)", "en": "4-8h (1 drop/sec)"},
        "grind": {"zh": "中粗研磨", "en": "medium-coarse"},
        "gear": {"zh": "冰滴塔/壶+冰+滤纸/滤网", "en": "ice drip tower+ice+filter"},
        "steps": {"zh": "粉铺平→调阀门让冰水慢滴→接住咖啡→冷藏后喝", "en": "Level grounds→slow ice-water drip→collect→chill"},
        "adjust_bitter": {"zh": "粉磨粗/冰水多加水", "en": "coarser / more water"},
        "adjust_sour": {"zh": "阀门调慢/粉磨细", "en": "slower valve / finer"},
    },
    "clever_dripper": {
        "name": {"zh": "聪明杯", "en": "Clever Dripper"},
        "dose": "15-20g", "yield": "240-300g", "temp": "90-93C",
        "time": {"zh": "浸泡2-3分钟", "en": "steep 2-3 min"},
        "grind": {"zh": "中研磨(粗砂糖)", "en": "medium (raw sugar)"},
        "gear": {"zh": "聪明杯+滤纸+秤+磨豆机", "en": "Clever Dripper+filter+scale+grinder"},
        "steps": {"zh": "放滤纸加粉→倒水到目标量→盖好闷2-3分钟→放到杯上打开阀门滴下",
                  "en": "Filter & grounds→pour to target→cover steep 2-3 min→set on cup to drain"},
        "adjust_bitter": {"zh": "粉磨粗", "en": "coarser"},
        "adjust_sour": {"zh": "粉磨细", "en": "finer"},
    },
    "iced_pour_over": {
        "name": {"zh": "冰手冲", "en": "Iced Pour-over"},
        "dose": "15g", "yield": {"zh": "冰约100g+热水150g", "en": "ice ~100g + hot 150g"},
        "temp": {"zh": "90-93C(浅烘可高)", "en": "90-93C (light higher)"}, "time": {"zh": "同热手冲", "en": "same as pour-over"},
        "grind": {"zh": "中细", "en": "medium-fine"},
        "gear": {"zh": "滤杯+滤纸+手冲壶+冰杯+冰", "en": "dripper+filter+kettle+iced cup+ice"},
        "steps": {"zh": "粉入滤杯→少量水闷蒸30s→分次注水→直接落在冰上冷却", "en": "Bloom 30s→pour in stages→drip onto ice"},
        "adjust_bitter": {"zh": "粉磨粗", "en": "coarser"},
        "adjust_sour": {"zh": "粉磨细", "en": "finer"},
    },
    "drip_bag": {
        "name": {"zh": "挂耳咖啡", "en": "Drip Bag"},
        "dose": "10g", "yield": {"zh": "150g (1:15)", "en": "150g (1:15)"}, "temp": "90-93C",
        "time": {"zh": "2-3分钟", "en": "2-3 min"}, "grind": {"zh": "中研磨(厂定)", "en": "medium (factory)"},
        "gear": {"zh": "挂耳包+杯+热水", "en": "drip bag+mug+hot water"},
        "steps": {"zh": "撕开挂耳架在杯口→先倒20-30g水闷蒸20秒→分2-3次加水到150g→取下丢弃",
                  "en": "Tear & hang→bloom 20-30g 20s→pour 2-3 stages to 150g→discard"},
        "adjust_bitter": {"zh": "粉是固定的,多加水/水温降一点", "en": "grounds fixed; add water or lower temp a touch"},
        "adjust_sour": {"zh": "少加水/水温升一点", "en": "less water or raise temp a touch"},
    },
    "syphon": {
        "name": {"zh": "虹吸壶(赛风)", "en": "Syphon (Siphon)"},
        "dose": "20g", "yield": {"zh": "300g (1:15)", "en": "300g (1:15)"},
        "temp": {"zh": "沸腾后约90-95C", "en": "~90-95C after boil"},
        "time": {"zh": "上壶浸泡60-90秒", "en": "steep 60-90s upper"},
        "grind": {"zh": "中研磨(粗砂糖)", "en": "medium (raw sugar)"},
        "gear": {"zh": "虹吸壶+酒精灯/瓦斯炉+滤布/滤芯+搅拌棒", "en": "syphon+burner+cloth/steel filter+stirrer"},
        "steps": {"zh": "下壶加水加热→水上升上壶→加粉搅拌→浸泡60-90秒→离火→咖啡回落下壶→倒出",
                  "en": "Heat lower→rises→add grounds & stir→steep 60-90s→off heat→draws down→pour"},
        "adjust_bitter": {"zh": "缩短浸泡/搅拌轻一点", "en": "shorter steep / gentler stir"},
        "adjust_sour": {"zh": "延长浸泡/多搅拌", "en": "longer steep / stir more"},
    },
    "turkish": {
        "name": {"zh": "土耳其咖啡", "en": "Turkish Coffee (Cezve/Ibrik)"},
        "dose": "10g", "yield": {"zh": "120g (1:12)", "en": "120g (1:12)"},
        "temp": {"zh": "煮至近沸不起沫", "en": "heat to near-boil, no overflow"},
        "time": {"zh": "6-8分钟", "en": "6-8 min"},
        "grind": {"zh": "极细(面粉状)", "en": "extra-fine (flour)"},
        "gear": {"zh": "铜壶(cezve/ibrik)+小热源", "en": "cezve/ibrik+low heat"},
        "steps": {"zh": "壶加冷水+粉+糖搅匀→小火加热→起沫快离火→重复2-3次→静置1分钟倒出(含细粉不滤)",
                  "en": "Cold water+grounds+sugar→low heat→foam rises, lift off→repeat 2-3×→rest 1 min→pour with grounds"},
        "adjust_bitter": {"zh": "火更小/少起沫次数", "en": "lower heat / fewer foam cycles"},
        "adjust_sour": {"zh": "多煮一会/再多重复一次起沫", "en": "cook longer / one more foam cycle"},
    },
    "flash_brew": {
        "name": {"zh": "闪萃/日式冰冲", "en": "Flash Brew (Japanese iced)"},
        "dose": "20g", "yield": {"zh": "热水200g+冰80g", "en": "hot 200g + ice 80g"},
        "temp": {"zh": "93-96C", "en": "93-96C"}, "time": {"zh": "2:00-3:00", "en": "2:00-3:00"},
        "grind": {"zh": "中细", "en": "medium-fine"},
        "gear": {"zh": "滤杯+滤纸+手冲壶+冰壶+冰", "en": "dripper+filter+kettle+iced carafe+ice"},
        "steps": {"zh": "冰先放壶里→按热手冲流程注水→咖啡直接落在冰上瞬间冷却锁香",
                  "en": "Ice in carafe→pour hot as pour-over→drips onto ice, instant chill locks aroma"},
        "adjust_bitter": {"zh": "粉磨粗", "en": "coarser"},
        "adjust_sour": {"zh": "粉磨细", "en": "finer"},
    },
    "vietnamese_phin": {
        "name": {"zh": "越南咖啡(phin滴漏壶)", "en": "Vietnamese Phin"},
        "dose": "15g", "yield": {"zh": "100g (1:7 浓)", "en": "100g (1:7 strong)"},
        "temp": {"zh": "90-94C", "en": "90-94C"}, "time": {"zh": "3-5分钟滴漏", "en": "3-5 min drip"},
        "grind": {"zh": "中粗(粗砂糖)", "en": "medium-coarse"},
        "gear": {"zh": "越南phin壶+压板+杯+甜炼乳(可选)", "en": "phin filter+press plate+cup+condensed milk (opt.)"},
        "steps": {"zh": "杯底抹炼乳(可选)→phin加粉装压板→倒少量水闷蒸30秒→注满水盖盖→滴漏→搅匀",
                  "en": "Condensed milk (opt.)→add grounds & press plate→bloom 30s→fill & cover→drip→stir"},
        "adjust_bitter": {"zh": "压板松一点/水降温", "en": "loosen plate / lower temp"},
        "adjust_sour": {"zh": "压板紧一点/水升温", "en": "tighten plate / raise temp"},
    },
}


# Classic milk drinks (espresso + milk + foam); ratios cross-checked online
MILK_DRINKS = {
    "macchiato": {
        "name": {"zh": "玛奇朵 Espresso Macchiato", "en": "Espresso Macchiato"},
        "espresso": {"zh": "1份浓缩", "en": "1 shot"},
        "milk": {"zh": "极少(一勺奶/奶泡点缀)", "en": "tiny (a spoon of milk/foam)"},
        "foam": {"zh": "一抹", "en": "a dab"}, "volume": "60-80ml",
        "notes": {"zh": "浓缩为主,奶只'点一下'。注意'拿铁玛奇朵'做法相反,给方案前先确认要哪种。",
                  "en": "Espresso-forward, milk just 'marks'. Latte Macchiato is the reverse; confirm which."},
    },
    "cortado": {
        "name": {"zh": "可塔朵 Cortado", "en": "Cortado"},
        "espresso": {"zh": "1份浓缩", "en": "1 shot"},
        "milk": {"zh": "等量温奶(约40-60g)", "en": "equal warm milk (~40-60g)"},
        "foam": {"zh": "几乎无", "en": "almost none"}, "volume": "90-120ml",
        "notes": {"zh": "浓缩:奶 1:1 最平衡,玻璃小杯;奶只'降强度'不抢味。",
                  "en": "1:1 espresso:milk, balanced small glass; milk only cuts strength, not flavor."},
    },
    "flat_white": {
        "name": {"zh": "澳白 Flat White", "en": "Flat White"},
        "espresso": {"zh": "1份(多用ristretto更浓)", "en": "1 shot (often ristretto for strength)"},
        "milk": {"zh": "微泡奶约100-150ml", "en": "microfoam milk ~100-150ml"},
        "foam": {"zh": "极薄(<=0.5cm,与奶融合)", "en": "very thin (<=0.5cm, integrated)"}, "volume": "150-160ml",
        "notes": {"zh": "重点是'微泡融合'不是厚泡;浓缩突出、丝绒感。别打成卡布。",
                  "en": "Silky integrated microfoam, not thick foam; espresso forward & velvety."},
    },
    "cappuccino": {
        "name": {"zh": "卡布奇诺 Cappuccino", "en": "Cappuccino"},
        "espresso": {"zh": "1份浓缩(双份36-40g)", "en": "1 double shot (36-40g)"},
        "milk": {"zh": "等量热奶(约60ml)", "en": "equal steamed milk (~60ml)"},
        "foam": {"zh": "厚(1-2cm)", "en": "thick (1-2cm)"}, "volume": "150-180ml",
        "notes": {"zh": "1:1:1 三层,厚泡是灵魂。注气3-5秒比拿铁久,55-65C。",
                  "en": "1:1:1 layered; thick foam is the soul. Aerate 3-5s (longer than latte), 55-65C."},
    },
    "latte": {
        "name": {"zh": "拿铁 Caffe Latte", "en": "Caffe Latte"},
        "espresso": {"zh": "1份浓缩", "en": "1 shot"},
        "milk": {"zh": "多奶(约150-240ml)", "en": "lots of milk (~150-240ml)"},
        "foam": {"zh": "薄(0.5-1cm)", "en": "thin (0.5-1cm)"}, "volume": "220-300ml",
        "notes": {"zh": "奶味主导、最顺;注气短、以漩涡加热为主。",
                  "en": "Milk-forward, smoothest; aerate briefly, heat via whirlpool."},
    },
    "mocha": {
        "name": {"zh": "摩卡 Mocha", "en": "Mocha"},
        "espresso": {"zh": "1份浓缩", "en": "1 shot"},
        "milk": {"zh": "热奶+巧克力酱", "en": "steamed milk + chocolate"},
        "foam": {"zh": "薄+巧克力", "en": "thin + chocolate"}, "volume": "200-250ml",
        "notes": {"zh": "杯底放巧克力酱15-30g→加热奶搅匀→倒入浓缩→薄泡→可加鲜奶油。",
                  "en": "Chocolate 15-30g→stir hot milk→pour espresso→thin foam→optional whipped cream."},
    },
    "con_panna": {
        "name": {"zh": "康宝蓝 Espresso Con Panna", "en": "Espresso Con Panna"},
        "espresso": {"zh": "1份(约36g)", "en": "1 shot (~36g)"},
        "milk": {"zh": "—", "en": "—"},
        "foam": {"zh": "打发鲜奶油一坨铺顶", "en": "whipped cream dollop on top"}, "volume": "40-60ml",
        "notes": {"zh": "浓缩打底,鲜奶油(约20-40ml)打至略流动铺顶;别打太硬。",
                  "en": "Espresso base; whipped cream (~20-40ml) just pourable, not stiff."},
    },
    "americano": {
        "name": {"zh": "美式 Americano", "en": "Americano"},
        "espresso": {"zh": "1份浓缩(36g)", "en": "1 shot (36g)"},
        "milk": {"zh": "—(加热水)", "en": "— (add hot water)"}, "foam": {"zh": "—", "en": "—"},
        "volume": "150-250ml",
        "notes": {"zh": "热美式=浓缩+热水150-200ml(1:4-1:6);冰美式=浓缩+冰+冷水200ml。",
                  "en": "Hot = shot + hot water 150-200ml (1:4-1:6); iced = shot + ice + cold water 200ml."},
    },
    "irish_coffee": {
        "name": {"zh": "爱尔兰咖啡 Irish Coffee", "en": "Irish Coffee"},
        "espresso": {"zh": "热咖啡/双份浓缩+水约150ml", "en": "hot coffee/double shot + water ~150ml"},
        "milk": {"zh": "爱尔兰威士忌30-40ml+红糖1茶匙", "en": "Irish whiskey 30-40ml + brown sugar 1 tsp"},
        "foam": {"zh": "打发鲜奶油浮顶层(不搅拌)", "en": "whipped cream floated (un-stirred)"}, "volume": "200ml",
        "notes": {"zh": "含酒精甜饮:温杯→红糖+热咖啡搅匀→加威士忌→鲜奶油勺背引流浮面。",
                  "en": "Alcoholic sweet drink: warm cup→sugar+coffee→whiskey→float cream off spoon back."},
    },
    "vienna": {
        "name": {"zh": "维也纳咖啡 Vienna Coffee", "en": "Vienna Coffee"},
        "espresso": {"zh": "1-2份+热水约100ml(小美式)", "en": "1-2 shots + hot water ~100ml"},
        "milk": {"zh": "大量打发鲜奶油铺顶", "en": "lots of whipped cream on top"},
        "foam": {"zh": "巧克力碎装饰", "en": "chocolate shavings"}, "volume": "200ml",
        "notes": {"zh": "像甜点:小美式→顶部两勺鲜奶油→撒巧克力碎;比康宝蓝奶油更厚。",
                  "en": "Dessert-like: small americano→two spoons cream→chocolate shavings; thicker than con panna."},
    },
    "affogato": {
        "name": {"zh": "阿芙佳朵 Affogato", "en": "Affogato"},
        "espresso": {"zh": "现萃浓缩1份(25-40ml)", "en": "fresh shot (25-40ml)"},
        "milk": {"zh": "香草冰淇淋/gelato 1-2球(50-100g)", "en": "vanilla gelato 1-2 scoops (50-100g)"},
        "foam": {"zh": "—", "en": "—"}, "volume": "—",
        "notes": {"zh": "甜品级:杯先冷冻→舀冰淇淋→立刻现萃浓缩浇上→马上桌配小勺,不搅拌。",
                  "en": "Dessert: chill cup→gelato→pour fresh shot on top→serve at once, do not stir."},
    },
}


# Flavor diagnosis
FLAVOR_DIAGNOSIS = {
    "bitter": {
        "symptoms": ["太苦", "焦苦", "中药味", "焦味", "bitter", "burnt", "ashy"],
        "beginner": {"zh": "粉磨粗一点;缩短时间。口诀:苦调粗", "en": "Grind coarser; shorten time. bitter->coarser"},
        "advanced": {"zh": "调粗研磨/降水温1-2C/缩短时间/降粉量比;排查过萃", "en": "Coarser / drop temp 1-2C / shorter / lower ratio; check over-extraction"},
        "root_cause": {"zh": "碳水化合物过度溶出(过萃)", "en": "Carbohydrates over-extracted (over-extraction)"},
    },
    "sour": {
        "symptoms": ["太酸", "尖酸", "刺舌", "青涩", "sour", "tart", "sharp"],
        "beginner": {"zh": "粉磨细一点;延长时间。口诀:酸调细", "en": "Grind finer; extend time. sour->finer"},
        "advanced": {"zh": "调细研磨/升水温/延长时间/提粉量比;排查欠萃", "en": "Finer / raise temp / longer / raise ratio; check under-extraction"},
        "root_cause": {"zh": "果酸类先溶出但糖类未充分萃取(欠萃)", "en": "Acids extracted but sugars not yet (under-extraction)"},
    },
    "weak": {
        "symptoms": ["淡如水", "没味道", "空", "寡淡", "weak", "watery", "hollow"],
        "beginner": {"zh": "粉磨细一点,或多放粉少放水", "en": "Grind finer, or more grounds less water"},
        "advanced": {"zh": "提高粉量、调细研磨、降低粉水比(1:15->1:14)", "en": "Raise dose, finer, lower ratio (1:15->1:14)"},
        "root_cause": {"zh": "萃取不足或粉水比过高", "en": "Under-extraction or ratio too high"},
    },
    "too_strong": {
        "symptoms": ["太浓", "厚重", "发闷", "strong", "heavy", "muddy"],
        "beginner": {"zh": "粉磨粗一点,或多放水少放粉", "en": "Grind coarser, or more water less grounds"},
        "advanced": {"zh": "降粉量、调粗研磨、提粉水比", "en": "Lower dose, coarser, raise ratio"},
        "root_cause": {"zh": "浓度过高或过萃", "en": "TDS too high or over-extraction"},
    },
    "fast_flow": {
        "symptoms": ["水流太快", "咖啡很稀", "fast", "runs through", "thin"],
        "beginner": {"zh": "粉磨细一点", "en": "Grind finer"},
        "advanced": {"zh": "调细研磨、提粉量、检查布粉均匀度", "en": "Finer, more dose, check distribution"},
        "root_cause": {"zh": "研磨太粗或布粉不均致通道效应", "en": "Too coarse or channeling from poor distribution"},
    },
    "slow_flow": {
        "symptoms": ["水半天流不出", "堵住", "slow", "stalls", "blocked"],
        "beginner": {"zh": "粉磨粗一点", "en": "Grind coarser"},
        "advanced": {"zh": "调粗研磨、减粉量、检查填压力度", "en": "Coarser, less dose, check tamp"},
        "root_cause": {"zh": "研磨太细或粉量过多", "en": "Too fine or too much dose"},
    },
    "astringent": {
        "symptoms": ["涩口", "干巴巴", "刮舌头", "astringent", "dry", "puckering"],
        "beginner": {"zh": "粉磨粗一点,水别太烫", "en": "Grind coarser, lower the temp"},
        "advanced": {"zh": "调粗研磨、降水温、排查通道效应与过萃", "en": "Coarser, lower temp, check channeling & over-extraction"},
        "root_cause": {"zh": "过萃或通道效应致高分子物质过度提取", "en": "Over-extraction/channeling pulls heavy compounds"},
    },
    "aroma_no_flavor": {
        "symptoms": ["闻着香喝着没味", "smells good tastes flat", "no body"],
        "beginner": {"zh": "多放点粉、粉磨细一点", "en": "More grounds, grind finer"},
        "advanced": {"zh": "提粉量、调细研磨、确认水温与新鲜度", "en": "More dose, finer, check temp & freshness"},
        "root_cause": {"zh": "萃取不足或豆子不新鲜", "en": "Under-extraction or stale beans"},
    },
}


# SCA cupping - 10 dimensions (single source of truth)
CUPPING_DIMENSIONS = [
    {"id": "fragrance_aroma", "name": {"zh": "干香/湿香 Fragrance/Aroma", "en": "Fragrance/Aroma"}, "max": 10,
     "type": {"zh": "质量", "en": "quality"},
     "desc": {"zh": "干香=研磨后注水前挥发性香气;湿香=注水破渣后香气", "en": "Dry aroma after grind, before pour; wet aroma after breaking crust"}},
    {"id": "flavor", "name": {"zh": "风味 Flavor", "en": "Flavor"}, "max": 10, "type": {"zh": "质量", "en": "quality"},
     "desc": {"zh": "水溶性滋味+挥发性气味综合感知,含鼻后嗅觉", "en": "Soluble taste + volatile aroma, incl. retronasal"}},
    {"id": "aftertaste", "name": {"zh": "余韵 Aftertaste", "en": "Aftertaste"}, "max": 10, "type": {"zh": "质量", "en": "quality"},
     "desc": {"zh": "吞咽后口腔残留滋味,回甘持久给高分", "en": "Lingering finish after swallow; long sweet finish scores high"}},
    {"id": "acidity", "name": {"zh": "酸质 Acidity", "en": "Acidity"}, "max": 10, "type": {"zh": "质量", "en": "quality"},
     "desc": {"zh": "按酸的品质而非强度评判,明亮果酸为优", "en": "Judge quality not intensity; bright acids score high"}},
    {"id": "body", "name": {"zh": "醇厚度 Body", "en": "Body"}, "max": 10, "type": {"zh": "质量", "en": "quality"},
     "desc": {"zh": "纯触感评估:油脂感、黏度、质量感", "en": "Tactile only: oiliness, viscosity, weight"}},
    {"id": "uniformity", "name": {"zh": "一致性 Uniformity", "en": "Uniformity"}, "max": 10, "type": {"zh": "勾选(5杯x2分)", "en": "check (5 cupsx2pts)"},
     "desc": {"zh": "杯间不一致扣2分/杯", "en": "Inconsistent cups deduct 2pts/cup"}},
    {"id": "balance", "name": {"zh": "平衡感 Balance", "en": "Balance"}, "max": 10, "type": {"zh": "质量", "en": "quality"},
     "desc": {"zh": "各维度是否均衡和谐", "en": "Whether dimensions are in harmony"}},
    {"id": "clean_cup", "name": {"zh": "干净度 Clean Cup", "en": "Clean Cup"}, "max": 10, "type": {"zh": "勾选(5杯x2分)", "en": "check (5 cupsx2pts)"},
     "desc": {"zh": "有缺陷味扣2分/杯", "en": "Taint/fault deducts 2pts/cup"}},
    {"id": "sweetness", "name": {"zh": "甜度 Sweetness", "en": "Sweetness"}, "max": 10, "type": {"zh": "勾选(5杯x2分)", "en": "check (5 cupsx2pts)"},
     "desc": {"zh": "无甜感扣2分/杯", "en": "No sweetness deducts 2pts/cup"}},
    {"id": "overall", "name": {"zh": "总评 Overall", "en": "Overall"}, "max": 10, "type": {"zh": "质量", "en": "quality"},
     "desc": {"zh": "杯测者综合主观评价", "en": "Cupper's holistic subjective evaluation"}},
]


# Grinder calibration references
GRINDER_SETTINGS = {
    "comandante_c40": {
        "name": "Comandante C40", "type": {"zh": "手摇磨", "en": "hand grinder"},
        "settings": {"turkish": "5-10", "espresso": "10-15", "pour_over": "20-25", "french_press": "30-35"},
        "calibration": {"zh": "手摇归零:刀盘完全闭合(听金属摩擦声)=零点->逆时针到目标刻度", "en": "Hand zero: close burrs (metal friction)=zero->counter-clockwise to target"},
    },
    "1zpresso_jx_pro": {
        "name": "1Zpresso JX-Pro", "type": {"zh": "手摇磨", "en": "hand grinder"},
        "settings": {"espresso": "1.0-1.2 turns", "pour_over": "2.0-2.4 turns"},
        "calibration": {"zh": "同C40:刀盘闭合=零点->数圈数", "en": "Same as C40: burrs closed=zero->count turns"},
    },
    "timemore_c3": {
        "name": "Timemore C2/C3", "type": {"zh": "手摇磨", "en": "hand grinder"},
        "settings": {"espresso": "8-10", "pour_over": "14-18"},
        "calibration": {"zh": "归零同上,以刻度数为准", "en": "Zero as above; use click number"},
    },
    "mahlkonig_ek43": {
        "name": {"zh": "Mahlkonig EK43", "en": "Mahlkonig EK43"}, "type": {"zh": "商用电动", "en": "commercial electric"},
        "settings": {"espresso_soe": "1.3-1.8", "pour_over": "7-8.5"},
        "calibration": {"zh": "调到刻度1->拧松旋钮螺丝(2个)->开机顺时针至轻微摩擦->逆时针微调到零界->锁死(Matt Perger'白板笔标记法'需查官方/社区)", "en": "Set to 1->loosen dial screws(2)->powered, close to light friction->open a hair to zero->lock (Matt Perger 'marker method' needs official/community lookup)"},
    },
    "eureka_mignon": {
        "name": "Eureka Mignon (series)", "type": {"zh": "家用电动", "en": "home electric"},
        "settings": {"espresso": {"zh": "零点以上数格范围调整", "en": "a few clicks above zero"}},
        "calibration": {"zh": "找零点(刀盘接触)->以此为基准在意式范围调;改度盘后需校准", "en": "Find zero (burrs touch)->set espresso range; recalibrate after dial swap"},
    },
    "baratza_sette_270": {
        "name": "Baratza Sette 270", "type": {"zh": "家用电动", "en": "home electric"},
        "settings": {"espresso": "5-10"},
        "calibration": {"zh": "螺纹较粗,1档差较大;按杯况微调;Baratza有官方校准视频", "en": "Coarse thread, 1 step = big jump; tune per cup; Baratza has official videos"},
    },
}


# Parameter matrices
PARAMETERS_BY_ROAST = {
    "light": {"solubility": {"zh": "低", "en": "low"}, "water_temp": "93-96C", "grind": {"zh": "偏细", "en": "finer"},
              "time": {"zh": "偏长", "en": "longer"},
              "principle": {"zh": "豆子结构紧密需更多能量;明亮酸质与花香要充分萃取", "en": "Dense structure needs more energy; bright acids & florals need full extraction"},
              "mantra": {"zh": "浅烘磨细温要高", "en": "light roast: finer, higher temp"}},
    "medium": {"solubility": {"zh": "中等", "en": "medium"}, "water_temp": "90-93C", "grind": {"zh": "中等", "en": "medium"},
               "time": {"zh": "标准", "en": "standard"},
               "principle": {"zh": "平衡型,接近金杯标准参数", "en": "balanced, near golden-cup standard"},
               "mantra": "—"},
    "dark": {"solubility": {"zh": "高", "en": "high"}, "water_temp": "88-91C", "grind": {"zh": "偏粗", "en": "coarser"},
             "time": {"zh": "偏短", "en": "shorter"},
             "principle": {"zh": "受热久结构疏松易溶;快萃会苦涩", "en": "Long roast = porous, easy to extract; fast pull = bitter"},
             "mantra": {"zh": "深烘磨粗温要低", "en": "dark roast: coarser, lower temp"}},
}

PARAMETERS_BY_ORIGIN = {
    "ethiopia": {"water_temp": "92-94C", "ratio": "1:16-1:17", "grind": {"zh": "中细偏细", "en": "medium-fine"},
                 "flavor": {"zh": "花香、柑橘、莓果、茶感", "en": "floral, citrus, berry, tea-like"}},
    "kenya": {"water_temp": "93-95C", "ratio": "1:15-1:16", "grind": {"zh": "中细", "en": "medium-fine"},
              "flavor": {"zh": "浓郁浆果、番茄、咸鲜", "en": "bold berry, tomato, savory"}},
    "colombia": {"water_temp": "90-93C", "ratio": "1:15-1:16", "grind": {"zh": "中等", "en": "medium"},
                 "flavor": {"zh": "平衡、焦糖、坚果", "en": "balanced, caramel, nut"}},
    "brazil": {"water_temp": "88-91C", "ratio": "1:14-1:15", "grind": {"zh": "中粗", "en": "medium-coarse"},
               "flavor": {"zh": "坚果、巧克力、低酸", "en": "nut, chocolate, low acid"}},
    "panama_geisha": {"water_temp": "92-94C", "ratio": "1:16-1:18", "grind": {"zh": "中细", "en": "medium-fine"},
                     "flavor": {"zh": "茉莉花、佛手柑、优雅", "en": "jasmine, bergamot, elegant"}},
    "yunnan": {"water_temp": "90-93C", "ratio": "1:15-1:16", "grind": {"zh": "中等", "en": "medium"},
               "flavor": {"zh": "平衡、红糖、坚果", "en": "balanced, brown sugar, nut"}},
}

PARAMETERS_BY_PROCESS = {
    "washed": {"adjustment": {"zh": "稍高水温或稍细研磨;粉水比略高(1:16-1:17)", "en": "slightly higher temp or finer; ratio a touch higher (1:16-1:17)"},
               "flavor": {"zh": "风味干净清晰、酸度明亮", "en": "clean, clear, bright acidity"}},
    "natural": {"adjustment": {"zh": "稍低水温或稍粗研磨防过萃;粉水比略低(1:15-1:16)", "en": "slightly lower temp or coarser to avoid over-extraction; ratio lower (1:15-1:16)"},
                "flavor": {"zh": "果香浓郁、甜感高、醇厚", "en": "fruity, sweet, full body"}},
    "honey": {"adjustment": {"zh": "中等参数,按蜜处理程度微调", "en": "mid parameters, tune by honey level"},
              "flavor": {"zh": "甜感突出、平衡", "en": "sweet-forward, balanced"}},
    "anaerobic": {"adjustment": {"zh": "通常降水温(88-92C)避免过度提取发酵风味", "en": "often lower temp (88-92C) to avoid pulling too much funk"},
                 "flavor": {"zh": "风味独特强烈、发酵感、酒香", "en": "intense, funky, wine-like"}},
}


# Flavor wheel: list of (zh_cat, en_cat, {zh:[...], en:[...]}) to keep order
FLAVOR_WHEEL = [
    ("水果", "Fruit", {"zh": ["柑橘", "莓果", "热带水果", "核果", "果干"], "en": ["citrus", "berry", "tropical fruit", "stone fruit", "dried fruit"]}),
    ("花香", "Floral", {"zh": ["茉莉花", "玫瑰", "咖啡花"], "en": ["jasmine", "rose", "coffee blossom"]}),
    ("坚果可可", "Nutty/Cocoa", {"zh": ["杏仁", "榛果", "黑巧克力", "牛奶巧克力"], "en": ["almond", "hazelnut", "dark chocolate", "milk chocolate"]}),
    ("焦糖甜感", "Caramel/Sweet", {"zh": ["焦糖", "蜂蜜", "红糖", "枫糖"], "en": ["caramel", "honey", "brown sugar", "maple"]}),
    ("香料", "Spice", {"zh": ["肉桂", "丁香", "黑胡椒"], "en": ["cinnamon", "clove", "black pepper"]}),
    ("烘烤", "Roasty", {"zh": ["烤面包", "烟熏", "烟草"], "en": ["toast", "smoky", "tobacco"]}),
    ("发酵酒香", "Fermented/Fruity-Wine", {"zh": ["红酒感", "朗姆酒", "发酵"], "en": ["red wine", "rum", "fermented"]}),
    ("酸感发酵", "Sour/Fermentation", {"zh": ["醋酸", "酒石酸", "柠檬酸"], "en": ["acetic", "tartaric", "citric"]}),
    ("其他", "Other", {"zh": ["土味", "草药", "橡胶"], "en": ["earthy", "herbal", "rubber"]}),
]


# Learning resources
LEARNING_RESOURCES = {
    "beginner": [
        {"name": "咖啡沙龙", "url": "coffeesalon.com", "type": {"zh": "中文社区", "en": "CN community"}, "desc": {"zh": "业界和爱好者推崇的咖啡主题网站", "en": "respected coffee community site"}},
        {"name": "中国咖啡网", "url": "gafei.com", "type": {"zh": "中文资讯", "en": "CN info"}, "desc": {"zh": "涵盖咖啡知识、品鉴、技术学习交流", "en": "knowledge, tasting & technique exchange"}},
        {"name": "Sweet Maria's (YouTube)", "url": "youtube.com", "type": {"zh": "视频", "en": "video"}, "desc": {"zh": "走访各产地视频,可见原产地处理过程", "en": "origin visits, shows processing"}},
    ],
    "intermediate": [
        {"name": "Barista Hustle", "url": "baristahustle.com", "type": {"zh": "英文研究站", "en": "EN research"}, "desc": {"zh": "浓缩萃取率等方面的深度研究", "en": "deep research on extraction yield"}},
        {"name": "Perfect Daily Grind", "url": "perfectdailygrind.com", "type": {"zh": "英文媒体", "en": "EN media"}, "desc": {"zh": "萃取/产区/烘焙全维度专业内容", "en": "extraction/origin/roast coverage"}},
        {"name": "EHS咖啡西点学院", "url": "ehs-academy.cn", "type": {"zh": "中文培训", "en": "CN training"}, "desc": {"zh": "从品种到萃取、拉花的全面知识", "en": "variety to extraction & latte art"}},
        {"name": "明谦咖啡学院", "url": "mqcoffee.com", "type": {"zh": "中文培训", "en": "CN training"}, "desc": {"zh": "SCA/CQI Q-Grader认证", "en": "SCA & Q-Grader certification"}},
    ],
    "professional": [
        {"name": "WCR Sensory Lexicon", "url": "worldcoffeeresearch.org", "type": {"zh": "标准参照", "en": "standard ref"}, "desc": {"zh": "110种风味属性的标准参照体系,免费下载", "en": "110 sensory references, free download"}},
        {"name": "SCA Sensory Skills", "url": "sca.coffee", "type": {"zh": "认证课程", "en": "cert. course"}, "desc": {"zh": "系统化感官训练,含36味闻香瓶、三角杯测", "en": "systematic sensory training, 36 aromas, triangle tests"}},
        {"name": "CQI Q-Grader", "url": "coffeeinstitute.org", "type": {"zh": "认证", "en": "cert."}, "desc": {"zh": "咖啡品质鉴定师,含味觉/嗅觉测试", "en": "Q-grader, taste/smell tests"}},
        {"name": "Le Nez du Cafe", "url": "winearomas.com", "type": {"zh": "训练工具", "en": "training tool"}, "desc": {"zh": "36味闻香瓶,Q-Grader必考工具", "en": "36-aroma kit, Q-grader must-have"}},
    ],
}


# Mantras (beginner)
MANTRAS = {
    "grind": {"zh": "苦调粗,酸调细;淡了粉多水少,浓了粉少水多;水流快调细,水流慢调粗。",
              "en": "bitter->coarser, sour->finer; weak->more grounds less water, strong->more water less grounds; fast flow->finer, slow flow->coarser."},
    "roast": {"zh": "深烘磨粗温要低,浅烘磨细温要高;新豆要醒别急着,老豆磨细升点温。",
              "en": "dark->coarser & lower temp, light->finer & higher temp; fresh beans->rest first, old beans->finer & warmer."},
    "temp": {"zh": "酸升温,苦降温(仍优先调研磨)。", "en": "sour->raise temp, bitter->lower temp (still tune grind first)."},
    "rule": {"zh": "一次只改一个变量(研磨/水温/粉水比/时间四选一),改完喝一口再判断。",
             "en": "change ONE variable at a time (grind/temp/ratio/time), sip before the next."},
}


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
        return (f"未找到冲煮法 '{method}'。可用方法: {avail}"
                if lang == "zh"
                else f"Brew method '{method}' not found. Available: {avail}")

    roast = PARAMETERS_BY_ROAST.get(roast_level, PARAMETERS_BY_ROAST["medium"])
    L = {"zh": {"dose": "粉量", "yield": "出液/水量", "temp": "水温", "time": "时间", "grind": "研磨度",
                "roast": "烘焙度调整", "gear": "器材", "steps": "步骤", "adj": "风味调整",
                "bitter": "太苦", "sour": "太酸", "beginner_mantra": "新手口诀", "adv": "烘焙度参数调整",
                "sol": "溶解度", "wt": "建议水温", "g": "研磨倾向", "prin": "原理", "gold": "金杯目标"},
           "en": {"dose": "Dose", "yield": "Yield/Water", "temp": "Temp", "time": "Time", "grind": "Grind",
                  "roast": "Roast tweak", "gear": "Gear", "steps": "Steps", "adj": "Flavor tweaks",
                  "bitter": "Too bitter", "sour": "Too sour", "beginner_mantra": "Beginner mantra",
                  "adv": "Roast parameter tweaks", "sol": "Solubility", "wt": "Suggested temp",
                  "g": "Grind lean", "prin": "Principle", "gold": "Golden-cup target"}}[lang]

    lines = [f"## {_t(recipe['name'], lang)} {'起步参数' if lang=='zh' else 'starter params'}", "",
            f"| {L['dose']} | {_t(recipe['dose'], lang)} |", f"| {L['yield']} | {_t(recipe['yield'], lang)} |",
            f"| {L['temp']} | {_t(recipe['temp'], lang)} |", f"| {L['time']} | {_t(recipe['time'], lang)} |",
            f"| {L['grind']} | {_t(recipe['grind'], lang)} |", f"| {L['gear']} | {_t(recipe['gear'], lang)} |",
            f"| {L['roast']} | {_t(roast['mantra'], lang)} |", "", f"### {L['steps']}", _t(recipe['steps'], lang),
            "", f"### {L['adj']}", f"- {L['bitter']} -> {_t(recipe['adjust_bitter'], lang)}",
            f"- {L['sour']} -> {_t(recipe['adjust_sour'], lang)}"]

    if experience == "beginner":
        lines += ["", f"### {L['beginner_mantra']}", f"> {_t(MANTRAS['grind'], lang)}", f"> {_t(MANTRAS['rule'], lang)}"]
    elif experience == "advanced":
        lines += ["", f"### {L['adv']}", f"- {L['sol']}: {_t(roast['solubility'], lang)}",
                  f"- {L['wt']}: {roast['water_temp']}", f"- {L['g']}: {_t(roast['grind'], lang)}",
                  f"- {L['prin']}: {_t(roast['principle'], lang)}",
                  f"- {L['gold']}: {'萃取率 18-22%, TDS 1.15-1.35%' if lang=='zh' else 'extraction 18-22%, TDS 1.15-1.35%'}"]
    return "\n".join(lines)


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
        return (f"未找到奶咖 '{drink}'。可用: {avail}" if lang == "zh" else f"Milk drink '{drink}' not found. Available: {avail}")
    L = {"zh": {"es": "浓缩", "milk": "奶", "foam": "奶泡/顶", "vol": "总量", "notes": "要点"},
         "en": {"es": "Espresso", "milk": "Milk", "foam": "Foam/Top", "vol": "Volume", "notes": "Notes"}}[lang]
    lines = [f"## {_t(d['name'], lang)}", "", f"| {L['es']} | {_t(d['espresso'], lang)} |",
             f"| {L['milk']} | {_t(d['milk'], lang)} |", f"| {L['foam']} | {_t(d['foam'], lang)} |",
             f"| {L['vol']} | {d['volume']} |", "", f"### {L['notes']}", _t(d['notes'], lang)]
    if lang == "zh":
        lines += ["", "> 比例于 2026-07-15 联网核对 (expertcafe/completehomebarista/coffee-guide.jp)。"]
    else:
        lines += ["", "> Ratios cross-checked online 2026-07-15 (expertcafe/completehomebarista/coffee-guide.jp)."]
    return "\n".join(lines)


@mcp.tool()
def diagnose_flavor(problem: str, experience: str = "beginner", flow_rate: str = "", language: str = "zh") -> str:
    """根据风味问题诊断并给调整建议 / Diagnose a flavor problem and suggest fixes.

    Args:
        problem: 风味问题描述 / flavor problem, e.g. "太苦"/"too bitter","太酸"/"too sour".
        experience: 经验水平 / experience: beginner/intermediate/advanced (默认 beginner)
        flow_rate: 水流速度描述(可选) / flow rate, e.g. "很快"/"fast","很慢"/"slow"
        language: 输出语言 / output language: zh or en (默认 zh)
    Returns: 诊断结果与调整建议 (localized).
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
        return (f"未能识别风味问题 '{problem}'。可识别: {avail}" if lang == "zh"
                else f"Could not recognize flavor problem '{problem}'. Known: {avail}")
    diag = FLAVOR_DIAGNOSIS[matched]
    L = {"zh": {"title": "风味诊断结果", "kind": "问题类型", "cause": "根本原因", "adv_begin": "调整建议(新手版)",
                "adv_pro": "调整建议(资深版)", "mantra": "口诀", "q": "诊断提问",
                "q_text": "做的时候水是很快就流完了,还是磨蹭很久才流完?"}, 
         "en": {"title": "Flavor diagnosis", "kind": "Issue", "cause": "Root cause", "adv_begin": "Fix (beginner)",
                "adv_pro": "Fix (advanced)", "mantra": "Mantra", "q": "Diagnostic question",
                "q_text": "Did the water run through fast, or take a long time to finish?"}}[lang]
    lines = [f"## {L['title']}", "", f"**{L['kind']}**: {' / '.join(diag['symptoms'])}",
             f"**{L['cause']}**: {_t(diag['root_cause'], lang)}", ""]
    if experience == "beginner":
        lines += [f"### {L['adv_begin']}", _t(diag['beginner'], lang), "", f"### {L['mantra']}",
                  f"> {_t(MANTRAS['grind'], lang)}", f"> {_t(MANTRAS['rule'], lang)}"]
        if matched in ("bitter", "sour") and not flow_rate:
            lines += ["", f"### {L['q']}", L['q_text'],
                      (f"- 流得快 -> 粉太粗/水太多\n- 流得慢 -> 可能其实过萃了" if lang == "zh"
                       else f"- Fast -> too coarse / too much water\n- Slow -> may actually be over-extracted")]
    else:
        lines += [f"### {L['adv_pro']}", _t(diag['advanced'], lang), "",
                  (f"### 科学原理\n化合物溶出顺序: 果酸类(先) -> 脂类 -> 糖类(甜) -> 碳水化合物(苦, 后)\n金杯区间: 萃取率 18-22%, TDS 1.15-1.35%"
                   if lang == "zh"
                   else f"### Science\nDissolution order: acids(first) -> lipids -> sugars(sweet) -> carbs(bitter, last)\nGolden cup: extraction 18-22%, TDS 1.15-1.35%")]
    return "\n".join(lines)


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
        grinder_model: 磨豆机型号 / grinder:
            comandante_c40, 1zpresso_jx_pro, timemore_c3, mahlkonig_ek43, eureka_mignon, baratza_sette_270
        target_method: 目标冲煮法 / target: espresso, pour_over, french_press, turkish
        language: 输出语言 / output language: zh or en (默认 zh)
    Returns: 校准步骤与推荐刻度 (localized).
    """
    lang = language if language in ("zh", "en") else "zh"
    g = GRINDER_SETTINGS.get(grinder_model)
    if not g:
        avail = ", ".join(GRINDER_SETTINGS.keys())
        return (f"未找到磨豆机 '{grinder_model}'。可用: {avail}" if lang == "zh"
                else f"Grinder '{grinder_model}' not found. Available: {avail}")
    L = {"zh": {"cal": "校准指南", "type": "类型", "rec": "推荐刻度", "zero": "归零校准步骤",
                "principle": "校准原则 (Dose->Yield->Time)", "common": "常见问题"},
         "en": {"cal": "calibration guide", "type": "Type", "rec": "Recommended settings", "zero": "Zeroing steps",
                "principle": "Calibration principle (Dose->Yield->Time)", "common": "Common issues"}}[lang]
    lines = [f"## {_t(g['name'], lang)} {L['cal']}", "", f"**{L['type']}**: {_t(g['type'], lang)}", "", f"### {L['rec']}"]
    settings = g["settings"]
    if isinstance(settings, dict):
        mn = {"turkish": {"zh": "土耳其咖啡", "en": "Turkish"}, "espresso": {"zh": "意式浓缩", "en": "Espresso"},
              "espresso_soe": {"zh": "SOE意式", "en": "SOE espresso"}, "pour_over": {"zh": "手冲", "en": "Pour-over"},
              "french_press": {"zh": "法压/冷萃", "en": "French press/cold brew"}}
        for mth, cfg in settings.items():
            hl = " <--" if mth == target_method else ""
            lines.append(f"- {_t(mn.get(mth, mth), lang)}: **{_t(cfg, lang)}**{hl}")
    else:
        lines.append(f"- **{_t(settings, lang)}**")
    lines += ["", f"### {_t(g.get('calibration',{'zh':'','en':''}), lang)}".rstrip()]
    lines += ["", f"### {L['principle']}",
              ("1. 固定粉量 Dose(意式18g)\n2. 固定液重 Yield(意式36g=1:2)\n3. 调研磨度使时间到目标范围(意式25-32秒)" if lang == "zh"
               else "1. Fix dose (espresso 18g)\n2. Fix yield (espresso 36g=1:2)\n3. Tune grind to hit target time (espresso 25-32s)"),
              "", f"### {L['common']}",
              (f"- 刻度漂移 -> 定期重新校准零点\n- 清洁后研磨不均 -> 锁紧刀盘螺丝并重新校准\n- 换豆后味道突变 -> 充分 purge 旧粉再调参" if lang == "zh"
               else f"- dial drift -> recalibrate zero\n- uneven after cleaning -> tighten burr screws & recalibrate\n- flavor jump after bean swap -> purge old grounds then re-tune")]
    return "\n".join(lines)


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


SENSORY = {
    "taste": {
        "zh": "## 基础味觉识别训练\n\n### 五味标准训练溶液(1L水中溶解)\n| 味觉 | 配方 |\n|------|------|\n| 甜 | 24g 蔗糖 |\n| 酸 | 1.2g 柠檬酸 |\n| 咸 | 4g 氯化钠 |\n| 苦 | 0.54g 咖啡因 |\n| 鲜 | 2g 味精 |\n\n### 进阶强度训练\n1. 每种味觉配置4个强度等级\n2. 独立品尝->同类混搭->不同类混合->盲喝测试\n\n### 咖啡酸质专项(CQI标准)\n- 柠檬酸:柑橘类酸质; 苹果酸:青苹果型; 酒石酸:葡萄型; 醋酸:不愉悦酸; 绿原酸:烘焙中分解为奎宁酸与咖啡酸",
        "en": "## Basic taste recognition training\n\n### Five-taste standard solutions (per 1L water)\n| Taste | Recipe |\n|------|------|\n| Sweet | 24g sucrose |\n| Sour | 1.2g citric acid |\n| Salty | 4g NaCl |\n| Bitter | 0.54g caffeine |\n| Umami | 2g MSG |\n\n### Advanced intensity drill\n1. 4 intensity levels per taste\n2. Solo -> same-class mix -> cross-class mix -> blind test\n\n### Coffee acidity special (CQI)\n- Citric: citrus; Malic: green apple; Tartaric: grape; Acetic: unpleasant; Chlorogenic: roasts into quinic & caffeic acids",
    },
    "olfactory": {
        "zh": "## 嗅觉记忆建立方法\n\n### 关键认知\n常说的「苹果味」并非味觉,而是鼻后嗅觉(retronasal olfaction)。可通过「棒棒糖实验」区分——捏鼻吃水果味棒棒糖只尝到甜味,松鼻瞬间风味明了。\n\n### Le Nez du Cafe 36味闻香瓶(按烘焙化学变化分四群组)\n| 群组 | 烘焙阶段 | 香气 | 代表 |\n|------|---------|------|------|\n| 酶催化 | 浅烘 | 花香果香 | 玫瑰/咖啡花/柠檬/杏桃 |\n| 焦糖化 | 中烘 | 坚果焦糖 | 蜂蜜/焦糖/黑巧/烤杏仁 |\n| 干馏 | 深烘 | 树脂碳烧 | 丁香/胡椒/烟草/烟熏 |\n| 瑕疵 | — | 不愉悦 | 土味/马铃薯/青豆/橡胶 |\n\n### 日常嗅觉记忆\n用常见食材建立嗅觉记忆库:水果(柠檬/莓果/桃子)、花香(玫瑰/茉莉)、坚果(杏仁/榛果)、香料(肉桂/丁香/香草)。核心:大量尝试、记住生活气息。",
        "en": "## Olfactory memory training\n\n### Key idea\n'Apple flavor' is not taste but retronasal olfaction. Try the 'lollipop test': pinch your nose eating a fruit lollipop, you taste only sweet; release and flavor blooms.\n\n### Le Nez du Cafe 36 aromas (by roast chemistry, 4 groups)\n| Group | Stage | Aroma | Examples |\n|------|-------|-------|---------|\n| Enzymatic | light | floral/fruity | rose/coffee blossom/lemon/apricot |\n| Sugar browning | medium | nutty/caramel | honey/caramel/dark choc/roasted almond |\n| Dry distillation | dark | resinous/burnt | clove/pepper/tobacco/smoky |\n| Taints | -- | off | earthy/potato/green bean/rubber |\n\n### Daily olfactory memory\nBuild a library from everyday foods/fruits/flowers/ nuts/spices. Core: taste widely, remember everyday scents.",
    },
    "cupping": {
        "zh": "## 对比品鉴练习\n\n| 训练 | 内容 | 难度递进 |\n|------|------|---------|\n| 三角杯测 | 三杯两同找不同 | 不同产区->处理法->烘焙度->同农场不同批次 |\n| 产区比较 | 对比不同产区 | 先大区,后同区不同国 |\n| 瑕疵杯测 | 识别不好风味 | 明显瑕疵->细微瑕疵 |\n| 烘焙度对比 | 同豆不同烘焙度 | 理解烘焙影响 |\n\n### 三角杯测方法\n1. 三杯咖啡,两杯相同一杯不同\n2. 逐一啜吸品鉴,找出不同的那杯\n3. 相似度越高越难——从不同产区开始,逐步加难度",
        "en": "## Comparative tasting\n\n| Drill | What | Progression |\n|------|------|-----------|\n| Triangle | 3 cups, 2 same, find the odd one | different origin -> process -> roast -> same-farm batch |\n| Origin compare | contrast origins | broad region first, then neighbors |\n| Defect cupping | spot off-flavors | obvious -> subtle |\n| Roast compare | same bean, different roasts | understand roast impact |\n\n### Triangle method\n1. Three cups, two identical, one different\n2. Slurp each, identify the odd cup\n3. Harder as similarity rises — start with different origins",
    },
    "memory": {
        "zh": "## 个人化咖啡风味记忆库\n\n### 六步搭建\n1. 味觉基础库:配置酸甜咸苦鲜标准溶液,4级强度,反复品尝记忆\n2. 鼻后嗅觉库:棒棒糖/新鲜水果盲测,建立鼻后嗅觉与味觉联动记忆\n3. 干香湿香库:闻香瓶36味/T100系统训练,辅以日常食材\n4. 咖啡风味映射库:杯测品鉴不同产区/处理法/烘焙度,记录并对照风味轮\n5. 温度变化库:同一杯在高/中/低温下的风味变化记录\n6. 感官卫生维护:戒烟酒辣等刺激物,保持感官灵敏度",
        "en": "## Personal coffee flavor memory bank\n\n### Six steps\n1. Taste base bank: sour-sweet-salty-bitter-umami solutions, 4 intensity levels\n2. Retronasal bank: lollipop & fruit blind tests\n3. Dry/wet aroma bank: 36 aromas / T100 + everyday foods\n4. Coffee mapping: cupping across origin/process/roast vs the wheel\n5. Temperature bank: same cup at hot/warm/cool\n6. Sensory hygiene: cut smoke/alcohol/spicy to keep senses sharp",
    },
    "overview": {
        "zh": "## 咖啡感官训练概览\n\n四个模块,建议顺序进行:\n1. 基础味觉识别训练 (training_type='taste') - 五味标准溶液+4级强度+咖啡酸质专项\n2. 嗅觉记忆建立 (training_type='olfactory') - 鼻后嗅觉+Le Nez du Cafe 36味+日常食材\n3. 对比品鉴练习 (training_type='cupping') - 三角杯测+产区比较+瑕疵识别+烘焙度对比\n4. 个人风味记忆库 (training_type='memory') - 六步搭建个人化嗅觉与味觉记忆库\n\n### 风味轮使用\n从中心向外检索:先确定基本味觉->找所属大类->定位具体描述词\n可用 get_flavor_wheel 工具查类别与描述词",
        "en": "## Coffee sensory training overview\n\nFour modules, in order:\n1. Taste recognition (training_type='taste') - 5-taste solutions + 4 levels + coffee acids\n2. Olfactory memory (training_type='olfactory') - retronasal + 36 aromas + everyday foods\n3. Comparative tasting (training_type='cupping') - triangle + origin + defects + roast\n4. Personal memory bank (training_type='memory') - six-step personal library\n\n### Flavor wheel use\nSearch center-out: base taste -> category -> descriptor. Use get_flavor_wheel to query.",
    },
}


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


def main() -> None:
    """Entry point used by the console script `barista-mcp`."""
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
