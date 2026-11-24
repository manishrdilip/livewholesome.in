"""Runnable sweep for the minimal-change analysis (fixes GPT audit: parameters actually used, budgets implemented).
Mode A: min grams moved s.t. central fat <= L (L in 2.3, 2.2, 2.1, 2.0) and optional robust-high fat <= 2.3.
Mode B: fixed move budget (25/50/100/150 g/kg): min central fat.
Common: protein central within [12.5, 13.8]; TDF, Ca, Fe, Zn, Mg (known partial contributions) >= V4.2; identity items fixed.
Usage: python3 minimal_change_sweep.py sourced_inputs.json"""
import sys, numpy as np
sys.argv = sys.argv[:2]
import robust_sweep as R, minerals as MN
from scipy.optimize import milp, LinearConstraint, Bounds
D, N, S = R.D, R.N, R.S
v42 = np.array([d["v42"] for d in D]) * 1000 / 1020
FIX = {"Dry dates", "Cardamom", "Dry ginger", "Amla", "Puffed paddy", "Makhana"}
def build(fat_central=None, fat_robust=None, budget=None, obj="move"):
    rows, L, U = [], [], []; z = np.zeros(N)
    def add(a, b, l, u): rows.append(np.concatenate([a, b])); L.append(l); U.append(u)
    add(np.ones(N) * S, z, 1000, 1000)
    add(R.vec("protein", "mid", 3.5) * S, z, 12.5, 13.8)
    add(R.vec("tdf", "mid", 3.5) * S, z, float(R.vec("tdf", "mid", 3.5) @ v42), np.inf)
    for j in range(4): add(MN.M[j] * S, z, float(MN.M[j] @ v42), np.inf)
    if fat_central is not None: add(R.vec("fat", "mid", 3.5) * S, z, -np.inf, fat_central)
    if fat_robust is not None: add(R.vec("fat", "hi", 3.5) * S, z, -np.inf, fat_robust)
    for i in range(N):
        e = np.zeros(N); e[i] = 1; k = np.zeros(N); k[i] = S
        add(k, -e, -np.inf, v42[i]); add(k, e, v42[i], np.inf)
    if budget is not None: add(z, np.ones(N) * 0.5, -np.inf, budget)
    lo, hi = [], []
    for i, d in enumerate(D):
        if d["name"] in FIX: v = round(v42[i] / S); lo.append(v); hi.append(v)
        else: lo.append(min(R.WIDE.get(d["name"], d["lo"]), v42[i]) / S); hi.append(max(d["hi"], v42[i]) / S)
    c = np.concatenate([z, np.ones(N) * 0.5]) if obj == "move" else np.concatenate([R.vec("fat", "mid", 3.5) * S, z])
    r = milp(c, constraints=LinearConstraint(np.array(rows), L, U), bounds=Bounds(lo + [0] * N, hi + [np.inf] * N),
             integrality=np.concatenate([np.ones(N), z]), options={"mip_rel_gap": 0})
    return r
def show(tag, r):
    if r.x is None: print(f"{tag}: scipy status {r.status} -> INFEASIBLE"); return
    w = np.round(r.x[:N]).astype(int) * S; mv = 0.5 * np.abs(w - v42).sum(); rp = R.rep(w, 3.5)
    print(f"{tag}: status {r.status} | moved {mv:.1f} g | P {rp['P']} F {rp['F']} TDF {rp['TDF']} pulses {rp['pulses']}% cost {rp['cost_raw_price']}")
    print("    weights:", {d['name']: int(x) for d, x in zip(D, w)})
    print("    changed (>=5 g):", sum(abs(w - v42) >= 5), "| minerals (partial known):", MN.cover(w))
if __name__ == "__main__":
    print("V4.2 normalised:", R.rep(v42, 3.5))
    print("\n-- Mode A: min move for fat target --")
    for Lf in (2.3, 2.2, 2.1, 2.0): show(f"central fat<={Lf}", build(fat_central=Lf))
    show("robust-high fat<=2.3", build(fat_robust=2.3))
    print("\n-- Mode B: fixed move budget, min central fat --")
    for b in (25, 50, 100, 150): show(f"budget {b} g", build(budget=b, obj="fat"))
