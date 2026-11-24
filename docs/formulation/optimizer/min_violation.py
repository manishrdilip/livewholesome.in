"""Minimum-violation frontier (GPT request). Uses robust_sweep.py's uncertainty model (rectangular +/-2 SD stress test, NOT confidence intervals).
Hard: robust-low P >= 12.5, robust-high fat <= 2.3 at BOTH 3.5 % and 0 % moisture, robust-low TDF >= 11 (both endpoints).
Minimise slack s = max(0, robust-high P - 13.8) at the 0 % endpoint (worst case for the ceiling). Then min-cost at that slack.
Usage: python3 min_violation.py sourced_inputs.json"""
import sys, numpy as np
sys.argv = sys.argv[:2]
import robust_sweep as R
from scipy.optimize import milp, LinearConstraint, Bounds
D, N, S = R.D, R.N, R.S
def model(bounds, fixed_s=None, obj="slack"):
    lo = [R.WIDE.get(d["name"], d["lo"]) if bounds == "wide" else d["lo"] for d in D]
    rows, L, U = [], [], []
    def add(v, l, u, sc=0.0): rows.append(np.append(v * S, sc)); L.append(l); U.append(u)
    add(np.ones(N) / S * S / S * S / S, 1000 / S, 1000 / S)  # placeholder replaced below
    rows.pop(); L.pop(); U.pop()
    rows.append(np.append(np.ones(N) * S, 0)); L.append(1000); U.append(1000)
    for mf in (3.5, 0.0):
        add(R.vec("protein", "lo", mf), 12.5, np.inf)
        add(R.vec("fat", "hi", mf), -np.inf, 2.3)
        add(R.vec("tdf", "lo", mf), 11.0, np.inf)
    add(R.vec("protein", "hi", 0.0), -np.inf, 13.8, -1.0)   # P_hi - s <= 13.8
    if fixed_s is not None: rows.append(np.append(np.zeros(N), 1)); L.append(-np.inf); U.append(fixed_s + 1e-6)
    c = np.append(np.zeros(N), 1.0) if obj == "slack" else np.append(R.price * S, 0)
    lb = list(np.array(lo) / S) + [0]; ub = [d["hi"] / S for d in D] + [np.inf]
    r = milp(c, constraints=LinearConstraint(np.array(rows), L, U), bounds=Bounds(lb, ub),
             integrality=np.append(np.ones(N), 0), options={"mip_rel_gap": 0})
    return r
def show(tag, r):
    print(f"\n{tag}: scipy status {r.status} ({r.message.split('(')[-1].rstrip(')')})")
    if r.x is None: return
    w = np.round(r.x[:N]).astype(int) * S
    print("  slack", round(r.x[-1], 2), "| 3.5%:", R.rep(w, 3.5)); print("  0%  :", R.rep(w, 0.0))
    print("  ", {d["name"]: int(x) for d, x in zip(D, w)})
if __name__ == "__main__":
    named = dict(V44b={"Ragi":185,"Khapli wheat":40,"Pearl millet":65,"Roasted Bengal gram":60,"Green gram":160,"Mappillai Samba rice":40,"Foxtail millet":30,"Kodo millet":30,"Little millet":30,"Barnyard millet":30,"Black chickpea":30,"Cowpea":50,"Masoor":80,"Barley":80,"Dry dates":30,"Puffed paddy":20,"Makhana":20,"Cardamom":5,"Dry ginger":5,"Amla":10})
    for k, m in named.items():
        w = np.array([m[d["name"]] for d in D]); print(k, "3.5%:", R.rep(w, 3.5), "\n      0%:", R.rep(w, 0.0))
    for b in ("orig", "wide"):
        r = model(b, obj="slack"); show(f"[{b}] min slack", r)
        if r.x is not None: show(f"[{b}] min cost at min slack", model(b, fixed_s=r.x[-1], obj="cost"))

def min_robust_fat(bounds, mf):
    """Min robust-high fat at moisture mf, holding robust-low P>=12.5 and TDF>=11 at that mf."""
    lo = [R.WIDE.get(d["name"], d["lo"]) if bounds == "wide" else d["lo"] for d in D]
    A = [np.ones(N) * S, R.vec("protein", "lo", mf) * S, R.vec("tdf", "lo", mf) * S]
    r = milp(R.vec("fat", "hi", mf) * S, constraints=LinearConstraint(np.array(A), [1000, 12.5, 11], [1000, np.inf, np.inf]),
             bounds=Bounds(np.array(lo) / S, [d["hi"] / S for d in D]), integrality=np.ones(N), options={"mip_rel_gap": 0})
    return r
def min_spread(bounds, mf):
    lo = [R.WIDE.get(d["name"], d["lo"]) if bounds == "wide" else d["lo"] for d in D]
    c = (R.vec("protein", "hi", mf) - R.vec("protein", "lo", mf)) * S
    r = milp(c, constraints=LinearConstraint(np.ones((1, N)) * S, 1000, 1000), bounds=Bounds(np.array(lo) / S, [d["hi"] / S for d in D]),
             integrality=np.ones(N), options={"mip_rel_gap": 0})
    return r
if __name__ == "__main__":
    print("\n--- Fallback (slack model infeasible): minimum achievable robust-high fat ---")
    for b in ("orig", "wide"):
        for mf in (3.5, 0.0):
            r = min_robust_fat(b, mf); w = np.round(r.x).astype(int) * S
            print(f"[{b}] mf={mf}%: status {r.status}, min robust-high fat = {round(r.fun,3)}  | {R.rep(w, mf)}")
            if b == "wide" and mf == 3.5: print("   weights:", {d['name']: int(x) for d, x in zip(D, w)})
        r = min_spread(b, 3.5); print(f"[{b}] minimum possible robust protein spread @3.5% = {round(r.fun,2)} g (window is 1.3 g)")
