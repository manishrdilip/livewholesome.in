"""Executable Gate-1 (digital) verification for a candidate recipe.
Checks only what the digital model can check; every physical requirement is reported as PENDING, never PASS.
Safety items are non-compensatory: overall status can never be 'RELEASE' from this script.
Usage: python3 verify_recipe.py [recipe.json]   (default: V4.2-M)   exit code 1 if any digital check FAILS."""
import sys, os, json, numpy as np
USER_RECIPE = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else None
HERE = os.path.dirname(os.path.abspath(__file__)); OPT = os.path.join(HERE, "..", "optimizer")
sys.path.insert(0, OPT); os.chdir(OPT); sys.argv = [sys.argv[0], "sourced_inputs.json"]
import robust_sweep as R, minerals as MN, amino_acids_v2 as A
D = R.D
V42M = {"Ragi":190,"Khapli wheat":90,"Pearl millet":20,"Roasted Bengal gram":30,"Green gram":130,"Mappillai Samba rice":60,"Foxtail millet":45,"Kodo millet":50,"Little millet":45,"Barnyard millet":50,"Black chickpea":35,"Cowpea":45,"Masoor":80,"Barley":30,"Dry dates":30,"Puffed paddy":20,"Makhana":20,"Cardamom":10,"Dry ginger":10,"Amla":10}
recipe = json.load(open(USER_RECIPE)) if USER_RECIPE else V42M
w = np.array([recipe[d["name"]] for d in D]); v42 = np.array([d["v42"] for d in D]) * 1000 / 1020
rep = R.rep(w, 3.5); res = []
def chk(rid, ok, detail, kind="DIGITAL"): res.append((rid, kind, "PASS" if ok else "FAIL", detail))
chk("R01", w.sum() == 1000, f"sum={w.sum()} g")
chk("R02", 12.5 <= rep["P"][1] <= 13.8, f"protein central {rep['P'][1]} (robust {rep['P'][0]}-{rep['P'][2]}) [model]")
chk("R03", rep["F"][1] <= 2.3, f"fat central {rep['F'][1]}, stress-high {rep['F'][2]} [model]")
res.append(("R03b", "DIGITAL", "WARN" if rep["F"][2] > 2.3 else "PASS", f"stress-high fat {rep['F'][2]} vs 2.3 -> lab decides"))
chk("R04", rep["TDF"][1] >= 11.0, f"TDF central {rep['TDF'][1]} [model]")
m_new, m_old = MN.M @ w, MN.M @ v42
chk("R07m", all(m_new >= m_old - 1e-9), "known Ca/Fe/Zn/Mg >= V4.2 (partial known contribution)")
cov, a, b, need, mixb = A.analyse(w)
res.append(("R06", "DIGITAL", "PASS" if b["Lys"] >= 48 else ("WARN" if need["Lys"] < 24 else "FAIL"),
            f"lysine lower bound {b['Lys']:.1f} mg/g (ref 48); missing protein must avg {need['Lys']:.0f} [composition, not DIAAS]"))
for rid in ("R05","R08","R09","R10","R11","R12","R13","R14","R15","R16","R17","R18","R19","R20","R21","R22","R23","R24","R25","R26","R27","R29","R30"):
    res.append((rid, "PHYSICAL/REG", "PENDING", "requires lab, pilot, specialist or regulatory evidence"))
for r in res: print(f"{r[0]:5s} {r[1]:13s} {r[2]:8s} {r[3]}")
fails = [r for r in res if r[2] == "FAIL"]
print("\nGATE 1 (digital):", "FAIL" if fails else "PASS (with warnings)" if any(r[2] == "WARN" for r in res) else "PASS")
print("RELEASE STATUS: NOT RELEASABLE - safety/stability/sensory/regulatory gates pending (non-compensatory)")
sys.exit(1 if fails else 0)
