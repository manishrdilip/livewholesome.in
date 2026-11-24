"""Executable Gate-1 (digital) checks for a candidate recipe.  v2 (after GPT audit).
Statuses: PASS / WARN / FAIL / INDETERMINATE (missing data or uncertainty spans the limit) / PENDING (physical evidence).
A clean run is a SMOKE-TEST result only; it does NOT close Gate 1 and never implies release.
Usage: python3 verify_recipe.py [recipe.json]      exit 1 = digital FAIL, exit 2 = invalid input."""
import sys, os, json, math
USER_RECIPE = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else None
HERE = os.path.dirname(os.path.abspath(__file__)); OPT = os.path.join(HERE, "..", "optimizer")
sys.path.insert(0, OPT); os.chdir(OPT); sys.argv = [sys.argv[0], "sourced_inputs.json"]
import numpy as np
import robust_sweep as R, minerals as MN, amino_acids_v2 as A
D = R.D; NAMES = [d["name"] for d in D]
V42M = {"Ragi":190,"Khapli wheat":90,"Pearl millet":20,"Roasted Bengal gram":30,"Green gram":130,"Mappillai Samba rice":60,"Foxtail millet":45,"Kodo millet":50,"Little millet":45,"Barnyard millet":50,"Black chickpea":35,"Cowpea":45,"Masoor":80,"Barley":30,"Dry dates":30,"Puffed paddy":20,"Makhana":20,"Cardamom":10,"Dry ginger":10,"Amla":10}
LYS_LIT = {"Foxtail millet": 175 / 6.25, "Barnyard millet": 133 / 6.25, "Puffed paddy": 36.3}  # FAO 1995 T21; paddy proxy IFCT A013
V42_RAW = {d["name"]: d["v42"] for d in D}
BOUNDS = {d["name"]: (min(R.WIDE.get(d["name"], d["lo"]), d["v42"]), max(d["hi"], d["v42"], 10 if d["name"] in ("Cardamom", "Dry ginger") else 0)) for d in D}

def load(path):
    def hook(pairs):
        keys = [k for k, _ in pairs]; dup = {k for k in keys if keys.count(k) > 1}
        if dup: raise ValueError(f"duplicate keys: {sorted(dup)}")
        return dict(pairs)
    return json.load(open(path), object_pairs_hook=hook)

def validate(recipe):
    errs = []
    if not isinstance(recipe, dict): return ["recipe must be a JSON object"]
    missing = set(NAMES) - set(recipe); extra = set(recipe) - set(NAMES)
    if missing: errs.append(f"missing ingredients: {sorted(missing)}")
    if extra: errs.append(f"unknown ingredients: {sorted(extra)}")
    for k, v in recipe.items():
        if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v): errs.append(f"{k}: not a finite number ({v!r})")
        elif v < 0: errs.append(f"{k}: negative weight {v}")
        elif k in BOUNDS and not (BOUNDS[k][0] <= v <= BOUNDS[k][1]): errs.append(f"{k}: {v} g outside design bounds {BOUNDS[k]} (wide scenario incl. V4.2 level)")
    return errs

