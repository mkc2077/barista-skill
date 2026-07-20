#!/usr/bin/env python3
"""Barista skill self-check.

Run:  python scripts/self_check.py
Prints a PASS/FAIL report of every consistency invariant the skill depends on:

1. 10 MCP tools: SKILL.md declared names == server.py actual @mcp.tool names
2. data/*.json: cardinality vs SKILL.md claims (14 brew / 11 milk / ...)
3. references: bilingual mirror status (which md files are allowed mono-lingual)
4. version: data/version.json (single source) syncs across 4 other sources
5. file presence: every data file server.py loads actually exists

Exit code 0 on all-pass, 1 on any FAIL. Useful as a quick pre-commit check
or as a CI gate. Mirrors mcp-server/test_data_consistency.py but is printable
and intended for humans; tests are intended for the build.
"""
from __future__ import annotations

import json
import re
import sys
import tomllib
import importlib.util
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
REFS = ROOT / "references"
SKILL = ROOT / "SKILL.md"
CHANGELOG = ROOT / "CHANGELOG.md"
SERVER = ROOT / "mcp-server" / "server.py"
PYPROJECT = ROOT / "mcp-server" / "pyproject.toml"


def ok(label: str, detail: str = "") -> None:
    line = "  PASS  " + label
    if detail:
        line += "\n        " + detail
    print(line)


def fail(label: str, detail: str) -> None:
    print("  FAIL  " + label)
    for ln in detail.splitlines():
        print("        " + ln)


