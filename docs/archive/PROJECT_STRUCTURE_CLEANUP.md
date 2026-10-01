# FashionForge — Project Structure Cleanup & Technical Flat Diagnosis Report
**Phase:** Pre-Calibration Foundation, Repository Organization & CAD Technical Flat Repair<br>
**Target:** Female Size-Specific Croquis Calibration + Back Technical Flat System<br>
**Status:** Completed & Validated<br>
**Maintainer:** Senior Software Architect & Repository Maintainer

---

## 1. Executive Summary

This phase completes the final repository audit, asset pruning, and technical flat diagnosis/repair for FashionForge before entering the **Female Size-Specific Croquis Calibration** phase.

Key Milestones Achieved:
1. **Preserved Authoritative Size-M Female Model:** `female-model-front.png` and `female-model-back.png` remain 100% untouched as the anatomical reference baseline.
2. **Pruned All Obsolete / Duplicate Croquis Assets:**
   - Removed duplicate non-alpha JPEG exports (`female-model-front.jpg`, `female-model-back.jpg`).
   - Removed legacy prototype croquis files (`female-croquis.webp`, `male-croquis.avif`).
   - Removed duplicate/mislocated vector templates from `svg/croquis/`.
   - Pruned obsolete empty directories (`frontend/assets/croquis/` and `frontend/assets/svg/croquis/`).
3. **Preserved Modular SVG Component Library:** Kept all 12 reusable vector components in `assets/svg/` (`bottoms/`, `collars/`, `sleeves/`, `tops/`).
4. **Diagnosed and Repaired Technical Flat Back-View Bug:**
   - Identified root causes: lack of interactive click handlers on inspector technical sketch thumbnails, missing Front/Back view toggle in the CAD workspace toolbar, and omission of the lower center back seam below the zipper.
   - Implemented bidirectional Front/Back switching in the CAD toolbar and inspector thumbnails with active indicator states.
   - Connected `lines.centerBackSeam` so the spine construction seam extends cleanly from zipper to hem.
5. **Verified 100% System Integrity:** Zero console errors, zero 404 asset requests, and flawless browser test execution.

---

## 2. Asset Usage & Audit Matrix

| Asset Path | Format / Dimensions | Category | Action | Rationale |
|:---|:---|:---|:---|:---|
| `frontend/assets/models/female-model-front.png` | PNG (RGBA, 768×1376, 886 KB) | **Active Authoritative Model** | **Retained (Protected)** | Primary anatomical reference and active front croquis used across Design Studio and Home page. |
| `frontend/assets/models/female-model-back.png` | PNG (RGBA, 768×1376, 878 KB) | **Active Authoritative Model** | **Retained (Protected)** | Primary anatomical reference and active back croquis used in Design Studio back view. |
| `frontend/assets/models/female-model-front.jpg` | JPEG (RGB, 768×1376, 270 KB) | **Duplicate / Unused** | **Removed** | Opaque JPEG duplicate without alpha transparency; unreferenced in application runtime. |
| `frontend/assets/models/female-model-back.jpg` | JPEG (RGB, 768×1376, 264 KB) | **Duplicate / Unused** | **Removed** | Opaque JPEG duplicate without alpha transparency; unreferenced in application runtime. |
| `frontend/assets/croquis/female-croquis.webp` | WebP (1280×1280, 136 KB) | **Obsolete Legacy Template** | **Removed** | Prototype template from early milestone; superseded by photographic PNG models. Unreferenced in code. |
| `frontend/assets/croquis/male-croquis.avif` | AVIF (1200×1200, 7.3 KB) | **Deferred / Unused** | **Removed** | Male croquis is out of current scope (Phase 4). Will be introduced with properly calibrated assets in Phase 4. |
| `frontend/assets/svg/croquis/croquis-template-fashion-figure-leg.webp` | WebP (1280×1280, 136 KB) | **Duplicate / Legacy** | **Removed** | Byte-for-byte SHA256 duplicate of `female-croquis.webp`, mislocated inside `svg/`. |
| `frontend/assets/svg/croquis/male-fashion-croquis-template-apparel-design_98908-17871.avif` | AVIF (1200×1200, 7.3 KB) | **Duplicate / Legacy** | **Removed** | Byte-for-byte SHA256 duplicate of `male-croquis.avif`, mislocated inside `svg/`. |
| `frontend/assets/svg/bottoms/*.svg` (3 files) | Vector SVG | **Reusable Component Assets** | **Retained** | Composable skirt (`skirt`) and trouser (`trousers`, `wide`) component assets. |
| `frontend/assets/svg/collars/*.svg` (3 files) | Vector SVG | **Reusable Component Assets** | **Retained** | Composable neckline (`round`, `vneck`, `square`) component assets. |
| `frontend/assets/svg/sleeves/*.svg` (3 files) | Vector SVG | **Reusable Component Assets** | **Retained** | Composable sleeve (`short`, `long`, `flare`) component assets. |
| `frontend/assets/svg/tops/*.svg` (3 files) | Vector SVG | **Reusable Component Assets** | **Retained** | Composable bodice (`basic`, `crop`, `tunic`) component assets. |
| `docs/reference/fashionforge-target.png` | PNG | **Visual Target Reference** | **Retained** | Ground-truth visual design studio specification blueprint. |

