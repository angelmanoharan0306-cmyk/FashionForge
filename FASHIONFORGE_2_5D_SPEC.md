# FashionForge — 2.5D Rendering Engine Specification & Consolidation

**Status:** Completed & Consolidated (Phase 4)
**Version:** 1.0 (Procedural Vector 2.5D Compositing with Photographic Croquis Integration)
**Authoritative Modules:**
- [`frontend/js/renderer/renderer.js`](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/frontend/js/renderer/renderer.js)
- [`frontend/js/renderer/geometry.js`](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/frontend/js/renderer/geometry.js)
- [`frontend/js/renderer/lighting.js`](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/frontend/js/renderer/lighting.js)
- [`frontend/js/renderer/materials.js`](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/frontend/js/renderer/materials.js)
- [`frontend/js/renderer/body-profiles.js`](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/frontend/js/renderer/body-profiles.js)
- [`frontend/js/renderer/garment-data.js`](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/frontend/js/renderer/garment-data.js)
- [`frontend/js/renderer/size-data.js`](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/frontend/js/renderer/size-data.js)
- [`frontend/js/app.js`](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/frontend/js/app.js)

---

## 1. Executive Overview & Scope

FashionForge delivers a browser-native **2.5D digital fashion design workflow** combining high-resolution photographic human croquis models with precision vector SVG garment modeling.

### Core Architectural Principle
The pipeline achieves convincing dimensional depth, tactile textile realism, and bespoke fit **without 3D engines** (no WebGL, Three.js, or canvas-based 3D mesh physics) and **without raster garment distortion or AI artifacts**. All garment silhouettes, drape flutes, micro-textures, specular highlights, and construction seams are procedurally computed in pure SVG/CSS/JavaScript.

---

## 2. Canonical Rendering Pipeline Architecture

The rendering pipeline is centralized in [`renderer.js`](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/frontend/js/renderer/renderer.js) and executes deterministically upon any design state change:

```text
renderDesign(designState, svgElement)
  │
  ├── 1. Establish Coordinate Space (768 × 1376 coordinate space, viewBox: 85 70 600 1240)
  ├── 2. Defs Generation (Dynamic weave patterns, volumetric gradients, depth filters, clip paths)
  ├── 3. renderCroquis(svgElement, isBack, size, gender, LM)
  │      └── Ground shadow + Photographic Alpha PNG base layer
  ├── 4. renderGarment(garmentGroup, designState, palette, isBack, LM)
  │      ├── a. Interior Depth (Underside skirt facing, inner back neck drop)
  │      ├── b. renderBottom()  [Lower garment silhouette + flutes + seams]
  │      ├── c. renderWaistInterface() [Connection band + contact drop shadow]
  │      ├── d. renderTop()     [Bodice silhouette + princess seams + bust fullness]
  │      ├── e. renderSleeves() [Set-in sleeves + cylindrical volume + arm cast shadows]
  │      ├── f. renderNeckline()[Finished binding strip + clavicle contact shadow]
  │      ├── g. applyConstructionDetails() [Topstitching, zipper, back darts]
  │      └── h. renderDepth()   [Leg contact shadow, ambient occlusions]
  └── 5. Calibration Overlay (Optional debugger)
```

Each garment component (`bottom`, `top`, `sleeves`, `collar`) applies the canonical 2.5D visual stages:
- **`applyColour`**: Base fabric tint and structural seam contours derived via `getHarmonizedPalette`.
- **`applyLighting`**: Directional key/fill gradients (`#ff-light-...`) providing cylindrical volume and highlights.
- **`applyMaterial`**: Micro-texture weave patterns (`#ff-fabric-weave-${fabricId}`) simulating tactile surface hand.
- **`applyPattern`**: Surface decorative graphic repeat (`#ff-garment-pattern`), strictly clipped to the garment boundary.
- **`applyConstructionDetails`**: Structural seams, darts, and stitch lines matching bespoke sartorial standards.
- **`renderDepth`**: Ambient contact shadows grounding the garment against the underlying anatomy.

---

## 3. Canonical Coordinate System & Scale Invariance

