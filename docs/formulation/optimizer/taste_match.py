"""Taste-match optimiser: find the recipe whose estimated flavour profile is closest to current V4.2
(already accepted by customers) while meeting robust nutrition limits (finished basis 3.5 %, wide bounds).
Flavour scores per ingredient are Claude's sensory ESTIMATES (0-5), not measured panel data.
Usage: python3 taste_match.py sourced_inputs.json"""
import sys, numpy as np
sys.argv = sys.argv[:2]
import robust_sweep as R
from scipy.optimize import milp, LinearConstraint, Bounds
D, N, S = R.D, R.N, R.S
# dims: sweet, beany, bitter/astringent, roasted-nutty, earthy, spice-aroma
FL = {"Ragi":(1,0,2,2,4,0),"Khapli wheat":(2,0,0,3,1,0),"Pearl millet":(1,0,3,3,3,0),"Roasted Bengal gram":(2,1,0,5,1,0),
      "Green gram":(1,4,1,1,2,0),"Mappillai Samba rice":(2,0,1,3,2,0),"Foxtail millet":(1,0,1,2,2,0),"Kodo millet":(0,0,2,2,3,0),
      "Little millet":(1,0,1,2,2,0),"Barnyard millet":(1,0,1,2,2,0),"Black chickpea":(1,3,1,3,2,0),"Cowpea":(1,4,1,2,2,0),
      "Masoor":(1,3,1,2,2,0),"Barley":(2,0,1,4,1,0),"Dry dates":(5,0,0,1,0,0),"Puffed paddy":(1,0,0,4,0,0),"Makhana":(1,0,0,3,0,0),
      "Cardamom":(0,0,0,0,0,60),"Dry ginger":(0,0,1,0,0,30),"Amla":(0,0,4,0,0,0)}
F = np.array([FL[d["name"]] for d in D], float).T / 1000  # profile per g
DIM = ["sweet", "beany", "bitter", "roasted", "earthy", "spice"]
v42 = np.array([d["v42"] for d in D]) * 1000 / 1020
target = F @ v42
WIDE = dict(R.WIDE); spice_hi = {"Cardamom": 10, "Dry ginger": 10}
lo = [WIDE.get(d["name"], d["lo"]) for d in D]; hi = [spice_hi.get(d["name"], d["hi"]) for d in D]
def solve(fat_hi=2.3, p_lo=12.5):
    nd = len(DIM); nv = N + nd   # integer k_i, then deviation e_j >= |profile_j - target_j|
    rows, L, U = [], [], []
    def add(r, l, u): rows.append(r); L.append(l); U.append(u)
    add(np.append(np.ones(N) * S, np.zeros(nd)), 1000, 1000)
    add(np.append(R.vec("protein", "lo", 3.5) * S, np.zeros(nd)), p_lo, np.inf)
    add(np.append(R.vec("fat", "hi", 3.5) * S, np.zeros(nd)), -np.inf, fat_hi)
    add(np.append(R.vec("tdf", "lo", 3.5) * S, np.zeros(nd)), 11, np.inf)
    for j in range(nd):
        e = np.zeros(nd); e[j] = 1
        add(np.append(F[j] * S, -e), -np.inf, target[j]); add(np.append(F[j] * S, e), target[j], np.inf)
    wts = np.array([2, 2, 1.5, 1, 1, 1.5])  # sweetness & beaniness matter most for acceptance [estimate]
    c = np.append(np.zeros(N), wts / np.maximum(target, 1e-9))
    r = milp(c, constraints=LinearConstraint(np.array(rows), L, U),
             bounds=Bounds(list(np.array(lo) / S) + [0] * nd, [h / S for h in hi] + [np.inf] * nd),
             integrality=np.append(np.ones(N), np.zeros(nd)), options={"mip_rel_gap": 0})
    return r
def prof(w): p = F @ w; return {k: round(float(v / t * 100 - 100), 0) for k, v, t in zip(DIM, p, target)}
if __name__ == "__main__":
    r = solve(); print("status", r.status, r.message.split("(")[-1])
    w = np.round(r.x[:N]).astype(int) * S
    v45 = np.array([{"Ragi":230,"Khapli wheat":90,"Pearl millet":20,"Roasted Bengal gram":30,"Green gram":160,"Mappillai Samba rice":60,"Foxtail millet":15,"Kodo millet":30,"Little millet":15,"Barnyard millet":30,"Black chickpea":20,"Cowpea":50,"Masoor":80,"Barley":80,"Dry dates":30,"Puffed paddy":20,"Makhana":20,"Cardamom":5,"Dry ginger":5,"Amla":10}[d["name"]] for d in D])
    for name, x in (("V4.5", v45), ("TASTE-MATCH", w)):
        print(f"\n{name}: flavour vs V4.2 (% difference) {prof(x)}"); print("  nutrition 3.5%:", R.rep(x, 3.5))
    print("\nTASTE-MATCH weights:", {d["name"]: int(x) for d, x in zip(D, w)})
