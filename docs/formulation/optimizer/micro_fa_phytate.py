"""Vitamin E, LA/ALA, phytate (+ phytate:Fe/Zn molar ratios) and energy per 30 g.
Source: IFCT 2017 PDF (owner-supplied copy), values extracted by COLUMN POSITION with pdfplumber and page-verified:
 Table 3 VITE (mg alpha-TE), Table 7 F18D2N6/F18D3N3 (mg), Table 11 PHYTAC (mg), Table 1 ENERC (kJ). Per 100 g edible portion.
Fresh ginger (G014) and amla (E021) converted to 10 % moisture. Missing (no IFCT row): foxtail, barnyard, makhana.
Finished basis 3.5 % moisture; no processing retention (sprouting lowers phytate; roasting lowers vit E/PUFA)."""
import sys, numpy as np
sys.argv = sys.argv[:2]
import robust_sweep as R, compare_final as CF, minerals as MN
D = R.D
#           VITE  LA     ALA    PHYTATE ENERC(kJ)
T = {"Ragi":(0.16,362,68.58,306,1342),"Khapli wheat":(0.77,616,38.51,638,1347),"Pearl millet":(0.24,1844,140,485,1456),
     "Mappillai Samba rice":(0.69,490,16.10,742,1480),"Kodo millet":(0.07,576,21.02,452,1388),"Little millet":(0.55,1230,47.20,265,1449),
     "Barley":(0.01,549,26.32,386,1321),"Roasted Bengal gram":(0.19,2360,116,450,1377),"Black chickpea":(1.72,2220,117,578,1201),
     "Green gram":(0.33,430,180,375,1229),"Cowpea":(0.70,343,207,550,1340),"Masoor":(0.19,221,55.40,564,1251),
     "Dry dates":(0.03,140,19.49,134,1340),"Puffed paddy":(0.04,43.42,1.39,115,1514),"Cardamom":(0.77,411,172,721,1067),
     "Dry ginger":tuple(x*90/18.73 for x in (0.32,302,78.99,14.50)) + (None,), "Amla":tuple(x*90/12.98 for x in (0.12,47.41,27.83,49.34)) + (None,)}
def conv(d): return (100 - 3.5) / (100 - (d["source"]["moisture_g"] or 10.0))
def per30(w, j):
    t = w.sum(); s = sum(T[d["name"]][j] * conv(d) * w[i] / 100 for i, d in enumerate(D) if d["name"] in T and T[d["name"]][j] is not None)
    return s / t * 30
if __name__ == "__main__":
    print(f"{'per 30 g':20s} {'VitE mg':>8s} {'LA mg':>7s} {'ALA mg':>7s} {'LA:ALA':>6s} {'Phytate mg':>10s} {'Phy:Fe':>7s} {'Phy:Zn':>7s} {'kcal':>6s}")
    for k, w in CF.C.items():
        ve, la, ala, phy, kj = (per30(w, j) for j in range(5))
        fe = (MN.M[1] @ w) / w.sum() * 30 * 1000 / 1000; zn = (MN.M[2] @ w) / w.sum() * 30
        fe = (MN.M[1] @ w * 1000 / w.sum()) * 0.3; zn = (MN.M[2] @ w * 1000 / w.sum()) * 0.3   # mg per 30 g
        r_fe = (phy / 660) / (fe / 55.85); r_zn = (phy / 660) / (zn / 65.38)
        print(f"{k:20s} {ve:8.3f} {la:7.0f} {ala:7.1f} {la/ala:6.1f} {phy:10.0f} {r_fe:7.1f} {r_zn:7.1f} {kj/4.184:6.0f}")
