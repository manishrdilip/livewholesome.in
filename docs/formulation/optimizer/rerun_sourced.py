"""Rerun on any inputs file with explicit HiGHS status, min-cost and min-fat objectives.
Usage: python3 rerun_sourced.py sourced_inputs.json"""
import sys, json, numpy as np
from scipy.optimize import milp, LinearConstraint, Bounds
D = json.load(open(sys.argv[1]))["ingredients"]; N = len(D); S = 5
price = np.array([d["price"] for d in D]) / 1000
nut = {k: np.array([d[k] for d in D]) / 1000 for k in ("protein", "fat", "tdf")}
pul = np.array([d["group"] == "pulse" for d in D], float); mil = np.array([d["group"] == "millet" for d in D], float)
def rep(w):
    return dict(sum=int(w.sum()), cost=round(price @ w * 1000 / w.sum(), 2), protein=round(nut["protein"] @ w * 1000 / w.sum(), 2),
                fat=round(nut["fat"] @ w * 1000 / w.sum(), 2), tdf=round(nut["tdf"] @ w * 1000 / w.sum(), 2),
                pulses_pct=round(pul @ w / w.sum() * 100, 1), millet_pct=round(mil @ w / w.sum() * 100, 1))
def run(obj, pmin=None, fmax=None, tmin=None):
    A = [np.ones(N) * S, nut["protein"] * S, nut["fat"] * S, nut["tdf"] * S]
    lo = [1000, pmin if pmin else -np.inf, -np.inf, tmin if tmin else -np.inf]; hi = [1000, np.inf, fmax if fmax else np.inf, np.inf]
    c = (price if obj == "cost" else nut["fat"]) * S
    r = milp(c, constraints=LinearConstraint(np.array(A), lo, hi), bounds=Bounds([d["lo"] / S for d in D], [d["hi"] / S for d in D]),
             integrality=np.ones(N), options={"mip_rel_gap": 0})
    w = np.round(r.x).astype(int) * S if r.x is not None else None
    return r.status, r.message, w
print("missing/placeholder inputs:", [d["name"] for d in D if d.get("source_status") == "missing"])
for k in ("v42", "B", "C"): print(k, rep(np.array([d[k] for d in D])))
v44b = {"Ragi":185,"Khapli wheat":40,"Pearl millet":65,"Roasted Bengal gram":60,"Green gram":160,"Mappillai Samba rice":40,"Foxtail millet":30,"Kodo millet":30,"Little millet":30,"Barnyard millet":30,"Black chickpea":30,"Cowpea":50,"Masoor":80,"Barley":80,"Dry dates":30,"Puffed paddy":20,"Makhana":20,"Cardamom":5,"Dry ginger":5,"Amla":10}
print("V4.4b", rep(np.array([v44b[d["name"]] for d in D])))
for label, args in [("min-cost P>=13.8 F<=2.3 TDF>=12", ("cost", 13.8, 2.3, 12)), ("min-cost P>=12.5 F<=2.3 TDF>=11", ("cost", 12.5, 2.3, 11)),
                    ("min-fat P>=13.8 TDF>=12", ("fat", 13.8, None, 12)), ("min-fat P>=12.5 TDF>=11", ("fat", 12.5, None, 11)),
                    ("min-fat unconstrained", ("fat",))]:
    st, msg, w = run(*args)
    print(f"\n{label}: status={st} ({msg})")
    if w is not None: print(rep(w)); print({d["name"]: int(x) for d, x in zip(D, w)})
