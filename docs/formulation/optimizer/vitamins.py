"""B-vitamins + folate per 30 g (IFCT 2017 Table 2, WebFetch chars 200k-300k; B1/B2/B3 mg, folate ug per 100 g).
Finished basis 3.5 % moisture. NO processing retention applied: thiamine and folate are heat/soak-sensitive, so these are UPPER-ish
estimates for raw-ingredient content. Missing: foxtail, barnyard, makhana, cardamom, ginger, amla (+ puffed paddy folate).
RDA: ICMR-NIN 2020 adult woman (sedentary) B1 1.4 mg, B2 1.9 mg, niacin 12 mg, folate 220 ug [TO VERIFY].
Vitamin E and LA/ALA: NOT extractable from PDF text (column alignment lost) -> need the PDF itself."""
import sys, numpy as np
sys.argv = sys.argv[:2]
import robust_sweep as R, compare_final as CF
D = R.D
V = {"Ragi":(0.37,0.17,1.34,34.66),"Khapli wheat":(0.46,0.15,2.68,30.09),"Pearl millet":(0.25,0.20,0.86,36.11),"Mappillai Samba rice":(0.27,0.06,3.40,11.51),
     "Kodo millet":(0.29,0.20,1.49,39.49),"Little millet":(0.26,0.05,1.29,36.20),"Barley":(0.36,0.18,2.84,31.58),"Roasted Bengal gram":(0.35,0.15,1.87,182),
     "Black chickpea":(0.37,0.24,2.10,233),"Green gram":(0.45,0.27,2.16,145),"Cowpea":(0.33,0.09,1.64,231),"Masoor":(0.40,0.22,2.54,132),
     "Dry dates":(0.03,0.03,1.47,18.65),"Puffed paddy":(0.11,0.04,1.87,None)}
RDA = (1.4, 1.9, 12, 220); NM = ("B1 mg", "B2 mg", "Niacin mg", "Folate ug")
def conv(d): return (100 - 3.5) / (100 - (d["source"]["moisture_g"] or 10.0))
def per30(w):
    t = w.sum(); out = []
    for j in range(4):
        s = sum(V[d["name"]][j] * conv(d) * w[i] / 100 for i, d in enumerate(D) if d["name"] in V and V[d["name"]][j] is not None)
        out.append(s / t * 30)  # s = amount in batch of t grams -> per 30 g
    return out
if __name__ == "__main__":
    for k, w in CF.C.items():
        v = per30(w); print(f"{k:20s} " + " | ".join(f"{n} {x:.3f} ({x/r*100:.0f}% RDA)" for n, x, r in zip(NM, v, RDA)))
