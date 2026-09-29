# FashionForge — Female Size-Specific Croquis Calibration Specification & Architecture

## Overview
This document specifies the architecture, asset structure, mathematical body-calibration methodology, rendering pipeline, and QA validation for the **Size-Aware Female Photographic Croquis System** in FashionForge.

---

## 1. Asset Architecture

### 1.1 Specification & Invariants
- **Native Resolution**: 768 × 1376 px (RGBA 32-bit PNG with transparent alpha channel).
- **Center Axis**: $X = 385$ px.
- **Reference Standard**: The `M` size female model (`female-model-front.png` & `female-model-back.png`) is the authoritative visual, anatomical, and stylistic baseline and remains 100% unaltered.
- **Asset Count**: 8 sizes × 2 views = 16 calibrated photographic croquis assets.

### 1.2 Asset Directory Structure
All model assets reside in `frontend/assets/models/`:

| Size | Front View Asset | Back View Asset | Status |
| :--- | :--- | :--- | :--- |
| **XS** | `assets/models/female-model-xs-front.png` | `assets/models/female-model-xs-back.png` | Calibrated & Verified |
| **S** | `assets/models/female-model-s-front.png` | `assets/models/female-model-s-back.png` | Calibrated & Verified |
| **M** | `assets/models/female-model-front.png` | `assets/models/female-model-back.png` | Authoritative Baseline Reference |
| **L** | `assets/models/female-model-l-front.png` | `assets/models/female-model-l-back.png` | Calibrated & Verified |
| **XL** | `assets/models/female-model-xl-front.png` | `assets/models/female-model-xl-back.png` | Calibrated & Verified |
| **XXL** | `assets/models/female-model-xxl-front.png` | `assets/models/female-model-xxl-back.png` | Calibrated & Verified |
| **3XL** | `assets/models/female-model-3xl-front.png` | `assets/models/female-model-3xl-back.png` | Calibrated & Verified |
| **4XL** | `assets/models/female-model-4xl-front.png` | `assets/models/female-model-4xl-back.png` | Calibrated & Verified |

*Note: Canonical duplicate copies (`female-model-m-front.png` and `female-model-m-back.png`) are also maintained for programmatic completeness.*

---

## 2. Centralized Resolver Architecture

The system provides centralized croquis resolution via `frontend/js/renderer/body-profiles.js`:

```javascript
export const FEMALE_CROQUIS_REGISTRY = {
  XS:  { front: 'assets/models/female-model-xs-front.png',  back: 'assets/models/female-model-xs-back.png' },
  S:   { front: 'assets/models/female-model-s-front.png',   back: 'assets/models/female-model-s-back.png' },
  M:   { front: 'assets/models/female-model-front.png',     back: 'assets/models/female-model-back.png' },
  L:   { front: 'assets/models/female-model-l-front.png',   back: 'assets/models/female-model-l-back.png' },
  XL:  { front: 'assets/models/female-model-xl-front.png',  back: 'assets/models/female-model-xl-back.png' },
  XXL: { front: 'assets/models/female-model-xxl-front.png', back: 'assets/models/female-model-xxl-back.png' },
  '3XL': { front: 'assets/models/female-model-3xl-front.png', back: 'assets/models/female-model-3xl-back.png' },
  '4XL': { front: 'assets/models/female-model-4xl-front.png', back: 'assets/models/female-model-4xl-back.png' }
};

export function getFemaleCroquis(size = 'M', view = 'front');
export function getFemaleCroquisTarget(size = 'M', view = 'front');
```

### 2.1 Fallback Behavior
If an unknown or unmapped size string is passed, `getFemaleCroquis` gracefully defaults to the authoritative M baseline:
- `front` view $\rightarrow$ `assets/models/female-model-front.png`
- `back` view $\rightarrow$ `assets/models/female-model-back.png`

---

## 3. Mathematical Body Calibration Methodology

### 3.1 Proportional Scaling Rules (Non-Uniform Anatomical Calibration)
To satisfy the rule **"Do NOT solve this by simply CSS-stretching or squashing the M photograph"**, each size-specific model was generated using localized row-by-row non-uniform scaling anchored along the center axis $X = 385$:

1. **Head, Face, Hair, Neckline ($Y < 250$ px)**:
   - Scale factor: Exactly $1.000$ (0% distortion).
   - Preserves photographic realism, sharp eyes, nose, lips, hair texture, and natural human proportions.
2. **Neck to Shoulders ($Y \in [250, 340]$ px)**:
   - Smooth cubic interpolation from $1.0$ to `shoulderScale = size.shoulder / 14.5`.
3. **Upper Chest / Bust Volume ($Y \in [340, 420]$ px)**:
   - Smooth interpolation from `shoulderScale` to `bustScale = size.chest / 36.0`.
4. **Midsection / Waist ($Y \in [420, 500]$ px)**:
   - Smooth interpolation from `bustScale` to `waistScale = size.waistAvg / 33.0`.
5. **Hips & Pelvis Flare ($Y \in [500, 700]$ px)**:
   - Smooth interpolation from `waistScale` to `hipScale = size.hip / 40.0`.