def run(recipe):
    w = np.array([float(recipe[n]) for n in NAMES]); v42 = np.array([d["v42"] for d in D]) * 1000 / 1020
    rep = R.rep(w, 3.5); out = []
    def add(rid, st, msg): out.append((rid, st, msg))
    add("R01", "PASS" if abs(w.sum() - 1000) < 1e-9 else "FAIL", f"sum={w.sum():g} g")
    P = rep["P"]; F = rep["F"]; T = rep["TDF"]
    add("R02", "PASS" if 12.5 <= P[1] <= 13.8 else "FAIL", f"protein central {P[1]} [model]")
    add("R02s", "INDETERMINATE" if (P[0] < 12.5 or P[2] > 13.8) else "PASS", f"protein stress range {P[0]}-{P[2]} vs 12.5-13.8")
    add("R03", "PASS" if F[1] <= 2.3 else "FAIL", f"fat central {F[1]} [model]")
    add("R03s", "INDETERMINATE" if F[2] > 2.3 else "PASS", f"fat stress-high {F[2]} vs 2.3")
    add("R04", "PASS" if T[1] >= 11 else "FAIL", f"TDF central {T[1]} [model]")
    add("R04s", "INDETERMINATE" if T[0] < 11 else "PASS", f"TDF stress-low {T[0]}")
    known = all(n in MN.MIN for n in NAMES if recipe[n] > 0)
    ok = bool(np.all(MN.M @ w >= MN.M @ v42 - 1e-9))
    add("R07m", ("PASS (conditional model)" if ok else "FAIL") if known else "INDETERMINATE",
        "known Ca/Fe/Zn/Mg >= V4.2" + ("" if known else " (partial: 5 ingredients have no mineral data)"))
    # amino acids: all 9 groups, lysine with literature values for foxtail/barnyard/paddy
    cov, a, b, need, mixb = A.analyse(w)
    for g in A.REF:
        lb = b[g] / A.REF[g]
        st = "PASS (conditional model)" if lb >= 1 else "INDETERMINATE"
        add(f"R06-{g}", st, f"lower bound {b[g]:.1f} / known-only {a[g]:.1f} mg/g (ref {A.REF[g]}) [composition, not DIAAS]")
    pf = np.array([float(R.vec("protein", "mid", 3.5)[i]) * w[i] for i in range(len(D))]); tot = pf.sum(); mg = cov_p = 0.0
    for i, n in enumerate(NAMES):
        if n in A.AA: mg += A.AA[n][3] * 10 * pf[i]; cov_p += pf[i]
        elif n in LYS_LIT: mg += LYS_LIT[n] * pf[i]; cov_p += pf[i]
    lb = mg / tot
    add("R06-Lys+lit", "PASS (conditional model)" if lb >= 48 else "INDETERMINATE",
        f"lysine incl. literature foxtail/barnyard/paddy: lower bound {lb:.2f}, covered {cov_p/tot*100:.1f}% of protein")
    cost = rep["cost_raw_price"]
    add("R28", "WARN" if cost > 115.04 else "PASS", f"raw-price cost {cost} vs normalised V4.2 115.04 (no owner ceiling; trade-off flagged)")
    add("R07", "INDETERMINATE", "per-serving declaration modelled only (milk values estimated); lab values required")
    add("R08", "INDETERMINATE", "MISSING DATA: vitamins/LA-ALA not yet sourced (digital gap) + assay later")
    add("R09", "INDETERMINATE", "MISSING DATA: phytate not yet sourced (digital gap)")
    for rid in ["R05","R10","R11","R12","R13","R14","R15","R16","R17","R18","R19","R20","R21","R22","R23","R24","R25","R26","R27","R29","R30","R31","R32","R33","R34","R35","R36"]:
        add(rid, "PENDING", "physical / specialist / regulatory evidence required")
    return out

def main():
    try: recipe = load(USER_RECIPE) if USER_RECIPE else V42M
    except (ValueError, json.JSONDecodeError) as e: print(f"INVALID INPUT:\n  {e}"); return 2
    errs = validate(recipe)
    if errs: print("INVALID INPUT:\n  " + "\n  ".join(errs)); return 2
    if abs(sum(recipe.values()) - 1000) > 1e-9:
        print(f"R01          FAIL          sum={sum(recipe.values()):g} g (must be 1000) - nutrient checks NOT run (no silent normalisation)")
        print("\nSMOKE TEST: FAIL\nGATE 1: OPEN\nRELEASE: NOT RELEASABLE"); return 1
    out = run(recipe)
    for r in out: print(f"{r[0]:12s} {r[1]:13s} {r[2]}")
    st = [r[1].split(" ")[0] for r in out]
    verdict = "FAIL" if "FAIL" in st else "NO DIGITAL FAIL (INDETERMINATE items open)" if "INDETERMINATE" in st else "NO DIGITAL FAIL"
    print(f"\nSMOKE TEST: {verdict}\nGATE 1: OPEN (closure needs verified sources + resolved INDETERMINATE items)\nRELEASE: NOT RELEASABLE (non-compensatory safety/stability/sensory/regulatory gates pending)")
    return 1 if "FAIL" in st else 0

if __name__ == "__main__": sys.exit(main())