---

## 3. Authoritative M-Size Model Reference

The authoritative reference model is located at:
```text
frontend/assets/models/
├── female-model-front.png   (768 × 1376 px, RGBA, center X = 385)
└── female-model-back.png    (768 × 1376 px, RGBA, center X = 385)
```

### Anatomical Benchmark Parameters (Preserved)
- **Coordinate Canvas:** 768 × 1376 px (SVG viewBox: `85 70 600 1240`)
- **Central Vertical Axis:** $X = 385$
- **Neck Base:** $Y = 248$
- **Shoulders:** Left $(294, 252)$, Right $(476, 252)$
- **Bust Apex:** Left $(335, 375)$, Right $(435, 375)$
- **Armholes / Armscye:** Left $(302, 335)$, Right $(468, 335)$
- **Natural Waist:** Left $(310, 470)$, Right $(460, 470)$, Center $(385, 470)$
- **High Hip / Pelvis:** Left $(292, 590)$, Right $(478, 590)$
- **Foreground Hands Occlusion:** Wrist/hand natural resting pose clipped via SVG `#ff-foreground-hands-clip`.

This M model serves as the fixed benchmark for creating future calibrated size assets (`XS`, `S`, `L`, `XL`, `XXL`, `3XL`, `4XL`).

---

## 4. Technical Flat Back-View Diagnosis & Repair

### The Root Cause
1. **Unwired Inspector Thumbnails:** In `frontend/design.html`, the Front and Back technical sketch thumbnails in the right inspector had no click listeners or interaction handlers. Clicking the "Back" thumbnail did not trigger `setView('back')`.
2. **Missing Toolbar View Switcher in CAD Workspace:** While `#workspace-2d` had Front/Back view buttons, entering the CAD workspace (`#workspace-technical-flat`) hid `#workspace-2d`, leaving the CAD workspace with no toolbar control to switch between Front and Back.
3. **Incomplete Center Back Seam:** In `buildTechnicalFlatSvg`, `lines.centerBackZipper` was appended, but `lines.centerBackSeam` (extending from zipper base to hem) was omitted.

### Implementation Details
- **`frontend/design.html`:**
  - Added a matching `.segmented-control` with `#btn-cad-view-front` and `#btn-cad-view-back` to the CAD toolbar.
  - Added IDs (`#col-tech-flat-front`, `#frame-tech-flat-front`, `#col-tech-flat-back`, `#frame-tech-flat-back`) and `role="button"` attributes to inspector thumbnails.