def run_checks() -> int:
    fails = 0

    # [1.1] MCP tool name alignment
    print("[1.1] MCP tool names: SKILL.md declared == server.py actual")
    skill_text = SKILL.read_text("utf-8")
    lst = re.search(r"`get_recipe.*?search_references`", skill_text, re.DOTALL)
    if not lst:
        fail("SKILL.md tool list not found", "looking for `get_recipe ... get_learning_resources` block")
        fails += 1
        declared = set()
    else:
        declared = {n for n in re.findall(r"\b(get_\w+|diagnose_\w+|calculate_\w+|calibrate_\w+|search_\w+)\b", lst.group(0))}

    sv_text = SERVER.read_text("utf-8")
    actual = []
    sv_lines = sv_text.splitlines()
    for i, line in enumerate(sv_lines):
        if "@mcp.tool()" in line:
            for j in range(i + 1, min(i + 5, len(sv_lines))):
                fm = re.match(r"\s*(?:async\s+)?def\s+(\w+)", sv_lines[j])
                if fm:
                    actual.append(fm.group(1))
                    break
    actual_set = set(actual)

    missing_in_server = declared - actual_set
    missing_in_skill = actual_set - declared
    if not missing_in_server and not missing_in_skill:
        ok("10 tools aligned",
           "declared == actual == " + ", ".join(sorted(declared)) +
           " (count=" + str(len(actual_set)) + ")")
    else:
        fail("MCP tool names mismatch",
             "declared-not-actual: " + str(sorted(missing_in_server)) + "\n" +
             "actual-not-declared: " + str(sorted(missing_in_skill)))
        fails += 1

    # [1.2] SKILL.md numeric claims vs data/*.json cardinality
    print("")
    print("[1.2] SKILL.md numeric claims == data/*.json cardinality")
    EXPECTED = {
        "recipes.json":            (14, "14 brew methods"),
        "milk_drinks.json":        (11, "11 classic milk drinks"),
        "flavor_diagnosis.json":  (8,  "flavor diagnosis categories"),
        "cupping.json":           (10, "SCA cupping 10 dimensions"),
        "grinder.json":            (6, "grinder models"),
        "parameters_roast.json":   (3, "roast levels (light/med/dark)"),
        "parameters_origin.json":  (6, "origins"),
        "parameters_process.json": (4, "processes"),
        "flavor_wheel.json":        (9, "flavor wheel categories"),
        "learning_resources.json":  (3, "learning levels"),
        "mantras.json":             (4, "consultant mantras"),
        "sensory.json":             (5, "sensory training types"),
    }
    for fn, (exp, desc) in EXPECTED.items():
        p = DATA / fn
        if not p.exists():
            fail("data/" + fn + " present", "missing file (claimed: " + desc + ")")
            fails += 1
            continue
        obj = json.loads(p.read_text("utf-8"))
        act = len(obj)
        if act == exp:
            ok("data/" + fn + " == " + str(exp) + "  (" + desc + ")")
        else:
            fail("data/" + fn + " cardinality", "expected " + str(exp) + " (" + desc + "), got " + str(act))
            fails += 1

    # [2.1] Version single-source sync (5 sources)
    print("")
    print("[2.1] Version single-source sync (5 sources)")
    vj = json.loads((DATA / "version.json").read_text("utf-8"))
    expected_v = vj["version"]

    spec = importlib.util.spec_from_file_location("srvchk", SERVER)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    server_v = mod.__version__

    skill_m = re.search(r"^version:\s*([\d.]+)", skill_text, re.MULTILINE)
    skill_v = skill_m.group(1) if skill_m else "<missing>"

    cl_m = re.search(r"^##\s*\[([\d.]+)\]", CHANGELOG.read_text("utf-8"), re.MULTILINE)
    changelog_v = cl_m.group(1) if cl_m else "<missing>"

    py = tomllib.loads(PYPROJECT.read_text("utf-8"))
    vcfg = py["tool"]["hatch"]["version"]
    py_src = (PYPROJECT.parent / vcfg["path"]).resolve()
    pm = re.search(vcfg["pattern"], py_src.read_text("utf-8"))
    py_v = pm.group("version") if pm else "<missing>"

    sources = [
        ("data/version.json", expected_v),
        ("server.__version__", server_v),
        ("SKILL.md",           skill_v),
        ("CHANGELOG head",     changelog_v),
        ("pyproject regex",    py_v),
    ]
    versions = {v for _, v in sources}
    if len(versions) == 1:
        ok("all 5 sources = " + expected_v,
           "\n        ".join(k + ": " + v for k, v in sources))
    else:
        fail("version drift detected",
             "\n        ".join(k + ": " + v for k, v in sources))
        fails += 1

    if not (len(expected_v.split(".")) == 3 and all(p.isdigit() for p in expected_v.split("."))):
        fail("semver format", repr(expected_v) + " is not X.Y.Z")
        fails += 1

    # [3.1] references bilingual mirror
    print("")
    print("[3.1] references/ bilingual mirror status")
    cn = {p.name for p in REFS.glob("*.md")}
    en_dir = REFS / "en"
    en = {p.name for p in en_dir.glob("*.md")} if en_dir.exists() else set()

    ALLOWED_MONO = {"eval-cases.md", "example-dialogues.md", "glossary.md", "search-queries.md", "human-voice-rules.md"}
    missing_en = (cn - en) - ALLOWED_MONO
    allowed_missing = (cn - en) & ALLOWED_MONO

    if not missing_en:
        ok("bilingual mirror OK",
           "cn=" + str(len(cn)) + " en=" + str(len(en)) + " | allowed mono: " + str(sorted(allowed_missing)))
    else:
        fail("references/en/ missing mirrors",
             "unexpected missing (not in ALLOWED_MONO): " + str(sorted(missing_en)))
        fails += 1

    # [4.1] data files referenced by server.py all exist
    print("")
    print("[4.1] All _load_data() referenced files exist on disk")
    referenced = set(re.findall(r'_load_data\("(\w+\.json)"\)', sv_text))
    if not referenced:
        fail("_load_data() call sites", "no _load_data() call found in server.py")
        fails += 1
    for fn in sorted(referenced):
        if (DATA / fn).exists():
            ok("data/" + fn + " present")
        else:
            fail("data/" + fn + " missing", "server.py calls _load_data() but file absent")
            fails += 1

    # [5.1] references h2 counts vs expected minimums
    print("")
    print("[5.1] references/recipes-baseline.md headers >= 14 (brew methods)")
    rb = REFS / "recipes-baseline.md"
    if not rb.exists():
        fail("recipes-baseline.md present", "missing reference file")
        fails += 1
    else:
        h2 = len(re.findall(r"^## ", rb.read_text("utf-8"), re.MULTILINE))
        if h2 >= 14:
            ok("recipes-baseline.md has " + str(h2) + " ## headers (>=14 required)")
        else:
            fail("recipes-baseline.md h2 count", "expected >=14, got " + str(h2))
            fails += 1

    # [6.1] report templates presence + placeholders
    print("")
    print("[6.1] references/report_templates/ consultant templates")
    td = REFS / "report_templates"
    expected = {
        "recipe_card.md",
        "diagnosis_sheet.md",
        "cupping_scorecard.md",
        "grinder_calibration.md",
        "README.md",
    }
    if not td.exists():
        fail("report_templates dir", "references/report_templates/ missing")
        fails += 1
    else:
        actual = {p.name for p in td.glob("*.md")}
        missing = expected - actual
        extra = actual - expected
        if missing:
            fail("report_templates files", "missing: " + str(sorted(missing)))
            fails += 1
        elif extra:
            fail("report_templates files", "unexpected: " + str(sorted(extra)))
            fails += 1
        else:
            ok("report_templates dir OK",
               "5 files present: " + ", ".join(sorted(expected)))

        # Each template (not README) must have >=5 {{placeholder}} fields
        for fn in ("recipe_card.md", "diagnosis_sheet.md",
                   "cupping_scorecard.md", "grinder_calibration.md"):
            content = (td / fn).read_text("utf-8")
            n = len(set(re.findall(r"\{\{(\w+)\}\}", content)))
            if n >= 5:
                ok("report_templates/" + fn + " has " + str(n) + " placeholders")
            else:
                fail("report_templates/" + fn + " placeholders", "expected >=5, got " + str(n))
                fails += 1

        # SKILL.md should reference report_templates/
        skill_md_text = SKILL.read_text("utf-8")
        if "references/report_templates/" in skill_md_text:
            ok("SKILL.md references references/report_templates/")
        else:
            fail("SKILL.md references templates", "no point to references/report_templates/")
            fails += 1

    return fails


def main() -> int:
    print("=" * 72)
    print("barista-skill — self check (single-source-of-truth invariants)")
    print("=" * 72)
    fails = run_checks()
    print("")
    print("=" * 72)
    if fails == 0:
        print("RESULT: ALL CHECKS PASSED")
    else:
        print("RESULT: " + str(fails) + " CHECK(S) FAILED")
    print("=" * 72)
    return 0 if fails == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
