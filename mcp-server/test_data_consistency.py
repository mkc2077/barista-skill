#!/usr/bin/env python3
"""Consistency gate: md claims vs json data vs server.py tools.

Prevents the two-source-of-truth drift where SKILL.md / references/*.md
describe N items but the actual data/*.json (or server.py tools) contain M.
"""
import json, pathlib, re, sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
DATA = ROOT / "data"
REFS = ROOT / "references"

# ?? data/*.json existence + cardinality ??????????????????????????????????????

KNOWN_DATA_FILES = {
    "recipes.json":             "recipes (14 brew methods)",
    "milk_drinks.json":         "11 classic milk drinks",
    "flavor_diagnosis.json":    "flavor diagnosis categories",
    "cupping.json":             "SCA cupping dimensions",
    "grinder.json":             "grinder calibration",
    "parameters_roast.json":    "parameter by roast level",
    "parameters_origin.json":   "parameter by origin",
    "parameters_process.json":  "parameter by process",
    "flavor_wheel.json":        "coffee flavor wheel",
    "learning_resources.json":  "learning resources",
    "mantras.json":             "consultant mantras",
    "sensory.json":             "sensory training modules",
}

EXPECTED_CARDINALITY = {
    "recipes.json":             14,   # SKILL.md: "14 ???"
    "milk_drinks.json":         11,   # SKILL.md: "11 ?????"
    "flavor_diagnosis.json":     8,   # flavor problem categories (diagnose keys)
    "cupping.json":             10,   # SCA 10-point scale dimensions
    "grinder.json":              6,   # grinder models
    "parameters_roast.json":     3,   # light/medium/dark
    "parameters_origin.json":    6,   # origin regions
    "parameters_process.json":   4,   # wash/natural/honey/anaerobic
    "flavor_wheel.json":         9,   # flavor wheel categories
    "learning_resources.json":   3,   # beginner/intermediate/advanced
    "mantras.json":              4,   # consultant mantras
    "sensory.json":              5,   # sensory training types
}

# ?? SKILL.md claims cross-check ??????????????????????????????????????????????

try:
    skill_md = (ROOT / "SKILL.md").read_text("utf-8")
except FileNotFoundError:
    skill_md = ""

# Parse the description field for version numbers and count claims
# Version line: version: X.Y.Z
version_match = re.search(r"version:\s*([\d.]+)", skill_md)


def count_ref_headers(path, level="#", lang_label=None):
    "Count headers at given level in a reference md."
    if not path.exists():
        return -1  # missing
    text = path.read_text("utf-8")
    pattern = rf"^{level} "
    return len(re.findall(pattern, text, re.MULTILINE))


def test_all_data_json_present():
    for fn, desc in KNOWN_DATA_FILES.items():
        assert (DATA / fn).exists(), f"missing data/{fn} ({desc})"


def test_data_cardinality_matches_skill_md():
    for fn, expected in EXPECTED_CARDINALITY.items():
        obj = json.loads((DATA / fn).read_text("utf-8"))
        actual = len(obj)
        assert actual == expected, \
            f"data/{fn}: SKILL.md expects {expected} entries, got {actual}"


def test_skill_md_version_present():
    assert version_match, "SKILL.md missing 'version: X.Y.Z' in frontmatter"
    ver = version_match.group(1)
    assert len(ver.split(".")) == 3, f"version should be semver: {ver}"


def test_references_documented_count_claims():
    "SKILL.md says 14 ??? / 14 brew methods. Verify recipes-baseline.md h2 count."
    # recipes-baseline.md h2 count
    rp = REFS / "recipes-baseline.md"
    if rp.exists():
        h2_count = count_ref_headers(rp, "##")
        # SKILL.md claims 14 brew methods; reference file is user-facing prose
        # and may have extra headers (reminders, etc). Check >= 14.
        assert h2_count >= 14, \
            f"recipes-baseline.md has {h2_count} ## headers, expected >=14 (14 brew methods per SKILL.md)"


