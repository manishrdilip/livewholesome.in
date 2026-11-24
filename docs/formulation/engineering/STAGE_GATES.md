# Purna — stage gates (safety & compliance are non-compensatory: a FAIL stops the gate regardless of any other score)

| Gate | Purpose | Exit evidence | Status (V4.2-M) |
|---|---|---|---|
| G1 Digital model | Sourced nutrient model meets owner specs on paper | `verify_recipe.py` exit 0; sourced/verified inputs; coverage matrix gaps listed | **PASS with warnings** (fat stress-high 2.62; lysine lower bound 45.5) |
| G2 Process safety | Kill step + hygiene validated by a qualified food-safety specialist | HACCP plan; surrogate challenge study on actual roaster/load; amla/spice COA scheme; germination hazard controls | NOT STARTED — **highest risk (FMEA F05/F06 RPN 320)** |
| G3 Controlled pilot | Make it reproducibly | ≥3 pilot lots; stage yields; moisture/aw; particle size; seal/O2; dispersion test; real cost per finished kg | NOT STARTED |
| G4 Product verification + consumer validation | It is what we say it is, and people accept it | NABL protein/fat/TDF/vit C/minerals (+AA optional) on ≥3 lots; micro every lot; triangle + hedonic vs current Purna; 1-week tolerance panel | NOT STARTED |
| G5 Shelf life + regulatory release | It stays safe and good; label is lawful | real-time (and accelerated) PV/FFA/aw/micro/sensory pulls; expiry only from real-time data; FSSAI label/claims review; allergen (wheat/barley) declared | NOT STARTED |
| G6 Scale-up qualification | It stays the same at volume | supplier COA scheme (aflatoxin etc.); SPC only after ~20–25 lots; no capability (Cpk) claim from pilot data | NOT STARTED |

Spending priority (agreed Claude + GPT): G2 specialist + G4 NABL assays before any database subscription.
