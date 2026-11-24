"""Side-by-side of the 4 named candidates per 30 g serving, powder alone and with 250 ml milk.
Known-only coverage (IFCT means; 5 ingredients null for minerals). Milk values are ESTIMATES for cow whole milk
(250 ml ~ protein 8.0 g, fat 8.0 g, Ca 300 mg, Fe 0.1, Zn 1.0, Mg 27) - to be replaced with IFCT/label values.
Usage: python3 compare_final.py sourced_inputs.json"""
import sys, numpy as np
sys.argv = sys.argv[:2]
import robust_sweep as R, minerals as MN, minimal_change_sweep as MS
D, N = R.D, R.N
def w_of(m): return np.array([m[d["name"]] for d in D])
r = MS.build(budget=100, obj="fat"); b100 = np.round(r.x[:N]).astype(int) * 5
C = {"V4.2 (norm)": MS.v42,
     "B100 (100 g budget)": b100,
     "V4.2-M": w_of({"Ragi":190,"Khapli wheat":90,"Pearl millet":20,"Roasted Bengal gram":30,"Green gram":130,"Mappillai Samba rice":60,"Foxtail millet":45,"Kodo millet":50,"Little millet":45,"Barnyard millet":50,"Black chickpea":35,"Cowpea":45,"Masoor":80,"Barley":30,"Dry dates":30,"Puffed paddy":20,"Makhana":20,"Cardamom":10,"Dry ginger":10,"Amla":10}),
     "V5.0": w_of({"Ragi":230,"Khapli wheat":90,"Pearl millet":20,"Roasted Bengal gram":30,"Green gram":160,"Mappillai Samba rice":55,"Foxtail millet":15,"Kodo millet":30,"Little millet":15,"Barnyard millet":30,"Black chickpea":20,"Cowpea":50,"Masoor":80,"Barley":75,"Dry dates":30,"Puffed paddy":20,"Makhana":20,"Cardamom":10,"Dry ginger":10,"Amla":10})}
MILK = dict(P=8.0, F=8.0, Ca=300, Fe=0.1, Zn=1.0, Mg=27)
RDA = dict(P=46, Ca=1000, Fe=29, Zn=13.2, Mg=370)  # ICMR-NIN 2020 adult woman, P ~0.83 g/kg x 55 kg [to verify]
print("B100 weights:", {d["name"]: int(x) for d, x in zip(D, b100)})
print(f"\n{'per 30 g':22s} {'moved':>6s} {'P g':>6s} {'F g':>5s} {'TDF':>5s} {'Ca%':>5s} {'Fe%':>5s} {'Zn%':>5s} {'Mg%':>5s} | +milk: {'P%':>4s} {'Ca%':>4s} {'Fe%':>4s} {'Zn%':>4s} {'Mg%':>4s} | fat100 c/hi")
for k, w in C.items():
    t = w.sum(); g = lambda key, s="mid": float(R.vec(key, s, 3.5) @ w * 1000 / t) * 0.3
    m = MN.M @ w * 1000 / t * 0.3
    mv = 0.5 * np.abs(w - MS.v42).sum(); P, F, T = g("protein"), g("fat"), g("tdf")
    pct = lambda v, n: v / RDA[n] * 100
    print(f"{k:22s} {mv:6.0f} {P:6.2f} {F:5.2f} {T:5.2f} {pct(m[0],'Ca'):5.1f} {pct(m[1],'Fe'):5.1f} {pct(m[2],'Zn'):5.1f} {pct(m[3],'Mg'):5.1f} |"
          f"       {pct(P+MILK['P'],'P'):4.0f} {pct(m[0]+MILK['Ca'],'Ca'):4.0f} {pct(m[1]+MILK['Fe'],'Fe'):4.0f} {pct(m[2]+MILK['Zn'],'Zn'):4.0f} {pct(m[3]+MILK['Mg'],'Mg'):4.0f} |"
          f" {R.rep(w,3.5)['F'][1]}/{R.rep(w,3.5)['F'][2]}")
