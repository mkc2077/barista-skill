"""Smoke tests for the barista MCP server tools (bilingual zh/en).

Run with: pytest mcp-server/test_server.py
Uses only stdlib + the server module; no live MCP transport needed.
"""

import importlib.util
import os
import pathlib
import re

import pytest

HERE = pathlib.Path(__file__).resolve()
SPEC = importlib.util.spec_from_file_location("barista_server", HERE.parent / "server.py")
b = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(b)

ALL_METHODS = [
    "espresso", "pour_over", "french_press", "aeropress", "moka_pot",
    "cold_brew", "ice_drip", "clever_dripper", "iced_pour_over",
    "drip_bag", "syphon", "turkish", "flash_brew", "vietnamese_phin",
]
ALL_MILK = [
    "macchiato", "cortado", "flat_white", "cappuccino", "latte", "mocha",
    "con_panna", "americano", "irish_coffee", "vienna", "affogato",
]
ALL_GRINDERS = [
    "comandante_c40", "1zpresso_jx_pro", "timemore_c3", "mahlkonig_ek43",
    "eureka_mignon", "baratza_sette_270",
]
ALL_TRAINING = ["overview", "taste", "olfactory", "cupping", "memory"]
ALL_LEVELS = ["beginner", "intermediate", "professional", "all"]


# --- module structure -------------------------------------------------------

def test_main_entrypoint_exists():
    assert callable(b.main)


def test_tool_count_is_eleven():
    tools = sorted(b.mcp._tool_manager._tools)
    assert tools == [
        "calculate_cupping_score", "calibrate_grinder", "diagnose_flavor",
        "get_craft_recipe", "get_flavor_wheel", "get_learning_resources",
        "get_milk_drink", "get_parameters_guide", "get_recipe",
        "get_sensory_training", "search_references",
    ]


def test_no_dead_imports():
    src = (HERE.parent / "server.py").read_text(encoding="utf-8")
    # the four blocked stdlib imports must not be present
    for dead in ("import sys", "import os", "import re",
                 "from typing import import Optional", "KNOWLEDGE = "):
        assert dead not in src, f"dead symbol remains: {dead}"


# --- get_recipe --------------------------------------------------------------

@pytest.mark.parametrize("method", ALL_METHODS)
@pytest.mark.parametrize("lang", ["zh", "en"])
def test_get_recipe_all_methods_bilingual(method, lang):
    out = b.get_recipe(method, "medium", "beginner", lang)
    assert "未找到" not in out  # zh fallback message is excluded by success
    assert out.startswith("## ")
    # localized name marker present in table
    assert ("粉量" if lang == "zh" else "Dose") in out


def test_get_recipe_unknown_zh():
    out = b.get_recipe("nope")
    assert "未找到" in out
    assert "espresso" in out  # lists available


def test_get_recipe_unknown_en():
    out = b.get_recipe("nope", language="en")
    assert "not found" in out
    assert "espresso" in out


def test_get_recipe_advanced_golden_cup():
    out = b.get_recipe("espresso", "light", "advanced", "en")
    assert "18-22%" in out  # golden cup target shown for advanced


def test_get_recipe_invalid_lang_falls_back_zh():
    out = b.get_recipe("espresso", language="fr")
    assert "粉量" in out  # falls back to zh


# --- get_milk_drink ----------------------------------------------------------

@pytest.mark.parametrize("drink", ALL_MILK)
@pytest.mark.parametrize("lang", ["zh", "en"])
def test_get_milk_drink_all_bilingual(drink, lang):
    out = b.get_milk_drink(drink, lang)
    assert out.startswith("## ")
    assert ("浓缩" if lang == "zh" else "Espresso") in out


def test_get_milk_drink_unknown():
    assert "未找到" in b.get_milk_drink("nope")
    assert "not found" in b.get_milk_drink("nope", "en")


