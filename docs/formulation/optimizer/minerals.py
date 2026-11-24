"""Mineral coverage + nutrient-balanced optimisation (GPT section 7 request).
Minerals: IFCT 2017 Table 5 means (mg/100 g), extracted via WebFetch (chars 300k-500k); see ifct_minerals_extract in commit msg / review file.
Missing (null): foxtail, barnyard, makhana, dry ginger, amla -> contribute 0 and are FLAGGED (coverage is a lower bound).
Reference: ICMR-NIN 2020 RDA, adult woman (stricter for Fe): Ca 1000, Fe 29, Zn 13.2, Mg 370 mg/day [to verify against ICMR-NIN 2020 report].
Finished basis 3.5 % moisture (per-ingredient dry-solids conversion), serving 30 g powder.
Usage: python3 minerals.py sourced_inputs.json"""
import sys, numpy as np
sys.argv = sys.argv[:2]
import robust_sweep as R
from scipy.optimize import milp, LinearConstraint, Bounds
D, N, S = R.D, R.N, R.S
MIN = {  # Ca, Fe, Zn, Mg  (IFCT 2017 Table 5)
 "Ragi":(364,4.62,2.53,146), "Khapli wheat":(39.36,3.97,2.85,125), "Pearl millet":(27.35,6.42,2.76,124),
 "Mappillai Samba rice":(10.93,1.02,1.68,93.91), "Kodo millet":(15.27,2.34,1.65,122), "Little millet":(16.06,1.26,1.82,91.41),
 "Barley":(28.64,1.56,1.50,48.97), "Roasted Bengal gram":(46.32,6.08,3.65,118), "Black chickpea":(150,6.78,3.37,160),
 "Green gram":(92.43,4.89,2.67,198), "Cowpea":(81.73,5.90,3.41,213), "Masoor":(76.13,7.57,3.60,101),
 "Dry dates":(71.20,3.20,0.70,73.79), "Puffed paddy":(15.09,4.55,1.45,64.59), "Cardamom":(378,8.33,3.71,330)}
RDA = np.array([1000, 29, 13.2, 370]); NAMES = ["Ca", "Fe", "Zn", "Mg"]
def conv(d): return (100 - 3.5) / (100 - (d["source"]["moisture_g"] or 10.0))
M = np.array([[MIN.get(d["name"], (0, 0, 0, 0))[j] * conv(d) for d in D] for j in range(4)]) / 1000  # mg/100g mix per g
def cover(w, serving=30):
    per100 = M @ w * 1000 / w.sum(); return {n: f"{v:.1f} mg/100g = {v*serving/100/r*100:.0f}% RDA per {serving} g" for n, v, r in zip(NAMES, per100, RDA)}
RECIPES = {
 "V4.2": {d["name"]: d["v42"] for d in D},
 "V4.5": {"Ragi":230,"Khapli wheat":90,"Pearl millet":20,"Roasted Bengal gram":30,"Green gram":160,"Mappillai Samba rice":60,"Foxtail millet":15,"Kodo millet":30,"Little millet":15,"Barnyard millet":30,"Black chickpea":20,"Cowpea":50,"Masoor":80,"Barley":80,"Dry dates":30,"Puffed paddy":20,"Makhana":20,"Cardamom":5,"Dry ginger":5,"Amla":10}}
RECIPES["V5.0-taste"] = dict(RECIPES["V4.5"], **{"Khapli wheat":85,"Green gram":155,"Cardamom":10,"Dry ginger":10})
def balanced(fat_hi=2.3):
    """maximise the MINIMUM %RDA across Ca, Fe, Zn, Mg per 30 g, s.t. robust fat<=fat_hi (3.5 %), robust P>=12.5, TDF>=11, wide bounds, spices 10 g."""
    lo = [R.WIDE.get(d["name"], d["lo"]) for d in D]; hi = [d["hi"] for d in D]
    for i, d in enumerate(D):
        if d["name"] in ("Cardamom", "Dry ginger"): lo[i] = hi[i] = 10
    rows, L, U = [], [], []
    def add(r, l, u): rows.append(r); L.append(l); U.append(u)
    add(np.append(np.ones(N) * S, 0), 1000, 1000)
    add(np.append(R.vec("protein", "lo", 3.5) * S, 0), 12.5, np.inf)
    add(np.append(R.vec("fat", "hi", 3.5) * S, 0), -np.inf, fat_hi)
    add(np.append(R.vec("tdf", "lo", 3.5) * S, 0), 11, np.inf)
    for j in range(4):  # cov_j = M_j.w * 0.3 / RDA_j *100  >= z
        add(np.append(M[j] * S * 30 / RDA[j], -1), 0, np.inf)
    r = milp(np.append(np.zeros(N), -1), constraints=LinearConstraint(np.array(rows), L, U),
             bounds=Bounds(list(np.array(lo) / S) + [0], [h / S for h in hi] + [np.inf]), integrality=np.append(np.ones(N), 0), options={"mip_rel_gap": 0})
    return r
if __name__ == "__main__":
    print("Missing mineral data (counted as 0):", [d["name"] for d in D if d["name"] not in MIN])
    for k, m in RECIPES.items():
        w = np.array([m[d["name"]] for d in D]); print(f"\n{k}: {cover(w)}\n   macro 3.5%: {R.rep(w, 3.5)}")
    for fh in (2.3, 2.6, 3.0):
        r = balanced(fh); print(f"\nBALANCED (max min-%RDA, robust fat<={fh}): status {r.status}")
        if r.x is not None:
            w = np.round(r.x[:N]).astype(int) * S; print("  ", cover(w)); print("   macro:", R.rep(w, 3.5)); print("   ", {d["name"]: int(x) for d, x in zip(D, w)})