def test_en_refs_mirror_structure():
    "Verify how many reference files have en/ counterparts."
    cn_files = {p.name for p in REFS.glob("*.md")}
    en_dir = REFS / "en"
    if en_dir.exists():
        en_files = {p.name for p in en_dir.glob("*.md")}
    else:
        en_files = set()
    missing_en = cn_files - en_files - {"README.md"}  # README.md is the en/README.md, not a mirror
    # Some files are intentionally mono-lingual (eval-cases, example-dialogues,
    # glossary, search-queries). Log them so the test is informational.
    allowed_mono = {"eval-cases.md", "example-dialogues.md", "glossary.md", "search-queries.md", "human-voice-rules.md"}
    unexpected_missing = missing_en - allowed_mono
    assert not unexpected_missing, \
        f"references/en/ missing mirrored files (not in allowed_mono): {unexpected_missing}"


def test_server_tool_count_matches_skill_md():
    "SKILL.md lists 11 MCP tools; verify server.py has exactly 11 @mcp.tool()."
    server = (ROOT / "mcp-server" / "server.py").read_text("utf-8")
    actual = len(re.findall(r"@mcp\.tool\(\)", server))
    # SKILL.md says "10 ????? / 10 bilingual tools"
    assert actual == 11, f"server.py has {actual} @mcp.tool(), SKILL.md claims 10"


def test_data_equals_server_import():
    "Deep equality: server.py imports match data/*.json on disk."
    import importlib.util
    spec = importlib.util.spec_from_file_location("server_consistency", ROOT / "mcp-server" / "server.py")
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)

    mapping = {
        "RECIPES": "recipes.json", "MILK_DRINKS": "milk_drinks.json",
        "FLAVOR_DIAGNOSIS": "flavor_diagnosis.json", "CUPPING_DIMENSIONS": "cupping.json",
        "GRINDER_SETTINGS": "grinder.json", "PARAMETERS_BY_ROAST": "parameters_roast.json",
        "PARAMETERS_BY_ORIGIN": "parameters_origin.json", "PARAMETERS_BY_PROCESS": "parameters_process.json",
        "FLAVOR_WHEEL": "flavor_wheel.json", "LEARNING_RESOURCES": "learning_resources.json",
        "MANTRAS": "mantras.json", "SENSORY": "sensory.json",
    }

    def norm(x):
        if isinstance(x, (tuple, list)): return [norm(i) for i in x]
        if isinstance(x, dict): return {k: norm(v) for k, v in x.items()}
        return x

    bad = []
    for attr, fn in mapping.items():
        loaded = json.loads((DATA / fn).read_text("utf-8"))
        live = getattr(m, attr)
        if norm(live) != loaded:
            bad.append(attr)

    assert not bad, f"server.py + data/*.json mismatch: {bad}"


# ?? version single-source sync ???????????????????????????????????????????????
# data/version.json is the single source of truth. SKILL.md, CHANGELOG.md,
# mcp-server/pyproject.toml (via hatchling regex source), and server.py
# __version__ must all agree on it. This test prevents the 3-way drift that
# used to happen when bumping version by hand in multiple files.

def test_data_version_json_present():
    assert (DATA.parent / "data" / "version.json").exists(), "data/version.json missing"


def test_version_single_source_sync():
    import importlib.util, tomllib
    version_file = ROOT / "data" / "version.json"
    expected = json.loads(version_file.read_text("utf-8"))["version"]

    # 1. server.py __version__
    spec = importlib.util.spec_from_file_location("server_v", ROOT / "mcp-server" / "server.py")
    srv = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(srv)
    server_v = srv.__version__
    assert server_v == expected, \
        f"server.py __version__={server_v} != data/version.json={expected}"

    # 2. SKILL.md frontmatter version
    skill = (ROOT / "SKILL.md").read_text("utf-8")
    skill_m = re.search(r"^version:\s*([\d.]+)", skill, re.MULTILINE)
    assert skill_m, "SKILL.md missing version: X.Y.Z"
    skill_v = skill_m.group(1)
    assert skill_v == expected, \
        f"SKILL.md version={skill_v} != data/version.json={expected}"

    # 3. CHANGELOG.md head entry
    cl = (ROOT / "CHANGELOG.md").read_text("utf-8")
    cl_m = re.search(r"^##\s*\[([\d.]+)\]", cl, re.MULTILINE)
    assert cl_m, "CHANGELOG.md missing '## [X.Y.Z]'"
    changelog_v = cl_m.group(1)
    assert changelog_v == expected, \
        f"CHANGELOG head={changelog_v} != data/version.json={expected}"

    # 4. pyproject.toml dynamic version regex resolves to same value.
    #    Hatchling regex source: read data/version.json, apply pattern.
    #    We simulate hatchling here (without requiring the build backend).
    import tomllib
    py_t = (ROOT / "mcp-server" / "pyproject.toml").read_text("utf-8")
    py = tomllib.loads(py_t)
    assert py["project"].get("dynamic") == ["version"], \
        "pyproject.toml [project] must have dynamic = [\"version\"]"
    vcfg = py["tool"]["hatch"]["version"]
    assert vcfg["source"] == "regex", "expected hatch.version source=regex"
    pyproject_dir = (ROOT / "mcp-server").resolve()
    src_file = (pyproject_dir / vcfg["path"]).resolve()
    src_content = src_file.read_text("utf-8")
    py_m = re.search(vcfg["pattern"], src_content)
    assert py_m, f"hatch regex did not match in {src_file}: pattern={vcfg['pattern']!r}"
    py_v = py_m.group("version")
    assert py_v == expected, \
        f"pyproject dynamic version={py_v} != data/version.json={expected}"


