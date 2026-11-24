"""Purna formula optimizer: integer (5 g step) cost-minimising LP with scenario sweeps.
Usage: python3 optimize.py inputs.json   (needs scipy>=1.9)"""
import json, sys, numpy as np
from scipy.optimize import milp, LinearConstraint, Bounds

D = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "inputs.json"))["ingredients"]
N = len(D); STEP = 5
price = np.array([d["price"] for d in D]) / 1000
nut = {k: np.array([d[k] for d in D]) / 1000 for k in ("protein", "fat", "tdf")}  # g per 100 g mix per g ingredient
grp = lambda g: np.array([1.0 if d["group"] == g else 0.0 for d in D])

def solve(pmin=13.8, fmax=2.2, tmin=12.0, pulse_max=None, millet_min=None, fat_scale=1.0):
    # variables: k_i integer, grams = STEP*k_i
    A, lo, hi = [np.ones(N) * STEP], [1000], [1000]
    A.append(nut["protein"] * STEP); lo.append(pmin); hi.append(np.inf)
    A.append(nut["fat"] * fat_scale * STEP); lo.append(-np.inf); hi.append(fmax)
    A.append(nut["tdf"] * STEP); lo.append(tmin); hi.append(np.inf)
    if pulse_max is not None: A.append(grp("pulse") * STEP); lo.append(-np.inf); hi.append(pulse_max * 10)
    if millet_min is not None: A.append(grp("millet") * STEP); lo.append(millet_min * 10); hi.append(np.inf)
    b = Bounds([d["lo"] / STEP for d in D], [d["hi"] / STEP for d in D])
    r = milp(price * STEP, constraints=LinearConstraint(np.array(A), lo, hi), bounds=b, integrality=np.ones(N))
    return None if not r.success else np.round(r.x).astype(int) * STEP

def report(w, fat_scale=1.0):
    t = w.sum()
    return dict(sum=int(t), cost=round(float(price @ w * 1000 / t), 2),
                protein=round(float(nut["protein"] @ w * 1000 / t), 2),
                fat=round(float(nut["fat"] @ w * 1000 / t * fat_scale), 2),
                tdf=round(float(nut["tdf"] @ w * 1000 / t), 2),
                pulses_pct=round(float(grp("pulse") @ w / t * 100), 1),
                millet_pct=round(float(grp("millet") @ w / t * 100), 1))

if __name__ == "__main__":
    print("== Existing formulas (same inputs) ==")
    for key in ("v42", "B", "C"):
        print(key, report(np.array([d[key] for d in D])))
    print("\n== Scenario sweep: protein >= 13.8, TDF >= 12, cost-minimised, integer 5 g ==")
    for fmax in (2.2, 2.3):
        for pc in (35, 40, 45):
            for mm in (None, 30, 35):
                w = solve(fmax=fmax, pulse_max=pc, millet_min=mm)
                tag = f"fat<={fmax} pulse<={pc}% millet>={mm or '-'}%"
                print(tag, "INFEASIBLE" if w is None else report(w))
    print("\n== Robust: fat +10% (fat_scale 1.1) must still be <= 2.3 ==")
    for pc in (35, 40, 45):
        w = solve(fmax=2.3, pulse_max=pc, fat_scale=1.1)
        print(f"pulse<={pc}%", "INFEASIBLE" if w is None else {**report(w), "fat_if_+10%": report(w, 1.1)["fat"],
              "grams": {d['name']: int(x) for d, x in zip(D, w)}})
