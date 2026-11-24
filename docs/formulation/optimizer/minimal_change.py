"""Minimal-change optimiser (owner clarification): smallest recipe change from normalised V4.2 that fixes fat,
while not losing protein, fibre or minerals vs V4.2 and limiting 'beany' risk.
Distance = half L1 distance in g/kg (= grams moved). Finished basis 3.5 %, IFCT inputs.
Sensory: NO validated sensory model exists for these ingredients; we use transparent PROXY guards only:
 - pulse share (beany-note proxy), spice grams fixed at V4.2 (aroma identity), dates fixed (sweetness identity).
Usage: python3 minimal_change.py sourced_inputs.json"""
import sys, numpy as np
sys.argv = sys.argv[:2]
import robust_sweep as R, minerals as MN
from scipy.optimize import milp, LinearConstraint, Bounds
D, N, S = R.D, R.N, R.S
ref = np.array([d["v42"] for d in D]) * 1000 / 1020                   # normalised V4.2 (non-integer)
FIX = {"Dry dates", "Cardamom", "Dry ginger", "Amla", "Puffed paddy", "Makhana"}  # identity / sweetness / aroma / texture held
pulse = R.grp("pulse")
def solve(fat_mode, pulse_max, budget=None):
    # vars: k_i (int, grams/5), u_i >= |5k_i - ref_i|
    rows, L, U = [], [], []
    def add(r, l, u): rows.append(r); L.append(l); U.append(u)
    z = np.zeros(N)
    add(np.concatenate([np.ones(N) * S, z]), 1000, 1000)
    side = "hi" if fat_mode == "robust" else "mid"
    add(np.concatenate([R.vec("fat", side, 3.5) * S, z]), -np.inf, 2.3)
    v42 = np.array([d["v42"] for d in D]) * 1000 / 1020
    for k in ("protein", "tdf"):  # no worse than V4.2 (central)
        add(np.concatenate([R.vec(k, "mid", 3.5) * S, z]), float(R.vec(k, "mid", 3.5) @ v42), np.inf)
    for j in range(4):  # minerals no worse than V4.2
        add(np.concatenate([MN.M[j] * S, z]), float(MN.M[j] @ v42), np.inf)
    add(np.concatenate([pulse * S, z]), -np.inf, pulse_max * 10)
    for i in range(N):
        e = np.zeros(N); e[i] = 1; k = np.zeros(N); k[i] = S
        add(np.concatenate([k, -e]), -np.inf, ref[i]); add(np.concatenate([k, e]), ref[i], np.inf)
    lo = []; hi = []
    for i, d in enumerate(D):
        if d["name"] in FIX: v = round(ref[i] / S); lo.append(v); hi.append(v)
        else: lo.append(min(R.WIDE.get(d["name"], d["lo"]), ref[i]) / S); hi.append(max(d["hi"], ref[i]) / S)
    c = np.concatenate([np.zeros(N), np.ones(N) * 0.5])
    r = milp(c, constraints=LinearConstraint(np.array(rows), L, U),
             bounds=Bounds(lo + [0] * N, hi + [np.inf] * N), integrality=np.concatenate([np.ones(N), z]), options={"mip_rel_gap": 0})
    return r
if __name__ == "__main__":
    print("fixed at V4.2 levels (normalised, rounded to 5 g):", sorted(FIX))
    for fm in ("central", "robust"):
        for pm in (30, 33, 36, 40):
            r = solve(fm, pm)
            if r.x is None: print(f"fat {fm} <=2.3, pulses<={pm}%: INFEASIBLE (scipy {r.status})"); continue
            w = np.round(r.x[:N]).astype(int) * S; moved = 0.5 * np.abs(w - ref).sum()
            print(f"\nfat {fm} <=2.3, pulses<={pm}%: grams moved = {moved:.0f} g/kg | {R.rep(w, 3.5)}")
            print("   minerals:", MN.cover(w))
            print("   changes vs V4.2:", {d['name']: f"{ref[i]:.0f}->{w[i]}" for i, d in enumerate(D) if abs(w[i] - ref[i]) >= 5})
