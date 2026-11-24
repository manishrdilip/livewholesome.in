"""Robust strict-window sweep on finished basis (Case F).
- Protein window 12.5-13.8 enforced on BOTH robust-low and robust-high protein; fat <= 2.3 on robust-high fat; TDF >= 11 on robust-low TDF.
- Robust values: IFCT mean +/- 2 SD for sourced/proxy items (SD from ifct_extract.md); wide assumed ranges for the 3 unsourced items.
- Moisture scenarios: finished moisture 3.5 % and 0 % (endpoint; drier = more concentrated).
- Bounds: 'orig' (inputs lo/hi) and 'wide' (labelled scenario).
Usage: python3 robust_sweep.py sourced_inputs.json"""
import sys, json, numpy as np
from scipy.optimize import milp, LinearConstraint, Bounds
D = json.load(open(sys.argv[1]))["ingredients"]; N = len(D); S = 5
SD = {"Ragi": (0.63, 0.14, 1.14), "Khapli wheat": (0.60, 0.05, 0.77), "Pearl millet": (0.26, 0.64, 0.62), "Roasted Bengal gram": (1.45, 0.06, 0.17),
      "Green gram": (0.43, 0.17, 0.38), "Mappillai Samba rice": (0.75, 0.08, 0.54), "Kodo millet": (1.09, 0.13, 0.60), "Little millet": (0.45, 0.35, 0.92),
      "Black chickpea": (0.42, 0.11, 0.39), "Cowpea": (0.59, 0.06, 0.13), "Masoor": (0.58, 0.02, 1.30), "Barley": (0.51, 0.20, 0.64),
      "Dry dates": (0.24, 0.03, 0.23), "Puffed paddy": (0.15, 0.13, 0.33), "Cardamom": (0.41, 0.15, 0.14)}
RANGE = {"Foxtail millet": ((10.0, 13.0), (3.0, 5.0), (6.0, 10.0)), "Barnyard millet": ((6.0, 11.0), (2.0, 4.0), (7.0, 12.0)),
         "Makhana": ((8.0, 11.0), (0.1, 2.0), (5.0, 10.0))}
def val(d, k, side):  # side: 'lo'|'mid'|'hi'
    i = ("protein", "fat", "tdf").index(k); m = d[k]
    if side == "mid": return m
    if d["name"] in RANGE: return RANGE[d["name"]][i][0 if side == "lo" else 1]
    sd = SD.get(d["name"], (m * 0.1, m * 0.1, m * 0.1))[i]  # derived items: SD = 10 % of mean, so +/-2 SD = +/-20 % (relabelled per GPT audit)
    return m - 2 * sd if side == "lo" else m + 2 * sd
def mois(d): return d["source"]["moisture_g"] or 10.0
def vec(k, side, mf): return np.array([val(d, k, side) * (100 - mf) / (100 - mois(d)) for d in D]) / 1000
price = np.array([d["price"] for d in D]) / 1000
grp = lambda g: np.array([d["group"] == g for d in D], float)
WIDE = {"Pearl millet": 20, "Foxtail millet": 15, "Little millet": 15, "Roasted Bengal gram": 30, "Black chickpea": 20}
def solve(bounds, mf, obj="cost"):
    lo = [WIDE.get(d["name"], d["lo"]) if bounds == "wide" else d["lo"] for d in D]
    A = [np.ones(N) * S, vec("protein", "lo", mf) * S, vec("protein", "hi", mf) * S, vec("fat", "hi", mf) * S, vec("tdf", "lo", mf) * S]
    L = [1000, 12.5, -np.inf, -np.inf, 11.0]; U = [1000, np.inf, 13.8, 2.3, np.inf]
    c = price * S if obj == "cost" else vec("fat", "mid", mf) * S
    r = milp(c, constraints=LinearConstraint(np.array(A), L, U), bounds=Bounds(np.array(lo) / S, [d["hi"] / S for d in D]),
             integrality=np.ones(N), options={"mip_rel_gap": 0})
    return r, (None if r.x is None else np.round(r.x).astype(int) * S)
def rep(w, mf):
    t = w.sum(); f = lambda k, s: round(float(vec(k, s, mf) @ w * 1000 / t), 2)
    return dict(cost_raw_price=round(float(price @ w * 1000 / t), 2), P=(f("protein", "lo"), f("protein", "mid"), f("protein", "hi")),
                F=(f("fat", "lo"), f("fat", "mid"), f("fat", "hi")), TDF=(f("tdf", "lo"), f("tdf", "mid"), f("tdf", "hi")),
                pulses=round(grp("pulse") @ w / t * 100, 1), millet=round(grp("millet") @ w / t * 100, 1))
if __name__ == "__main__":
    print("Values shown as (robust-low, central, robust-high). Cost uses raw purchase prices, NOT yield-adjusted.\n")
    named = {k: np.array([d[k] for d in D]) for k in ("v42", "B", "C")}
    named["V4.5"] = np.array([{"Ragi":230,"Khapli wheat":90,"Pearl millet":20,"Roasted Bengal gram":30,"Green gram":160,"Mappillai Samba rice":60,"Foxtail millet":15,"Kodo millet":30,"Little millet":15,"Barnyard millet":30,"Black chickpea":20,"Cowpea":50,"Masoor":80,"Barley":80,"Dry dates":30,"Puffed paddy":20,"Makhana":20,"Cardamom":5,"Dry ginger":5,"Amla":10}[d["name"]] for d in D])
    for mf in (3.5, 0.0):
        print(f"=== finished moisture {mf} % ===")
        for k, w in named.items(): print(f"  {k:5s}", rep(w, mf))
        for b in ("orig", "wide"):
            for obj in ("cost", "fat"):
                r, w = solve(b, mf, obj)
                print(f"  OPT bounds={b} obj=min-{obj}: HiGHS status {r.status} | {r.message.split('(')[-1].rstrip(')')}")
                if w is not None: print("    ", rep(w, mf)); print("    ", {d["name"]: int(x) for d, x in zip(D, w)})
