"""Amino-acid composition (v2, per GPT audit): all 9 FAO 2013 scoring groups, finished-basis protein masses,
three bases reported separately:
  (a) known-only: AA from covered protein / covered protein
  (b) conservative lower bound: AA from covered protein / ALL protein (missing protein counted as 0 AA - NOT a real value)
  (c) required average in missing protein to reach each reference.
Milk mixture uses basis (b) for powder (no imputation to missing protein). Milk AA = ESTIMATES.
IFCT 2017 Table 8, g/100 g protein (x10 = mg/g), WebFetch extract chars 600k-700k (two passes). Not page-image verified.
Usage: python3 amino_acids_v2.py sourced_inputs.json"""
import sys, numpy as np
sys.argv = sys.argv[:2]
import robust_sweep as R, compare_final as CF
D = R.D
#                     His   Ile   Leu   Lys   Met   Cys   Phe   Tyr   Thr   Trp   Val
AA = {"Ragi":         (2.37,3.70,8.86,2.83,2.74,1.48,5.70,3.37,3.84,0.91,5.65),
      "Khapli wheat": (2.65,3.83,6.81,3.13,1.75,2.35,4.75,3.12,3.01,1.40,5.11),
      "Pearl millet": (2.15,3.45,8.52,3.19,2.11,1.23,4.82,2.67,3.55,1.33,4.79),
      "Mappillai Samba rice": (2.36,4.08,8.40,3.63,2.39,2.02,5.50,4.36,3.38,1.00,6.72),
      "Kodo millet":  (2.14,4.55,11.96,1.42,2.69,1.92,6.27,3.87,3.89,1.32,5.49),
      "Little millet":(2.35,4.14,8.08,2.42,2.21,1.85,6.14,3.43,4.24,1.35,5.31),
      "Barley":       (2.13,3.63,6.49,3.42,1.86,2.20,4.88,2.68,3.30,1.28,4.78),
      "Roasted Bengal gram": (2.39,4.25,6.91,6.06,1.12,0.84,5.97,2.72,3.24,1.09,4.09),
      "Black chickpea": (2.51,4.34,7.40,6.59,1.16,1.27,6.26,2.88,3.55,0.95,4.58),
      "Green gram":   (2.85,4.17,7.45,6.60,1.21,0.74,6.21,2.83,3.20,1.02,5.45),
      "Cowpea":       (2.93,4.10,7.49,6.67,1.38,0.57,5.47,2.83,3.80,1.05,4.87),
      "Masoor":       (2.07,4.17,7.36,6.78,0.84,1.18,4.61,2.40,3.35,0.76,4.85)}
REF = dict(His=16, Ile=31, Leu=61, Lys=48, SAA=23, AAA=41, Thr=25, Trp=6.6, Val=40)
MILK = dict(His=27, Ile=47, Leu=98, Lys=80, SAA=33, AAA=97, Thr=45, Trp=14, Val=64); MILK_P = 8.0
def groups(t):
    h, i, l, k, m, c, f, y, th, tr, v = t
    return dict(His=h, Ile=i, Leu=l, Lys=k, SAA=m + c, AAA=f + y, Thr=th, Trp=tr, Val=v)
def analyse(w):
    pf = np.array([float(R.vec("protein", "mid", 3.5)[i]) * w[i] for i in range(len(D))])  # finished-basis protein contribution
    tot = pf.sum(); known = {d["name"]: pf[i] for i, d in enumerate(D) if d["name"] in AA}; kp = sum(known.values())
    mg = {g: sum(groups(AA[n])[g] * 10 * p for n, p in known.items()) for g in REF}   # mg AA (scaled)
    a = {g: mg[g] / kp for g in REF}; b = {g: mg[g] / tot for g in REF}
    need = {g: (REF[g] * tot - mg[g]) / (tot - kp) for g in REF}
    p30 = tot / w.sum() * 1000 * 0.3 / 1000 * 1000 / 1000  # placeholder, recomputed below
    p30 = float(R.vec("protein", "mid", 3.5) @ w * 1000 / w.sum()) * 0.3
    mixb = {g: (b[g] * p30 + MILK[g] * MILK_P) / (p30 + MILK_P) for g in REF}
    return kp / tot, a, b, need, mixb
def sc(x): s = {g: x[g] / REF[g] for g in REF}; m = min(s, key=s.get); return f"{s[m]:.2f} ({m})"
if __name__ == "__main__":
    for name, w in CF.C.items():
        cov, a, b, need, mixb = analyse(w)
        print(f"\n{name}: covered protein {cov*100:.1f}%")
        print("  (a) known-only mg/g :", {g: round(a[g], 1) for g in REF}, "| score", sc(a))
        print("  (b) lower bound     :", {g: round(b[g], 1) for g in REF}, "| score", sc(b))
        print("  (c) needed avg in missing protein to hit ref (mg/g):", {g: round(need[g], 1) for g in REF})
        print("  (b)+milk lower bound score:", sc(mixb))