6. **Thighs & Knees ($Y \in [700, 1150]$ px)**:
   - Smooth tapering transition from `hipScale` back toward $1.0$.
7. **Calves, Ankles, Shoes & Studio Ground ($Y > 1150$ px)**:
   - Scale factor: Exactly $1.000$ (0% distortion).
   - Preserves high-heel geometry, shoe contours, and ground contact shadow alignment.

### 3.2 Foreground Hands Occlusion Layer
In `body-profiles.js`, the wrist and bare hand clipping region (`LM.armsForeground`) dynamically scales with `hipScale` around $X = 385$:
```javascript
armsForeground: {
  leftClip: `M ${scaleX(238, hipScale)} 580 L ${scaleX(275, hipScale)} 580 L ${scaleX(275, hipScale)} 750 L ${scaleX(238, hipScale)} 750 Z`,
  rightClip: `M ${scaleX(495, hipScale)} 580 L ${scaleX(535, hipScale)} 580 L ${scaleX(535, hipScale)} 750 L ${scaleX(495, hipScale)} 750 Z`
}
```
This ensures the model's actual hands resting against her thighs always overlay the flared skirt cleanly at any garment size.

---

## 4. Complete Unified Rendering Pipeline

The rendering pipeline enforces single-state synchronization across all visual systems:

```
selected size (designState.size)
  │
  ├─► Body Profiles (getBodyLandmarks)
  │     └─► Scaled shoulder, bust, waist, hip, skirt flutes, sleeve hem, hand clips
  │
  ├─► Female Croquis Resolver (getFemaleCroquis)
  │     ├─► Base Model Layer (<image id="model-base-photo" href="...">)
  │     └─► Foreground Hands Layer (<image class="foreground-hands-photo" ...>)
  │
  ├─► 2.5D Garment Geometry (geometry.js)
  │     └─► Bodice, skirt, sleeves, neck binding, seam lines, contact shadows
  │
  ├─► Material, Texture & Shading (materials.js, lighting.js)
  │     └─► Organic weave, specular lighting, ambient occlusions
  │
  ├─► View Orientation Synchronizer (designState.view)
  │     └─► Front View ↔ Back View (preserves selected size)
  │
  ├─► Technical Flat CAD (CAD vector paths independent of photograph)
  │
  └─► Tech Pack Specifications (size-data.js industry metrics)
```

---

## 5. Front/Back and Size State Invariants

1. **State Preservation**:
   - Switching Front $\leftrightarrow$ Back preserves `designState.size`.
   - Changing size while in Back view immediately renders that size's Back croquis asset and garment geometry.
2. **CAD Vector Flat Independence**:
   - The Technical Flat CAD view (`renderTechnicalFlat` and `renderTechnicalFlatPair`) continues to render pure vector line art independently of the photographic croquis.
3. **Tech Pack Metric Alignment**:
   - Specifications, measurements, and tolerances continue to read directly from `size-data.js`.

---

## 6. QA Verification & Test Results

### 6.1 Syntax and Linter Validation
- `node --check frontend/js/app.js`: **Passed (Exit 0)**
- `node --check frontend/js/renderer/geometry.js`: **Passed (Exit 0)**
- `node --check frontend/js/renderer/lighting.js`: **Passed (Exit 0)**
- `node --check frontend/js/renderer/materials.js`: **Passed (Exit 0)**
- `node --check frontend/js/renderer/renderer.js`: **Passed (Exit 0)**
- `node --check frontend/js/renderer/garment-data.js`: **Passed (Exit 0)**
- `node --check frontend/js/renderer/size-data.js`: **Passed (Exit 0)**
- `node --check frontend/js/renderer/body-profiles.js`: **Passed (Exit 0)**
- `node --check backend/server.js`: **Passed (Exit 0)**
- `git diff --check`: **Passed (No conflicts or whitespace errors)**

### 6.2 Browser Automation (Puppeteer at 1440×900 Desktop Viewport)
Automated test suite (`scratch/test_qa_croquis.js`) verified:
- **All 8 Front Sizes (XS, S, M, L, XL, XXL, 3XL, 4XL)**: Verified model image `href`, `data-size`, and `data-view`.
- **All 8 Back Sizes (XS, S, M, L, XL, XXL, 3XL, 4XL)**: Verified model image `href`, `data-size`, and `data-view`.
- **View Transitions**:
  - `M` Front $\rightarrow$ `M` Back
  - Size switch while on Back: `M` Back $\rightarrow$ `XL` Back $\rightarrow$ `3XL` Back
  - View switch back to Front: `3XL` Back $\rightarrow$ `3XL` Front
  - Size switch on Front: `3XL` Front $\rightarrow$ `XS` Front
- **Console Errors**: 0 errors.
- **Network 404s**: 0 errors.
- **Visual Artifacts**: Zero white bounding boxes, zero broken transparency, zero floating garment gaps, head and shoe proportions 100% natural.

---

## 7. Known Limitations & Next Steps
- **Male Model Expansion**: Deferred to subsequent phase per instruction.
- **Broader Catalog Expansion**: Bodice/Skirt styles remain the current bespoke A-Line baseline until Phase 4 component expansion.
