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
    v42 = {d["name"]: d["v42"] for d in V.D}; r = run(v42, tmp_path); assert r.returncode == 1 and "R01" in r.stdout
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