def test_get_milk_drink_ratios_crosschecked_note():
    assert "联网核对" in b.get_milk_drink("cappuccino", "zh")
    assert "cross-checked" in b.get_milk_drink("cappuccino", "en").lower()


# --- get_craft_recipe --------------------------------------------------------
def test_get_craft_recipe_unknown_base_zh():
    out = b.get_craft_recipe("nope")
    assert "可用" in out and "espresso_classic" in out


def test_get_craft_recipe_unknown_base_en():
    out = b.get_craft_recipe("nope", language="en")
    assert "not found" in out and "soe_ristretto" in out


def test_get_craft_recipe_espresso_classic_zh_sop():
    out = b.get_craft_recipe("espresso_classic")
    assert "SOP" in out and "咖啡基底" in out and "拼装" in out and "联网核实" in out
    assert "1:2" in out and "92-94C" in out


def test_get_craft_recipe_soe_ristretto_en():
    out = b.get_craft_recipe("soe_ristretto", language="en")
    assert "SOP" in out and "Coffee base" in out and "1:1-1:1.5" in out and "front-mid cut only" in out


def test_get_craft_recipe_tea_toggle():
    no_tea = b.get_craft_recipe("pour_over")
    tea = b.get_craft_recipe("pour_over", include_tea=True)
    assert "无" in no_tea and "茉莉" in tea

# --- diagnose_flavor ---------------------------------------------------------

def test_diagnose_bitter_zh():
    out = b.diagnose_flavor("太苦", "beginner", "", "zh")
    assert "过萃" in out or "过度溶出" in out
    assert "口诀" in out


def test_diagnose_bitter_en():
    out = b.diagnose_flavor("too bitter", "beginner", "slow", "en")
    assert "over-extraction" in out.lower()
    assert "bitter" in out.lower()


def test_diagnose_unknown():
    out = b.diagnose_flavor("zzzztotallyfine", language="zh")
    assert "未能识别" in out
    assert "not recognize" in b.diagnose_flavor("zzzz", language="en").lower()


@pytest.mark.parametrize("key,sym", [("bitter", "bitter"), ("sour", "sour"),
                                     ("weak", "weak"), ("too_strong", "strong")])
def test_diagnose_matches_english_symptoms(key, sym):
    out = b.diagnose_flavor(sym, "advanced", "", "en")
    assert key.split("_")[0] in out.lower() or sym in out.lower()


# --- calculate_cupping_score ------------------------------------------------

def test_cupping_score_basic():
    out = b.calculate_cupping_score(8.5, 8.0, 7.5, 7.0, 7.5, 10, 7.5, 10, 10, 7.5,
                                    language="en")
    # total = 83.5; specialty
    assert "83.50" in out
    assert "Very Good" in out
    assert "yes" in out  # specialty = yes


def test_cupping_score_below_specialty():
    out = b.calculate_cupping_score(6, 6, 6, 6, 6, 6, 6, 6, 6, 6)
    assert "Below Specialty" in out or "低于精品" in out


def test_cupping_score_deductions():
    out = b.calculate_cupping_score(8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
                                    taint_cups=2, fault_cups=1, language="en")
    # total 80 - (4 + 4) = 72
    assert "72.00" in out
    assert "Specialty" in out


def test_cupping_score_out_of_range_warns():
    out = b.calculate_cupping_score(11, 8, 8, 8, 8, 8, 8, 8, 8, 8)
    assert "out of" in out.lower() or "超出" in out


# --- calibrate_grinder ------------------------------------------------------

@pytest.mark.parametrize("grinder", ALL_GRINDERS)
@pytest.mark.parametrize("lang", ["zh", "en"])
def test_calibrate_grinder_all(grinder, lang):
    out = b.calibrate_grinder(grinder, "espresso", lang)
    assert out.startswith("## ")
    assert ("校准" if lang == "zh" else "calibration") in out.lower()


