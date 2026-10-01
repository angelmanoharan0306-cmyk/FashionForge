# FashionForge — Female Size-Specific Human Croquis Calibration Architecture

## Overview
This document specifies the architecture, asset structure, genuine anatomical body grading, rendering pipeline, and QA validation for the **True Size-Specific Female Human Croquis System** in FashionForge.

---

## 1. Primary Invariants & Asset Architecture

### 1.1 Invariants
- **Canvas Resolution**: 768 × 1376 px (RGBA 32-bit PNG with transparent alpha channel).
- **Center Axis**: $X = 385$ px.
- **Top of Head & Heels Alignment**: Hair bun apex aligned at $Y = 82$ px, footwear contact at $Y = 1325$ px.
- **Authoritative Baseline Reference**: The photographic `M` model assets (`female-model-front.png` and `female-model-back.png`) remain **100% unaltered**.

### 1.2 True Anatomical Body Assets (8 Sizes × 2 Views = 16 Assets)
All assets reside in `frontend/assets/models/`:

| Size | Front View Asset | Back View Asset | Anatomical Profile | Status |
| :--- | :--- | :--- | :--- | :--- |
| **XS** | `female-model-xs-front.png` | `female-model-xs-back.png` | Petite, narrow shoulders (13"), slender arms, slim waist, narrow hips, slender thighs and calves | Deployed & Verified |
| **S** | `female-model-s-front.png` | `female-model-s-back.png` | Trim/athletic, slightly fuller than XS, trim waist and hips | Deployed & Verified |
| **M** | `female-model-front.png` | `female-model-back.png` | Authoritative visual and anatomical baseline reference | **Authoritative Baseline** |
| **L** | `female-model-l-front.png` | `female-model-l-back.png` | Visibly fuller shoulders, arms, torso, hips, thighs, and calves | Deployed & Verified |
| **XL** | `female-model-xl-front.png` | `female-model-xl-back.png` | Curvy silhouette, fuller bust, wider ribcage and waist, full hips and thighs | Deployed & Verified |
| **XXL** | `female-model-xxl-front.png` | `female-model-xxl-back.png` | Voluptuous grading, broad shoulders, full upper arms, generous waist and hips | Deployed & Verified |
| **3XL** | `female-model-3xl-front.png` | `female-model-3xl-back.png` | Plus-size anatomy across whole body: broad shoulders, full arms, wide torso, thick thighs and full calves | Deployed & Verified |
| **4XL** | `female-model-4xl-front.png` | `female-model-4xl-back.png` | Largest body silhouette: maximum proportional width across shoulders, bust, waist, hips, and legs | Deployed & Verified |

*Note: Canonical duplicate copies (`female-model-m-front.png` and `female-model-m-back.png`) are synchronized with the authoritative baseline.*

---

## 2. Anatomical Body Reconstruction & Grading

Unlike 1D warping methods, the models feature genuine anatomical body differentiation across all body zones:
1. **Neck & Shoulders**: Neck width and neck-to-shoulder slope grade from 61px (XS) to 82px (3XL/4XL), smoothly integrating the jawline with the upper torso.
2. **Arms & Forearms**: Upper arm circumference and bicep/tricep volume scale proportionally, with natural wrist transitions.
3. **Torso & Bust**: Bust width expands from 258px (XS) to 308px (4XL); waist expands from 247px (XS) to 317px (4XL).
4. **Hips & Pelvis**: High hip width grades from 270px (XS) to 341px (4XL), with natural pelvic fullness and seat contours in back view.
5. **Legs & Calves**: Thigh width grades from 177px (XS) to 233px (4XL); calf width grades from 115px (XS) to 146px (4XL).
6. **Pose & Height Consistency**: Head position ($X = 385$), foot placement ($Y = 1325$), and camera angle are preserved across all variants.

---

## 3. Centralized Resolver & Pipeline Integration

The rendering pipeline in `frontend/js/renderer/renderer.js` and `frontend/js/renderer/body-profiles.js`:
- Maps `designState.size` and `designState.view` directly via `getFemaleCroquis(size, view)`.
- Updates base model `<image id="model-base-photo">` with attributes:
  - `data-size="${size}"`
  - `data-view="${view}"`
  - `data-target-croquis="${targetSrc}"`
- Dynamic hand clip calibration (`SIZE_HAND_CLIPS`): Hand and wrist overlay regions are tuned per size to ensure bare hands rest cleanly in front of the skirt without clipping artifacts.

---

## 4. Quality Assurance & Browser Validation

### 4.1 Syntax Checks
All 9 core files passed with exit code 0:
- `node --check frontend/js/app.js`
- `node --check frontend/js/renderer/geometry.js`
- `node --check frontend/js/renderer/lighting.js`
- `node --check frontend/js/renderer/materials.js`
- `node --check frontend/js/renderer/renderer.js`
- `node --check frontend/js/renderer/garment-data.js`
- `node --check frontend/js/renderer/size-data.js`
- `node --check frontend/js/renderer/body-profiles.js`
- `node --check backend/server.js`

### 4.2 Automated Browser Validation (1440×900 Desktop Viewport)
Puppeteer validation verified:
- Front and Back switching preserves size state across all 8 sizes.
- Size switching while viewing back updates the back croquis immediately.
- Zero console errors and zero 404 network errors.
- Garment sits with bespoke fit over every size without clipping or floating.
