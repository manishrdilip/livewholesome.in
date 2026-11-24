"""Adversarial unit tests for verify_recipe.py. Run: python3 -m pytest -q test_verify_recipe.py"""
import json, subprocess, sys, os, copy
HERE = os.path.dirname(os.path.abspath(__file__))
sys.argv = [sys.argv[0]]; sys.path.insert(0, HERE)
import verify_recipe as V
def run(recipe, tmp):
    p = tmp / "r.json"; p.write_text(json.dumps(recipe))
    return subprocess.run([sys.executable, os.path.join(HERE, "verify_recipe.py"), str(p)], capture_output=True, text=True)
BASE = V.V42M
def test_lead_has_no_digital_fail(tmp_path): assert run(BASE, tmp_path).returncode == 0
def test_current_v42_fails(tmp_path):
    v42 = {d["name"]: d["v42"] for d in V.D}; r = run(v42, tmp_path); assert r.returncode == 1 and "R01" in r.stdout and "NOT run" in r.stdout
def test_extra_key_rejected(tmp_path): r = run({**BASE, "Sugar": 0}, tmp_path); assert r.returncode == 2 and "unknown" in r.stdout
def test_missing_key_rejected(tmp_path):
    x = copy.deepcopy(BASE); del x["Amla"]; r = run(x, tmp_path); assert r.returncode == 2 and "missing" in r.stdout
def test_negative_rejected(tmp_path): r = run({**BASE, "Ragi": -10}, tmp_path); assert r.returncode == 2
def test_nan_rejected(tmp_path):
    p = tmp_path / "r.json"; p.write_text(json.dumps(BASE).replace('"Ragi": 190', '"Ragi": NaN'))
    r = subprocess.run([sys.executable, os.path.join(HERE, "verify_recipe.py"), str(p)], capture_output=True, text=True); assert r.returncode == 2
def test_string_rejected(tmp_path): r = run({**BASE, "Ragi": "190"}, tmp_path); assert r.returncode == 2
def test_bool_rejected(tmp_path): r = run({**BASE, "Amla": True}, tmp_path); assert r.returncode == 2
def test_wrong_total_fails(tmp_path): r = run({**BASE, "Ragi": 200}, tmp_path); assert r.returncode == 1
def test_never_releasable(tmp_path): assert "NOT RELEASABLE" in run(BASE, tmp_path).stdout
def test_uncertainty_is_indeterminate_not_pass(tmp_path):
    out = run(BASE, tmp_path).stdout; line = [l for l in out.splitlines() if l.startswith("R03s")][0]; assert "INDETERMINATE" in line

def raw(text, tmp):
    p = tmp / "r.json"; p.write_text(text)
    return subprocess.run([sys.executable, os.path.join(HERE, "verify_recipe.py"), str(p)], capture_output=True, text=True)
def test_duplicate_key_rejected(tmp_path):
    body = json.dumps(BASE)[:-1] + ', "Ragi": 190}'; r = raw(body, tmp_path); assert r.returncode == 2 and "duplicate" in r.stdout
def test_zero_total_no_crash(tmp_path):
    z = {k: 0 for k in BASE}; r = run(z, tmp_path); assert r.returncode in (1, 2) and "Traceback" not in r.stderr
def test_out_of_design_bounds_rejected(tmp_path): r = run({**BASE, "Pearl millet": 300}, tmp_path); assert r.returncode == 2 and "design bounds" in r.stdout
def test_wrong_total_skips_nutrients(tmp_path):
    r = run({**BASE, "Ragi": 200}, tmp_path); assert r.returncode == 1 and "NOT run" in r.stdout
def test_partial_minerals_never_fail(tmp_path):
    line = [l for l in run(BASE, tmp_path).stdout.splitlines() if l.startswith("R07m")][0]; assert "FAIL" not in line
def test_missing_data_items_indeterminate(tmp_path):
    out = run(BASE, tmp_path).stdout
    for rid in ("R07 ", "R08 ", "R09 "): assert any(l.startswith(rid) and "INDETERMINATE" in l for l in out.splitlines()), rid
def test_aa_never_fail_with_missing_data(tmp_path):
    out = run(BASE, tmp_path).stdout; assert not any(l.startswith("R06") and " FAIL " in l for l in out.splitlines())