def test_calibrate_grinder_unknown():
    assert "未找到" in b.calibrate_grinder("nope")
    assert "not found" in b.calibrate_grinder("nope", language="en")


# --- get_parameters_guide ---------------------------------------------------

def test_parameters_guide_roast_en():
    out = b.get_parameters_guide("light", "", "", "", "en")
    assert "Golden Cup" in out
    assert "finer" in out


def test_parameters_guide_origin_process():
    out = b.get_parameters_guide("medium", "ethiopia", "natural", "", "en")
    assert "ethiopia" in out.lower()
    assert "natural" in out.lower()


def test_parameters_guide_taste_map_acidity():
    out = b.get_parameters_guide("", "", "", "acidity", "en")
    assert "raise temp" in out


def test_parameters_guide_no_query():
    out = b.get_parameters_guide("", "", "", "", "en")
    assert "at least one" in out.lower()


def test_parameters_guide_unknown_origin():
    out = b.get_parameters_guide("", "mars", "", "", "en")
    assert "not found" in out.lower()


# --- get_flavor_wheel -------------------------------------------------------

def test_flavor_wheel_en_match_fruit():
    out = b.get_flavor_wheel("Fruit", "en")
    assert "Fruit**" in out  # **Fruit**: ...
    assert "citrus" in out


def test_flavor_wheel_floral_en():
    out = b.get_flavor_wheel("Floral", "en")
    assert "jasmine" in out


def test_flavor_wheel_all():
    out = b.get_flavor_wheel("", "en")
    # all 9 categories present
    for cat in ["Fruit", "Floral", "Nutty", "Caramel", "Spice", "Roasty",
                "Fermented", "Sour", "Other"]:
        assert cat in out


def test_flavor_wheel_unknown_category():
    out = b.get_flavor_wheel("Nonexistent", "en")
    assert "not found" in out.lower()


# --- get_sensory_training ---------------------------------------------------

@pytest.mark.parametrize("ttype", ALL_TRAINING)
@pytest.mark.parametrize("lang", ["zh", "en"])
def test_sensory_training_all(ttype, lang):
    out = b.get_sensory_training(ttype, lang)
    assert out.startswith("## ")
    assert len(out) > 80


def test_sensory_training_invalid_falls_back_overview():
    out = b.get_sensory_training("nope", "en")
    assert "overview" in out.lower()


# --- get_learning_resources -------------------------------------------------

@pytest.mark.parametrize("level", ALL_LEVELS)
@pytest.mark.parametrize("lang", ["zh", "en"])
def test_learning_resources_all(level, lang):
    out = b.get_learning_resources(level, lang)
    assert "Barista Hustle" in out or "咖啡沙龙" in out
    assert "roadmap" in out.lower() or "路线图" in out




# --- search_references (uses top-of-file session-level b) ---


def test_search_references_returns_top_k():
    out = b.search_references("espresso", "en", 2)
    assert out.startswith("## ")
    # Should contain at least 1 result section header
    ranked = len(re.findall(r"^### \d+\.", out, re.MULTILINE))
    assert ranked == 2, f"expected 2 ranked sections, got {ranked}"


def test_search_references_zh_lang():
    out = b.search_references("grind calibration", "zh", 3)
    assert "## " in out


def test_search_references_no_match():
    out = b.search_references("zzznothingzzz", "en", 3)
    assert "no" in out.lower() or "???" in out or "Did not" in out or "try" in out.lower()


def test_search_references_is_bilingual_tool():
    "search_references should accept language=zh and language=en"
    out_en = b.search_references("espresso", "en", 2)
    out_zh = b.search_references("espresso", "zh", 2)
    assert out_en != out_zh  # bilingual produces different text


def test_search_references_is_in_skill_md_tool_list():
    "SKILL.md should list search_references alongside the other 10 tools"
    skill_md = (HERE.parent.parent / "SKILL.md").read_text("utf-8")
    assert "search_references" in skill_md, "SKILL.md missing search_references in tool list"

if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
