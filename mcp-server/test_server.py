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


def test_tool_count_is_twenty_four():
    tools = sorted(b.mcp._tool_manager._tools)
    assert tools == [
        "calculate_cupping_score", "calculate_cva_score", "calibrate_grinder",
        "diagnose_flavor", "get_craft_recipe", "get_defect_bean",
        "get_flavor_wheel", "get_green_grade", "get_learning_resources",
        "get_milk_drink", "get_parameters_guide", "get_qgrader_exam",
        "get_qgrader_study_plan", "get_recipe", "get_sca_course",
        "get_sca_path", "get_sensory_training", "get_triangle_protocol",
        "identify_flavor", "log_brew_result", "next_step",
        "search_references", "search_sca_sources", "start_brew_session",
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
    assert out.startswith("{")  # JSON-object return
    # localized name marker present in table
    assert '"dose"' in out  # JSON field name stable across languages


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
    assert '"dose"' in out  # JSON field name stable; content falls back to zh


# --- get_milk_drink ----------------------------------------------------------

@pytest.mark.parametrize("drink", ALL_MILK)
@pytest.mark.parametrize("lang", ["zh", "en"])
def test_get_milk_drink_all_bilingual(drink, lang):
    out = b.get_milk_drink(drink, lang)
    assert out.startswith("{")  # JSON-object return
    assert '"espresso"' in out  # JSON field name stable across languages


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
    assert '"base_spec"' in out and '"build_sop"' in out and "联网核实" in out  # JSON fields + verify note
    assert "1:2" in out and "92-94C" in out


def test_get_craft_recipe_soe_ristretto_en():
    out = b.get_craft_recipe("soe_ristretto", language="en")
    assert '"base_spec"' in out and "1:1-1:1.5" in out and "front-mid cut only" in out


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


# --- identify_flavor (v4.0 new) --------------------------------------------

def test_identify_flavor_sour_zh():
    out = b.identify_flavor("尖酸刺舌", "beginner", "zh")
    assert out.startswith("{")            # JSON return
    assert "欠萃" in out or "未萃取" in out or "under-extraction" in out
    assert "beginner_fix" in out          # beginner tier gets beginner_fix + mantra
    assert "mantra" in out


def test_identify_flavor_woody_en():
    out = b.identify_flavor("woody cardboard", "advanced", "en")
    assert out.startswith("{")
    assert "advanced_fix" in out           # advanced tier gets advanced_fix + science
    assert "science" in out
    assert "stale" in out.lower() or "woody" in out.lower()


def test_identify_flavor_unknown():
    out = b.identify_flavor("zzztotallyfine", "beginner", "zh")
    assert "未能识别" in out
    assert "Could not recognize" in b.identify_flavor("zzz", "beginner", "en")


# --- start_brew_session (v4.0 new) ------------------------------------------

def test_start_brew_session_default_zh():
    out = b.start_brew_session("", "", "zh")
    assert out.startswith("{")
    assert '"session_id"' in out
    assert '"next_action"' in out
    assert '"history"' in out


def test_start_brew_session_with_bean_method_en():
    out = b.start_brew_session("ethiopia natural light", "pour_over", "en")
    assert out.startswith("{")
    assert "pour_over" in out
    assert "ethiopia natural light" in out


# --- log_brew_result (v4.0 new) ---------------------------------------------

def test_log_brew_result_tune_flag():
    params = '{"dose_g":15,"yield_g":240,"temp_c":92,"grind":"中细","time_s":150}'
    score = '{"aroma":4,"acid":3,"sweet":3,"body":3,"aftertaste":3}'
    out = b.log_brew_result("S1", "pour_over", params, score, "balanced", "zh")
    assert '"next_flag": "tune"' in out
    assert '"round_record"' in out
    assert '"append_to": "history"' in out


def test_log_brew_result_diagnose_flag():
    params = '{"dose_g":15}'
    score = '{"aroma":4,"acid":2,"sweet":3,"body":3,"aftertaste":3}'
    out = b.log_brew_result("S1", "pour_over", params, score, "", "zh")
    assert '"next_flag": "diagnose"' in out


def test_log_brew_result_bad_json_recovers():
    out = b.log_brew_result("S1", "pour_over", "not-json", "", "", "zh")
    assert out.startswith("{")
    assert '"round_record"' in out           # must not crash on malformed JSON


# --- next_step (v4.0 new) ---------------------------------------------------

def test_next_step_by_problem_zh():
    out = b.next_step("", "太酸", "", "", "zh")
    assert out.startswith("{")
    assert '"matched": "by_problem:太酸"' in out
    assert "研磨" in out                       # 太酸 -> finer grind suggested
    assert '"iron_rule"' in out


def test_next_step_by_goal_en():
    out = b.next_step("", "", "sweeter", "", "en")
    assert out.startswith("{")
    assert '"matched": "by_goal:更甜"' in out
    assert '"adjustments"' in out
    assert '"iron_rule"' in out


def test_next_step_unknown():
    out = b.next_step("", "zzz", "", "", "zh")
    assert "未能识别" in out
    assert "Could not recognize" in b.next_step("", "zzz", "", "", "en")


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
    assert out.startswith("{")  # JSON-object return
    assert '"recommended_settings"' in out  # JSON field name stable across languages


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
    assert out.startswith("## ")  # markdown still returned by this tool
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
    assert out.startswith("## ")  # markdown still returned by this tool
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
    "SKILL.md should list search_references alongside the other tools"
    skill_md = (HERE.parent.parent / "SKILL.md").read_text("utf-8")
    assert "search_references" in skill_md, "SKILL.md missing search_references in tool list"


# --- v3.0 SCA / Q-Grader / CVA tools ----------------------------------------

def test_sca_path_zh():
    out = b.get_sca_path("zh")
    assert out.startswith("## ")
    assert "CSP" in out or "Coffee Skills Program" in out or "模块" in out


def test_sca_path_en():
    out = b.get_sca_path("en")
    assert "Q-Grader" in out


def test_sca_course_known():
    out = b.get_sca_course("brewing", "foundation", "en")
    assert out.startswith("{")
    assert '"brewing"' in out


def test_sca_course_unknown_module():
    out = b.get_sca_course("nope", "foundation")
    assert "未找到" in out
    assert "brewing" in out  # lists available


def test_sca_course_invalid_level():
    out = b.get_sca_course("introduction_to_coffee", "professional")
    assert "不含级别" in out or "no level" in out.lower()


def test_qgrader_exam_all():
    out = b.get_qgrader_exam("all", "en")
    assert out.startswith("{")
    assert '"categories"' in out


def test_qgrader_exam_specific():
    out = b.get_qgrader_exam("olfactory_Le_Nez", "zh")
    assert '"olfactory_Le_Nez"' in out
    assert "闻香瓶" in out or "Le Nez" in out


def test_qgrader_exam_unknown():
    out = b.get_qgrader_exam("nope")
    assert "未找到" in out


def test_qgrader_study_plan_default():
    out = b.get_qgrader_study_plan(30, "all", "zh")
    assert out.startswith("## ")
    assert "30" in out


def test_qgrader_study_plan_out_of_range():
    out = b.get_qgrader_study_plan(5, "all")
    assert "14-180" in out


def test_green_grade_specialty():
    out = b.get_green_grade(0, 5, 18, 11.0, "en")
    assert out.startswith("{")
    assert '"specialty"' in out


def test_green_grade_moisture_warning():
    out = b.get_green_grade(0, 0, 18, 9.0, "zh")
    assert "10-12" in out  # warning mentions range


def test_defect_bean_by_id():
    out = b.get_defect_bean("full_black", "all", "en")
    assert out.startswith("{")
    assert '"full_black"' in out


def test_defect_bean_list_primary():
    out = b.get_defect_bean("", "primary", "zh")
    assert '"defects"' in out


def test_defect_bean_unknown():
    out = b.get_defect_bean("nope")
    assert "未找到" in out


def test_cva_score_specialty_threshold():
    out = b.calculate_cva_score(7.0, language="en")
    assert "75.00" in out  # (7-1)/8*100 = 75
    assert "yes" in out.lower()  # specialty = yes


def test_cva_score_below_specialty():
    out = b.calculate_cva_score(5.0, language="zh")
    assert "50.00" in out  # (5-1)/8*100 = 50


def test_cva_score_out_of_range():
    out = b.calculate_cva_score(11, language="en")
    assert "out of" in out.lower() or "1-9" in out


def test_triangle_protocol_default():
    out = b.get_triangle_protocol(4, "origin", "en")
    assert out.startswith("{")
    assert '"rounds": 4' in out


def test_triangle_protocol_unknown_difficulty():
    out = b.get_triangle_protocol(4, "nope")
    assert "未知难度" in out


def test_search_sca_sources_match():
    out = b.search_sca_sources("CVA", "all", "en")
    assert out.startswith("## ")
    assert "sca.coffee" in out.lower() or "value-assessment" in out.lower()


def test_search_sca_sources_no_match():
    out = b.search_sca_sources("zzznothingzzz", "all", "en")
    assert "no" in out.lower() or "未找到" in out


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