- **`frontend/css/style.css`:**
  - Added hover, cursor, and active border styling (`.tech-sketch-frame.is-active`) for thumbnails.
- **`frontend/js/renderer/renderer.js`:**
  - Appended `lines.centerBackSeam` below the zipper down to the hem in `buildTechnicalFlatSvg`.
- **`frontend/js/app.js`:**
  - Wired `#btn-cad-view-front` and `#btn-cad-view-back` to `setView('front')` and `setView('back')`.
  - Wired inspector thumbnails `#col-tech-flat-front` and `#col-tech-flat-back` to switch view and open CAD workspace.
  - Updated `setView()` and `syncUIFromState()` to synchronize active states across both toolbars and inspector thumbnails.

---

## 5. Final Directory Structure

```text
FashionForge/
├── .gitignore
├── FASHIONFORGE_2_5D_SPEC.md
├── FASHIONFORGE_MASTER_PROJECT_PLAN.md
├── PROJECT_PLAN.md
├── PROJECT_STRUCTURE_CLEANUP.md
├── README.md
├── package-lock.json
├── package.json
├── backend/
│   └── server.js
├── docs/
│   └── reference/
│       └── fashionforge-target.png
└── frontend/
    ├── design.html
    ├── index.html
    ├── assets/
    │   ├── models/
    │   │   ├── female-model-back.png
    │   │   └── female-model-front.png
    │   └── svg/
    │       ├── bottoms/
    │       │   ├── bottom-skirt.svg
    │       │   ├── bottom-trousers.svg
    │       │   └── bottom-wide.svg
    │       ├── collars/
    │       │   ├── collar-round.svg
    │       │   ├── collar-square.svg
    │       │   └── collar-vneck.svg
    │       ├── sleeves/
    │       │   ├── sleeve-flare.svg
    │       │   ├── sleeve-long.svg
    │       │   └── sleeve-short.svg
    │       └── tops/
    │           ├── top-basic.svg
    │           ├── top-crop.svg
    │           └── top-tunic.svg
    ├── css/
    │   └── style.css
    └── js/
        ├── app.js
        └── renderer/
            ├── body-profiles.js
            ├── garment-data.js
            ├── geometry.js
            ├── lighting.js
            ├── materials.js
            ├── renderer.js
            └── size-data.js
```

---

## 6. Validation Results

| Test Item | Verification Method | Status |
|:---|:---|:---:|
| Node Syntax Check | `node --check` across all 9 JS files | **PASS (0 errors)** |
| Git Diff Check | `git diff --check` | **PASS (0 warnings)** |
| Broken References Audit | Grep across HTML, JS, CSS, SVG | **0 broken references** |
| Female M Front Model | Canvas/SVG render verification | **PASS** |
| Female M Back Model | View switch & photo href verification | **PASS** |
| Technical Flat CAD Open | View All button & thumbnail clicks | **PASS** |
| FRONT CAD View Render | Vector CAD silhouette & seams | **PASS** |
| BACK CAD View Render | Zipper pull, zipper seam, center seam, darts | **PASS** |
| Front/Back View Switching | Repeated switching via toolbar & thumbnails | **PASS** |
| Size Changes in CAD View | Geometry adaptation across sizes (XS–4XL) | **PASS** |
| Return to 2.5D Studio | State preserved on return | **PASS** |
| Browser Console Errors | Headless browser execution log | **0 ERRORS** |
| Asset Network 404s | Headless browser network capture | **0 404s** |

---

## 7. Known Limitations & Next Phase Readiness

- **Current Photographic Croquis Scope:** The repository currently has photographic assets for size M (`female-model-front.png`, `female-model-back.png`). Garment geometry and technical flats adapt accurately for all sizes (XS–4XL). True photographic calibration for other sizes will be addressed in the dedicated **Female Size-Specific Croquis Calibration** phase.
- **Male Tailoring Scope:** Male tailoring remains deferred for Phase 4 as specified in the master project plan.