- **Canvas Dimensions:** Exact $768 \times 1376\text{ px}$.
- **Central Vertical Axis:** $X = 385.0\text{ px}$ (symmetrical across all models and sizes).
- **Viewport Frame:** `viewBox="85 70 600 1240"`.
- **Ground Baseline:** $Y \approx 1311\text{--}1315\text{ px}$ across both genders and all 8 sizes (XS through 4XL).
- **Stature Invariance:** Head apex to heel baseline spans $\approx 1230\text{--}1233\text{ px}$ across all sizes. Garment grading expands horizontally via calibrated multi-zone biological grading rather than uniform CSS scaling.

---

## 4. Material & Lighting System

### Supported Material Profiles
| Fabric | Roughness | Specular Mode | Highlight Opacity | Shadow Depth | Visual Tactile Characteristic |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Organic Cotton** | 0.85 | Matte | 0.16 | 0.36 | Balanced cross-weave, soft matte fall, natural drape |
| **Mulberry Silk** | 0.25 | Lustrous | 0.42 | 0.44 | High specular sheen, directional specular glints, fluid fall |
| **Structured Denim**| 0.92 | Sturdy | 0.10 | 0.48 | 45° diagonal twill weave, deep contour shadows, crisp body |
| **Natural Linen** | 0.90 | Crisp | 0.18 | 0.34 | Organic cross-slub grid, dry hand, visible weave variations |
| **Sheer Chiffon** | 0.35 | Airy | 0.24 | 0.22 | Lightweight sheer micro-mesh, delicate translucent shimmer |

### Volumetric Lighting Elements
1. **Directional Key Light:** 45° top-left illumination defining body curvature and fabric planes.
2. **Radial Bust Fullness:** Dual radial gradients contouring chest / bust anatomy in Front view.
3. **Sinusoidal Drape Flutes:** Multi-stop linear gradients reproducing vertical fabric drape folds on flared skirts.
4. **Cylindrical Arm Shading:** Opposing key/fill gradients wrapping around upper arm and short sleeve tubes.
5. **Waist Interface Contact Shadow:** Ambient occlusion band connecting bodice to lower skirt.
6. **Underside Facing Depth:** Darkened cavity gradients inside neckline scoop and under skirt hem.
7. **Cast Shadows:** Soft feathered cast shadows cast from sleeve hems onto bare arms and skirt hem onto legs.

---

## 5. Technical Flat CAD System

In addition to 2.5D photographic visualization, the engine generates production-ready vector CAD technical flats:
- **Renderer:** [`renderTechnicalFlat`](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/frontend/js/renderer/renderer.js) and [`renderTechnicalFlatPair`](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/frontend/js/renderer/renderer.js).
- **Viewport:** Tight bounding frame `215 270 340 660`.
- **Styling:** Clean 1.8px CAD contours with 1.0px internal seam lines and dashed topstitching on pure white background.
- **Independence:** 100% independent of photographic croquis assets; represents construction and seam geometry exclusively.
- **Views:** Front CAD sketch (princess seams, armscye attachment, waist seam, skirt flutes, topstitching) and Back CAD sketch (center-back invisible zipper, pull hardware, back darts, flutes, hem stitching).

---

## 6. Phase 4 Acceptance Criteria & Verification

| Requirement | Acceptance Standard | Verification Result |
| :--- | :--- | :---: |
| **Garment Fit** | Derives dynamically from active body landmarks; zero gap at neck, shoulders, armscye, waist; no arm bleed | **PASS** |
| **2.5D Depth** | Directional lighting, cylindrical sleeve volume, contact shadows, underside depth | **PASS** |
| **Material Separation** | Distinct roughness, specular sheen, and micro-weave overlays across all fabrics | **PASS** |
| **Colour Independence** | Base color derivations preserve 100% identical garment geometry and croquis state | **PASS** |
| **Pattern Autonomy** | Patterns clipped to exact silhouette paths without spill or rectangular artifacts | **PASS** |
| **Front/Back Sync** | Front $\leftrightarrow$ Back preserves size, gender, fabric, colour, and pattern state | **PASS** |
| **Technical Flat** | Dual front & back vector CAD sketch renders with clean construction linework | **PASS** |
| **Test Matrix** | Female (M, 4XL Front/Back) + Male (M, 4XL Front/Back) rendered cleanly | **PASS** (8/8) |
| **Browser Health** | Zero console errors, zero failed network requests | **PASS** (0 errors) |
| **Regression Safety** | Frozen Female and Male croquis systems retain 100% calibration compliance | **PASS** (16/16) |
