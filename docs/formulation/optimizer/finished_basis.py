"""Finished-powder basis model.
Case F (default, matches spec: listed weights are processed, dried/roasted ingredient weights):
  each ingredient's nutrients are converted to dry solids, then to the target finished moisture (3.5 %), then weighted.
Missing moisture -> 10 % assumed (flagged).
Also: worst/best-case ranges for the 3 unsourced ingredients, and MILP re-optimisation on finished basis.
Usage: python3 finished_basis.py sourced_inputs.json"""
import sys, json, numpy as np
from scipy.optimize import milp, LinearConstraint, Bounds
D = json.load(open(sys.argv[1]))["ingredients"]; N = len(D); S = 5; MF = 3.5
def mois(d): return d["source"]["moisture_g"] or 10.0
def fin(d, k, val=None):
    v = d[k] if val is None else val
    return v * (100 - MF) / (100 - mois(d))
price = np.array([d["price"] for d in D]) / 1000
def vec(k, over=None):
    over = over or {}
    return np.array([fin(d, k, over.get((d["name"], k))) for d in D]) / 1000
def rep(w, over=None):
    t = w.sum(); r = {k: round(float(vec(k, over) @ w * 1000 / t), 2) for k in ("protein", "fat", "tdf")}
    r["cost"] = round(float(price @ w * 1000 / t), 2); return r
F = {k: {} for k in ("lo", "hi")}
# defensible ranges for unsourced items [estimate ranges, wide on purpose]
RANGES = {("Foxtail millet", "fat"): (3.0, 5.0), ("Foxtail millet", "protein"): (10.0, 13.0),
          ("Barnyard millet", "fat"): (2.0, 4.0), ("Barnyard millet", "protein"): (6.0, 11.0),
          ("Makhana", "fat"): (0.1, 2.0), ("Makhana", "protein"): (8.0, 11.0)}
for (n, k), (a, b) in RANGES.items(): F["lo"][(n, k)] = a; F["hi"][(n, k)] = b
W = {"V4.2": np.array([d["v42"] for d in D]), "B": np.array([d["B"] for d in D]), "C": np.array([d["C"] for d in D])}
v44b = {"Ragi":185,"Khapli wheat":40,"Pearl millet":65,"Roasted Bengal gram":60,"Green gram":160,"Mappillai Samba rice":40,"Foxtail millet":30,"Kodo millet":30,"Little millet":30,"Barnyard millet":30,"Black chickpea":30,"Cowpea":50,"Masoor":80,"Barley":80,"Dry dates":30,"Puffed paddy":20,"Makhana":20,"Cardamom":5,"Dry ginger":5,"Amla":10}
W["V4.4b"] = np.array([v44b[d["name"]] for d in D])
def opt(obj, pmin, fmax, tmin, over=None):
    A = [np.ones(N) * S, vec("protein", over) * S, vec("fat", over) * S, vec("tdf", over) * S]
    r = milp((price if obj == "cost" else vec("fat", over)) * S, constraints=LinearConstraint(np.array(A), [1000, pmin, -np.inf, tmin], [1000, np.inf, fmax, np.inf]),
             bounds=Bounds([d["lo"] / S for d in D], [d["hi"] / S for d in D]), integrality=np.ones(N), options={"mip_rel_gap": 0})
    return r.status, r.message, (None if r.x is None else np.round(r.x).astype(int) * S)
if __name__ == "__main__":
    print(f"Finished-powder basis, moisture {MF} %, per-ingredient dry-solids normalisation\n")
    for k, w in W.items(): print(f"{k:6s} central {rep(w)}  worst(hi fat/lo prot) {rep(w, F['hi'])['fat']} fat / {rep(w, F['lo'])['protein']} prot")
    for label, a in [("min-fat (P>=12.5, TDF>=11, central)", ("fat", 12.5, 99, 11)),
                     ("min-cost P 12.5-13.8 window via P>=12.5, F<=2.2, TDF>=11 (central)", ("cost", 12.5, 2.2, 11)),
                     ("min-cost robust: F<=2.2 with worst-case unsourced fats", ("cost", 12.5, 2.2, 11, F["hi"]))]:
        st, msg, w = opt(*a)
        print(f"\n{label}: status={st} ({msg})")
        if w is not None: print(rep(w), "| worst fat", rep(w, F["hi"])["fat"]); print({d["name"]: int(x) for d, x in zip(D, w)})
