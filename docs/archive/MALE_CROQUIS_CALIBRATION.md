# FashionForge — Male Croquis Calibration System & Specification

**Status:** Completed, Visually & Anatomically Verified
**Version:** 1.0 (Continuous Analytical Coordinate Engine with Proportional Male Tailoring & Shared Garment Geometry)
**Authoritative Modules:**
- [`frontend/js/renderer/croquis-calibration.js`](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/frontend/js/renderer/croquis-calibration.js)
- [`frontend/js/renderer/body-profiles.js`](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/frontend/js/renderer/body-profiles.js)
- [`frontend/js/renderer/geometry.js`](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/frontend/js/renderer/geometry.js)
- [`frontend/js/renderer/renderer.js`](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/frontend/js/renderer/renderer.js)
- [`frontend/js/app.js`](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/frontend/js/app.js)
**QA Validation Script:** [`scratch/validate_male_croquis.js`](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/scratch/validate_male_croquis.js)
**Browser QA Script:** [`scratch/test_male_browser_qa.js`](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/scratch/test_male_browser_qa.js)

---

## 1. Executive Summary & Calibration Methodology

This specification establishes the FashionForge male size-specific croquis system across all 8 standard sizes (**XS, S, M, L, XL, XXL, 3XL, 4XL**) in both **Front** and **Back** views (16 authoritative photographic assets).

### The Continuous Analytical Architecture
The male croquis system seamlessly extends the FashionForge design studio architecture:
1. **Canonical Coordinate System:** Exact 768 × 1376 coordinate space with central axis $X = 385$ and grounded foot baseline at $Y \approx 1314-1315$, precisely compatible with the female croquis system.
2. **Visual Studio Harmony:** Uses the identical studio cyclorama presentation, lighting direction, transparent RGBA background, and neutral charcoal/slate-grey fitted undergarments.
3. **Continuous Multi-Zone Grading:** Proportions scale with biological fidelity across 10 anatomical zones without uniform horizontal stretching, preserving natural deltoid curves, waist taper, and limb grounding.
4. **Shared Garment Architecture:** The 2.5D SVG garment renderer dynamically receives the active body profile and gender context, tailoring sleeve caps, armscye junctions, and waist contours without code duplication.
5. **Clean Occlusion Without Mask Artifacts:** Calibrated wrist and hand boundaries rest beside thighs with natural spatial occlusion, completely eliminating rectangular cutout bands or ghost pixels.

---

## 2. The 10 Anatomical Proportion Zones (Male)

| Zone | Region | Y Range (px) | Anatomical Landmarks & Grading Behavior |
| :--- | :--- | :--- | :--- |
| **Zone 1** | Head & Face | $0 - 245$ | Proportional grading ($0.965 \to 1.125$) maintaining masculine jawline and facial balance. |
| **Zone 2** | Neck & Trapezius | $245 - 318$ | Broader neck base ($Y=275$) and strong trapezius slope connecting to acromion ($Y=318$). |
| **Zone 3** | Upper Torso / Chest | $318 - 435$ | Pectoral depth ($Y=395$) and axillary armscye fold ($Y=440$), grading with Chest chart ($32" \to 46"$). |
| **Zone 4** | Natural Waist | $435 - 530$ | Masculine waist contour at $Y=500$ ($29" \to 43"$) with natural daylight gap to inner arms. |
| **Zone 5** | High Hip / Iliac Crest | $530 - 600$ | Smooth abdominal-pelvic contour transition ($Y=560$). |
| **Zone 6** | Low Hip / Pelvis | $600 - 700$ | Pelvic contour at $Y=640$ ($36" \to 50"$), compatible with front and rear views. |
| **Zone 7** | Upper Arms / Deltoids | $318 - 500$ | Cylindrical bicep/tricep tone matching garment Arm Hole measurement ($13" \to 20"$). |
| **Zone 8** | Forearms, Wrists & Hands | $500 - 750$ | Natural forearm taper, wrist joint ($Y=660$), and proportional hands ($Y=675-750$) resting beside thighs. |
| **Zone 9** | Thighs & Knees | $750 - 1050$ | Organic thigh girth ($1 + (s_{hip}-1)\times 0.85$) and patellar knee contour ($Y=980$). |
| **Zone 10** | Calves, Ankles & Feet | $1050 - 1376$ | Gastrocnemius taper ($1 + (s_{hip}-1)\times 0.38$), ankle transition, and feet pinned at ground baseline ($Y=1314$). |

---

## 3. Monotonic Size Progression (Numerical Validation)

Automated validation (`scratch/validate_male_croquis.js`) verifies strict mathematical monotonicity across all 8 sizes:

| Metric | XS | S | M | L | XL | XXL | 3XL | 4XL | Result |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Shoulder Width (Front)** | 245 | 264 | 273 | 283 | 292 | 302 | 312 | 320 | **PASS** (Strictly Monotonic) |
| **Chest Width (Front)** | 282 | 302 | 314 | 327 | 340 | 352 | 365 | 377 | **PASS** (Strictly Monotonic) |
| **Waist Torso Width (Front)** | 171 | 183 | 195 | 207 | 219 | 231 | 243 | 255 | **PASS** (Strictly Monotonic) |
| **Waist Total Width (Front)** | 291 | 309 | 325 | 343 | 360 | 377 | 395 | 411 | **PASS** (Strictly Monotonic) |
| **Low Hip Width (Front)** | 302 | 315 | 328 | 342 | 356 | 369 | 382 | 396 | **PASS** (Strictly Monotonic) |
| **Mid-Thigh Width (Front)** | 204 | 209 | 214 | 220 | 226 | 232 | 238 | 243 | **PASS** (Strictly Monotonic) |
| **Shoulder Width (Back)** | 250 | 268 | 278 | 288 | 298 | 307 | 317 | 326 | **PASS** (Strictly Monotonic) |
| **Chest Width (Back)** | 287 | 307 | 319 | 333 | 345 | 358 | 371 | 383 | **PASS** (Strictly Monotonic) |
| **Waist Torso Width (Back)** | 173 | 185 | 197 | 209 | 220 | 232 | 244 | 256 | **PASS** (Strictly Monotonic) |
| **Low Hip Width (Back)** | 303 | 316 | 330 | 344 | 358 | 371 | 384 | 398 | **PASS** (Strictly Monotonic) |

---

## 4. 16-Model Gate Verification Table

| Size | Front View | Back View | Face/Body Harmony | Realistic Arms | Believable Torso | Natural Legs | Garment Fit | Overall Gate |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **XS** | PASS | PASS | PASS (Petite facial volume) | PASS (Slender, athletic) | PASS (Chest 32", Waist 29") | PASS (Balanced calves) | PASS (Tailored fit) | **PASS** |
| **S** | PASS | PASS | PASS (Natural facial volume) | PASS (Natural cylindrical tone) | PASS (Chest 34", Waist 31") | PASS (Balanced thighs) | PASS (Tailored fit) | **PASS** |
| **M** | PASS | PASS | PASS (Canonical reference) | PASS (Canonical reference) | PASS (Canonical reference) | PASS (Canonical reference) | PASS (Baseline fit) | **PASS** |
| **L** | PASS | PASS | PASS (Adult grading) | PASS (Athletic fullness) | PASS (Chest 38", Waist 35") | PASS (Natural contours) | PASS (Aligned armscye) | **PASS** |
| **XL** | PASS | PASS | PASS (Harmonious jawline) | PASS (Full 3D volume, no shear) | PASS (Chest 40", Waist 37") | PASS (Fuller thighs, grounded) | PASS (Smooth waistline) | **PASS** |
| **XXL** | PASS | PASS | PASS (Natural plus fullness) | PASS (Substantial upper arm) | PASS (Chest 42", Waist 39") | PASS (Organic contours) | PASS (Natural drape) | **PASS** |
| **3XL** | PASS | PASS | PASS (Balanced plus-size head) | PASS (Realistic elbow/forearm) | PASS (Chest 44", Waist 41") | PASS (Grounded balance) | PASS (Natural drape) | **PASS** |
| **4XL** | PASS | PASS | PASS (Authentic 4XL portrait) | PASS (Genuine 4XL fullness) | PASS (Chest 46", Waist 43") | PASS (Solid, grounded baseline) | PASS (Clean drape) | **PASS** |

---

## 5. Registry of Authoritative Assets

Production assets in `frontend/assets/models/`:

```
frontend/assets/models/
├── male-model-xs-front.png     (476 KB, 768 × 1376)
├── male-model-xs-back.png      (466 KB, 768 × 1376)
├── male-model-s-front.png       (492 KB, 768 × 1376)
├── male-model-s-back.png        (481 KB, 768 × 1376)
├── male-model-front.png         (503 KB, 768 × 1376, Canonical M Front)
├── male-model-back.png          (491 KB, 768 × 1376, Canonical M Back)
├── male-model-m-front.png       (503 KB, 768 × 1376, Direct Sync M Front)
├── male-model-m-back.png        (491 KB, 768 × 1376, Direct Sync M Back)
├── male-model-l-front.png       (519 KB, 768 × 1376)
├── male-model-l-back.png        (507 KB, 768 × 1376)
├── male-model-xl-front.png      (534 KB, 768 × 1376)
├── male-model-xl-back.png       (521 KB, 768 × 1376)
├── male-model-xxl-front.png     (548 KB, 768 × 1376)
├── male-model-xxl-back.png      (536 KB, 768 × 1376)
├── male-model-3xl-front.png     (563 KB, 768 × 1376)
├── male-model-3xl-back.png      (548 KB, 768 × 1376)
├── male-model-4xl-front.png     (577 KB, 768 × 1376)
└── male-model-4xl-back.png      (563 KB, 768 × 1376)
```
