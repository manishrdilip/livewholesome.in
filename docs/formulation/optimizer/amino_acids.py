"""Amino-acid composition score (NOT DIAAS: no ileal digestibility applied) vs FAO 2013 pattern for >3 y (mg/g protein):
Leu 61, Lys 48, SAA 23, Thr 25, Trp 6.6.  IFCT 2017 Table 8 (g/100 g protein = 10x mg/g), extracted via WebFetch (chars 600k-700k).
Ingredients without Table 8 rows (foxtail, barnyard, makhana, dates, puffed paddy, cardamom, ginger, amla) are excluded; their share of total
protein is reported as missing coverage.  Milk AA values are ESTIMATES (cow milk ~ Lys 80, SAA 33, Thr 45, Trp 14, Leu 98 mg/g protein).
Usage: python3 amino_acids.py sourced_inputs.json"""
import sys, numpy as np
sys.argv = sys.argv[:2]
import robust_sweep as R, compare_final as CF
D = R.D
AA = {  # Leu, Lys, Met, Cys, Thr, Trp  (g/100 g protein)
 "Ragi":(8.86,2.83,2.74,1.48,3.84,0.91), "Khapli wheat":(6.81,3.13,1.75,2.35,3.01,1.40), "Pearl millet":(8.52,3.19,2.11,1.23,3.55,1.33),
 "Mappillai Samba rice":(8.40,3.63,2.39,2.02,3.38,1.00), "Kodo millet":(11.96,1.42,2.69,1.92,3.89,1.32), "Little millet":(8.08,2.42,2.21,1.85,4.24,1.35),
 "Barley":(6.49,3.42,1.86,2.20,3.30,1.28), "Roasted Bengal gram":(6.91,6.06,1.12,0.84,3.24,1.09), "Black chickpea":(7.40,6.59,1.16,1.27,3.55,0.95),
 "Green gram":(7.45,6.60,1.21,0.74,3.20,1.02), "Cowpea":(7.49,6.67,1.38,0.57,3.80,1.05), "Masoor":(7.36,6.78,0.84,1.18,3.35,0.76)}
REF = dict(Leu=61, Lys=48, SAA=23, Thr=25, Trp=6.6)
MILK_AA = dict(Leu=98, Lys=80, SAA=33, Thr=45, Trp=14); MILK_P = 8.0
def profile(w):
    prot = np.array([w[i] * d["protein"] for i, d in enumerate(D)])  # relative protein mass
    known = np.array([d["name"] in AA for d in D]); tot = prot.sum(); pk = prot[known].sum()
    agg = {"Leu": 0, "Lys": 0, "SAA": 0, "Thr": 0, "Trp": 0}
    for i, d in enumerate(D):
        if d["name"] not in AA: continue
        l, k, m, c, t, tr = AA[d["name"]]; f = prot[i] / pk * 10  # mg/g
        agg["Leu"] += l * f; agg["Lys"] += k * f; agg["SAA"] += (m + c) * f; agg["Thr"] += t * f; agg["Trp"] += tr * f
    return agg, pk / tot
def score(agg): s = {k: agg[k] / REF[k] for k in REF}; lim = min(s, key=s.get); return s, lim
if __name__ == "__main__":
    for name, w in CF.C.items():
        agg, cov = profile(w); s, lim = score(agg)
        p30 = float(R.vec("protein", "mid", 3.5) @ w * 1000 / w.sum()) * 0.3
        mix = {k: (agg[k] * p30 + MILK_AA[k] * MILK_P) / (p30 + MILK_P) for k in REF}; sm, lm = score(mix)
        print(f"{name:20s} AA-covered protein {cov*100:.0f}% | mg/g " + " ".join(f"{k}{agg[k]:.0f}" for k in REF)
              + f" | AAS {s[lim]:.2f} ({lim}) | +milk AAS {sm[lm]:.2f} ({lm})")