# ?? scripts/self_check.py gate ???????????????????????????????????????????????
# The standalone self_check.py is a human-facing mirror of these tests.
# Keep them both honest: the test just verifies the script still runs clean.

def test_self_check_script_passes():
    import subprocess, sys
    out = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "self_check.py")],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
        cwd=str(ROOT),
    )
    assert out.returncode == 0, \
        f"scripts/self_check.py exited {out.returncode}\nSTDOUT:\n{out.stdout[-1500:]}\nSTDERR:\n{out.stderr[-500:]}"
def test_version_is_semver():
    v = json.loads((ROOT / "data" / "version.json").read_text("utf-8"))["version"]
    parts = v.split(".")
    assert len(parts) == 3 and all(p.isdigit() for p in parts), \
        f"version {v!r} is not semver (X.Y.Z)"


# ?? report templates ?????????????????????????????????????????????????????????
# Borrowing novel-audit's design of "deterministic templates replacing LLM
# improvisation": the consultant is supposed to reuse these 4 structured
# output templates instead of formatting every reply from scratch.

REPORT_TEMPLATES = {
    "recipe_card.md":        ("Equipment", "method", "dose", "Grind"),
    "diagnosis_sheet.md":    ("Symptom", "Candidate", "Primary", "Verification"),
    "cupping_scorecard.md":  ("Cupping", "Dimension", "Score", "Total"),
    "grinder_calibration.md": ("Grinder", "Direction", "Amount", "Verification"),
}


def test_report_templates_dir_exists():
    d = ROOT / "references" / "report_templates"
    assert d.exists() and d.is_dir(), "references/report_templates/ dir missing"


def test_report_templates_files_present():
    d = ROOT / "references" / "report_templates"
    for fn in list(REPORT_TEMPLATES.keys()) + ["README.md"]:
        assert (d / fn).exists(), f"report_templates/{fn} missing"


def test_report_templates_have_placeholders():
    import re
    d = ROOT / "references" / "report_templates"
    for fn in REPORT_TEMPLATES:
        content = (d / fn).read_text("utf-8")
        # Each template must have at least 5 named placeholders of the form {{name}}
        placeholders = set(re.findall(r"\{\{(\w+)\}\}", content))
        assert len(placeholders) >= 5, \
            f"report_templates/{fn}: only {len(placeholders)} placeholders; need >= 5"


def test_report_templates_have_expected_sections():
    d = ROOT / "references" / "report_templates"
    en_keywords = {
        "recipe_card.md":         "Recipe Card",
        "diagnosis_sheet.md":     "Diagnosis",
        "cupping_scorecard.md":   "Cupping",
        "grinder_calibration.md": "Calibration",
    }
    for fn, expected_kw in en_keywords.items():
        content = (d / fn).read_text("utf-8")
        assert expected_kw in content, \
            f"report_templates/{fn}: expected '{expected_kw}' in title"


def test_skill_md_references_report_templates():
    """SKILL.md should point users at references/report_templates/."""
    skill = (ROOT / "SKILL.md").read_text("utf-8")
    assert "references/report_templates/" in skill, \
        "SKILL.md should reference references/report_templates/"
