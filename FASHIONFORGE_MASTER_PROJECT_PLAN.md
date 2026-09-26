# FashionForge --- Master Project Document

**Project:** FashionForge\
**Type:** Final-Year Full-Stack Web Application\
**Primary Goal:** Build a professional interactive fashion design studio
with a polished **2.5D fashion visualization workflow**, technical
fashion outputs, design management, and a simulated commerce flow.

------------------------------------------------------------------------

## 1. Project Vision

FashionForge is a browser-based digital fashion design studio.

The user should be able to enter the studio as a guest, choose garment
silhouettes/components, customize fabric, colour and pattern, see the
outfit update live on a professional fashion croquis, inspect the design
from the front and back, view a technical flat sketch, receive
automatically generated garment specifications and transparent
rule-based style suggestions, see a live price, and eventually save the
design and move it through a simulated shopping/order workflow.

The **Design Studio is the core product**. Shopping and order
functionality are supporting features.

------------------------------------------------------------------------

## 2. Product Direction

The new Design Studio should take inspiration from the workflows and
polish of **Nastix Design, Tailornova, DIYO, and professional
fashion/CAD workflows such as CLO/Browzwear**, while remaining an
original FashionForge implementation.

### Desired experience

-   visual component selection
-   visual material/fabric selection
-   visual colour selection
-   visual pattern selection
-   clear active states
-   professional croquis
-   convincing garment depth
-   fabric-specific appearance
-   front/back design views
-   technical flat output
-   structured garment information
-   design history and management
-   clear price calculation
-   responsive layout

------------------------------------------------------------------------

## 3. Critical Scope: 2.5D, Not True 3D

FashionForge does **not** implement real 3D.

The target is a convincing **2.5D fashion visualization** using:

-   HTML
-   CSS
-   JavaScript
-   SVG
-   SVG gradients
-   SVG patterns
-   SVG masks/clipping where useful
-   subtle shadows
-   highlights
-   folds
-   seams
-   stitch lines
-   edge/hem depth
-   material-specific visual treatments

Do **not** introduce:

-   Three.js
-   WebGL
-   Canvas-based 3D
-   real 3D garment simulation
-   fabric physics
-   cloth simulation
-   AI image generation
-   AI garment generation
-   raster garment images as the primary garment system
-   webcam/AR try-on
-   real 360-degree rotation

------------------------------------------------------------------------

## 4. Technology Stack

### Frontend

-   HTML5
-   CSS3
-   Vanilla JavaScript
-   SVG

### Backend

-   Node.js
-   Express

### Database

-   MongoDB

### Development

-   VS Code
-   Git/GitHub
-   Postman
-   Browser developer tools

### Design/asset tools

-   Inkscape
-   Figma free plan
-   GIMP
-   Font Awesome Free where useful

Bootstrap is optional and should not be introduced if custom CSS is
sufficient.

------------------------------------------------------------------------

## 5. Architecture

``` text
USER
  ↓
FRONTEND
HTML + CSS + JavaScript
  ↓
REST API
  ↓
NODE.JS + EXPRESS
  ↓
MONGODB
```

------------------------------------------------------------------------

## 6. Current Repository

Expected structure:

``` text
FashionForge/
├── backend/
│   └── server.js
├── frontend/
│   ├── assets/
│   │   ├── croquis/
│   │   └── svg/
│   │       ├── bottoms/
│   │       ├── collars/
│   │       ├── sleeves/
│   │       └── tops/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   ├── design.html
│   └── index.html
├── PROJECT_PLAN.md
├── README.md
├── .gitignore
├── package.json
└── package-lock.json
```

Antigravity must inspect the real repository before editing rather than
assuming this structure is unchanged.

------------------------------------------------------------------------

## 7. Existing Project Status

Completed milestones include:

-   project initialization
-   frontend foundation
-   home page
-   Design Studio UI
-   reusable SVG garment assets
-   professional female/male croquis integration work

The previous garment visualization used separate flat SVG layers. That
implementation is now considered a **prototype**, not the final visual
architecture.

The latest visual problem was poor layering/overlay behaviour and a
flat, insufficiently professional appearance.

Useful infrastructure should be preserved, but the old visual garment
system may be replaced/rebuilt.

------------------------------------------------------------------------

## 8. Professional Croquis Requirement

Use the supplied professional fashion croquis assets as the foundation.

Known assets include:

-   female professional croquis
-   male professional croquis

Female is the default.

Do not recreate the old childish/custom mannequin.

Garments must use a stable coordinate system derived from the
professional croquis.

------------------------------------------------------------------------

## 9. Core Design Studio Workflow

``` text
Enter Design Studio
        ↓
Choose / configure silhouette
        ↓
Choose garment components
        ↓
Choose details
        ↓
Choose fabric
        ↓
Choose colour
        ↓
Choose pattern
        ↓
Live 2.5D preview
        ↓
Front / Back
        ↓
Technical Flat
        ↓
Garment Specifications
        ↓
Tech Pack Lite
        ↓
Style Recommendation
        ↓
Live Price
        ↓
Save Design
```

Guests can design freely.

Login is required only for account-based operations such as saving, My
Designs, cart, and checkout.

------------------------------------------------------------------------

## 10. Design Studio Features

### Must-have

-   professional croquis
-   garment silhouette selection
-   top/component selection
-   bottom/component selection
-   sleeve selection
-   neckline/collar selection
-   construction/design details
-   fabric
-   colour
-   pattern
-   live 2.5D rendering
-   front view
-   back view
-   technical flat front
-   technical flat back
-   garment specifications
-   live price
-   design summary
-   reset
-   undo
-   redo
-   zoom
-   selection states

### Should-have

-   duplicate design
-   rename
-   delete
-   version number
-   notes
-   design history
-   visual material swatches
-   pattern thumbnails
-   component compatibility
-   selected-item list
-   fullscreen preview
-   download technical sketch

### Supporting

-   authentication
-   save/My Designs
-   cart
-   checkout
-   payment simulation
-   order confirmation
-   tracking

------------------------------------------------------------------------

## 11. New Design-System Philosophy

Do not treat 12 SVG files as the entire fashion system.

Use a composable model:

``` text
Garment Base
+
Silhouette
+
Top
+
Bottom
+
Sleeve
+
Neckline
+
Construction Detail
+
Fabric
+
Colour
+
Pattern
+
Lighting / Depth
```

Conceptual component model:

``` js
{
  id: "sleeve-long",
  name: "Long Sleeve",
  category: "sleeve",
  geometry: "...",
  compatibleWith: [],
  price: 150,
  constructionDetails: [],
  frontVisual: "...",
  backVisual: "...",
  technicalVisual: "..."
}
```

The final implementation may improve this structure, but it must remain
composable and maintainable.

------------------------------------------------------------------------

## 12. 2.5D Rendering Architecture

Use a centralized renderer.

Conceptual pipeline:

``` text
renderDesign()
    ↓
renderCroquis()
    ↓
renderGarmentBase()
    ↓
renderSilhouette()
    ↓
renderComponents()
    ↓
applyMaterial()
    ↓
applyColour()
    ↓
applyPattern()
    ↓
applyLighting()
    ↓
applyDepth()
    ↓
applyConstructionDetails()
    ↓
renderViewState()
```

Do not scatter rendering behaviour across unrelated event handlers.

------------------------------------------------------------------------

## 13. 2.5D Visual Requirements

Garments should communicate depth without becoming true 3D.

### Shape

-   clean silhouette
-   correct proportions
-   controlled overlaps
-   realistic hems
-   neckline depth
-   sleeve depth
-   garment edge thickness

### Lighting

-   subtle highlights
-   subtle shadows
-   directional light
-   darker edge treatment
-   controlled gradients

### Fabric

Fabric appearance should change according to material.

Examples:

**Cotton** - matte - soft diffuse shading - subtle textile texture

**Denim** - stronger texture - heavier visual weight - darker edges -
subtle diagonal grain

**Satin/Silk** - smooth gradients - directional sheen - stronger
highlight

**Linen** - matte - fine irregular texture

**Chiffon/Organza** - lighter appearance - controlled transparency -
softer highlights

Use the application's actual supported fabric data rather than inventing
incompatible options.

------------------------------------------------------------------------

## 14. Construction Details

Support contextual visual cues such as:

-   seams
-   stitch lines
-   darts
-   folds
-   pleats where appropriate
-   hem lines
-   cuffs
-   straps
-   piping
-   panel lines
-   neckline edges
-   sleeve edges
-   waistbands

Not every garment needs every detail.

------------------------------------------------------------------------

## 15. Front / Back

Front and back are separate visual states.

The same design object controls both.

``` js
view = "front"
view = "back"
```

Switching views must preserve all selected design state.

------------------------------------------------------------------------

## 16. Technical Flat Sketch

Technical flat is a separate output mode.

It must not simply reuse the realistic 2.5D rendering.

It should be:

-   clean
-   simplified
-   line-oriented
-   front + back
-   construction-focused
-   suitable for documentation

Show relevant silhouette, seams, neckline, sleeves, hems and other
construction details.

------------------------------------------------------------------------

## 17. Tech Pack Lite

Implement a student-project-friendly Tech Pack Lite containing:

-   Style ID
-   Style name
-   Design version
-   Front technical sketch
-   Back technical sketch
-   Fabric
-   Colour
-   Pattern
-   Components
-   Basic measurements
-   Construction notes
-   Design notes
-   Price
-   Creation date

Do not overbuild a manufacturing-grade tech pack.

------------------------------------------------------------------------

## 18. Garment Specifications

Generate specifications from the selected design state.

Possible fields:

-   silhouette
-   top
-   bottom
-   sleeve
-   neckline
-   fabric
-   colour
-   pattern
-   construction details
-   estimated length
-   estimated fit
-   design complexity

The system must be deterministic and explainable.

------------------------------------------------------------------------

## 19. Rule-Based Recommendation

This is **not machine learning**.

Use transparent JavaScript IF/THEN rules.

Example:

``` js
if (fabric === "silk" && silhouette === "flowing") {
  recommendation =
    "A fluid silhouette complements the drape of this fabric.";
}
```

Rules can consider fabric, silhouette, colour, pattern, sleeve, neckline
and complexity.

Every recommendation must be explainable.

------------------------------------------------------------------------

## 20. Pricing Engine

Use a centralized formula:

``` text
Base garment
+ Fabric cost
+ Component complexity
+ Special details
+ Pattern cost
= Total
```

Example:

``` text
Base garment       ₹800
Cotton             ₹250
Long sleeve        ₹150
Special collar     ₹100
Pattern            ₹100
------------------------
Total             ₹1400
```

Actual values must come from centralized data/configuration.

------------------------------------------------------------------------

## 21. Design Management

Support:

-   Save
-   Open
-   Rename
-   Duplicate
-   Delete
-   Created date
-   Updated date
-   Version
-   Summary
-   Notes

Store structured design data, not only screenshots.

Conceptual model:

``` js
{
  name,
  version,
  croquis,
  silhouette,
  top,
  bottom,
  sleeves,
  neckline,
  details,
  fabric,
  colour,
  pattern,
  notes,
  price,
  createdAt,
  updatedAt
}
```

------------------------------------------------------------------------

## 22. MongoDB Collections

### users

``` text
id
name
email
passwordHash
createdAt
```

### components

``` text
id
category
name
svgRef / visualRef
basePrice
metadata
```

### designs

``` text
id
userId
name
version
croquis
silhouette
top
bottom
sleeves
neckline
details
fabric
colour
pattern
price
notes
createdAt
updatedAt
```

### orders

``` text
id
userId
designId
amount
paymentStatus
orderStatus
createdAt
```

Add collections only when justified.

------------------------------------------------------------------------

## 23. API Direction

Current health endpoint:

``` text
GET /api/health
```

Planned resource endpoints:

``` text
POST   /api/auth/register
POST   /api/auth/login

GET    /api/components
GET    /api/fabrics
GET    /api/patterns

POST   /api/designs
GET    /api/designs
GET    /api/designs/:id
PUT    /api/designs/:id
DELETE /api/designs/:id

POST   /api/orders
GET    /api/orders
GET    /api/orders/:id
```

Authentication should be added only after the frontend design model is
stable.

------------------------------------------------------------------------

## 24. Commerce Flow

``` text
Design Studio
    ↓
Save Design
    ↓
Add to Cart
    ↓
Cart
    ↓
Checkout
    ↓
Payment Simulation
    ↓
Order Confirmation
    ↓
Tracking
```

Payment, shipping and inventory are simulated.

------------------------------------------------------------------------

## 25. Explicitly Out of Scope

-   real 3D mannequin
-   360-degree true 3D rotation
-   AR
-   webcam try-on
-   real ML
-   generative AI garment creation
-   real fabric physics
-   cloth simulation
-   real payment gateway
-   real inventory
-   real shipping integration
-   admin dashboard
-   social sharing
-   public social feed
-   measurement-based custom fitting
-   full manufacturing-grade tech pack
-   unnecessary frameworks/dependencies

------------------------------------------------------------------------

# 26. Implementation Roadmap

## PHASE 0 --- Project Baseline and Safety

**Goal:** Protect the current project.

Tasks: - read this document fully - read `PROJECT_PLAN.md` fully -
inspect repository and Git status - inspect current Design Studio -
inspect assets - create a safe Git checkpoint - create redesign branch
if appropriate

Acceptance: - application still runs - baseline is recoverable - no
redesign implementation yet

------------------------------------------------------------------------

## PHASE 1 --- 2.5D Design Studio Specification

**Goal:** Design the final architecture before coding.

Tasks: - study the workflow patterns of Nastix Design, Tailornova and
DIYO - define original FashionForge UI - define component data
architecture - define 2.5D renderer - define front/back architecture -
define technical flat architecture - define state model - define
compatibility rules - define material system - define visual acceptance
criteria

Output:

``` text
FASHIONFORGE_2_5D_SPEC.md
```

**Do not implement the complete system in this phase.**

------------------------------------------------------------------------

## PHASE 2 --- Design-System Foundation

Build:

-   typography
-   spacing
-   design tokens
-   panels
-   buttons
-   cards
-   visual selectors
-   swatches
-   tabs
-   active states
-   preview workspace
-   toolbar
-   responsive structure

Acceptance: the Design Studio already looks professional before complex
rendering is added.

------------------------------------------------------------------------

## PHASE 3 --- Visual Component Library

Build structured definitions for:

-   garment bases
-   silhouettes
-   tops
-   bottoms
-   sleeves
-   necklines
-   details
-   materials
-   patterns

Each should have identity, display name, category, visual geometry,
compatibility, price and technical representation.

Acceptance: components are composable rather than independent flat
pictures.

------------------------------------------------------------------------

## PHASE 4 --- 2.5D Rendering Engine

Build the renderer.

**Critical rule:** start with only:

``` text
1 professional croquis
+
1 garment
+
1 fabric
+
1 colour
+
1 pattern
+
lighting/depth
+
front/back
```

Do not build the whole library first.

Acceptance: - correct proportions - convincing depth - fabric
treatment - highlights/shadows - seams/folds - clean croquis
integration - no accidental overlaps

If the first garment is not visually professional, stop and refine
before expanding.

------------------------------------------------------------------------

## PHASE 5 --- Visual Controls

Add:

-   silhouette cards
-   component cards
-   neckline cards
-   sleeve cards
-   colour swatches
-   fabric swatches
-   pattern thumbnails
-   detail controls
-   front/back
-   zoom
-   pan
-   reset
-   undo
-   redo

Acceptance: every selection updates the correct visual state
immediately.

------------------------------------------------------------------------

## PHASE 6 --- Technical Fashion Output

Build:

1.  2.5D preview
2.  technical flat front
3.  technical flat back
4.  garment specifications
5.  Tech Pack Lite

Acceptance: view switching preserves the complete design state.

------------------------------------------------------------------------

## PHASE 7 --- Rule-Based Fashion Intelligence

Build:

-   recommendation rules
-   explanation text
-   compatibility warnings
-   optional improvement suggestions

Acceptance: every recommendation is traceable to an IF/THEN rule.

------------------------------------------------------------------------

## PHASE 8 --- Design Management

Build:

-   save
-   open
-   rename
-   duplicate
-   delete
-   notes
-   version
-   timestamps
-   My Designs

Acceptance: saved designs reopen with the same complete state.

------------------------------------------------------------------------

## PHASE 9 --- Pricing

Build centralized pricing for:

-   base garment
-   fabric
-   components
-   details
-   patterns

Acceptance: all cost-bearing selections update the total correctly.

------------------------------------------------------------------------

## PHASE 10 --- Backend + MongoDB

Build:

-   Express routes
-   MongoDB connection
-   models
-   design CRUD
-   component endpoints
-   validation
-   error handling

Acceptance: frontend can create/read/update/delete designs through the
API.

------------------------------------------------------------------------

## PHASE 11 --- Authentication

Build:

-   registration
-   login
-   password hashing
-   token/session strategy
-   protected operations

Acceptance: guests can design; authenticated users can save/manage
designs.

------------------------------------------------------------------------

## PHASE 12 --- Cart

Build:

-   add to cart
-   remove
-   quantity if appropriate
-   price summary
-   design summary

Acceptance: correct design and price reach cart.

------------------------------------------------------------------------

## PHASE 13 --- Checkout

Build:

-   customer details
-   order summary
-   design summary
-   total
-   validation

Acceptance: valid cart can proceed to simulated payment.

------------------------------------------------------------------------

## PHASE 14 --- Payment Simulation

Build:

-   simulated payment form
-   processing state
-   success/failure state
-   payment status

Acceptance: payment result is deterministic and recorded.

------------------------------------------------------------------------

## PHASE 15 --- Orders and Tracking

Build:

-   order creation
-   confirmation
-   order ID
-   payment status
-   order status
-   simple tracking timeline

Acceptance: completed simulated checkout creates a persistent order.

------------------------------------------------------------------------

## PHASE 16 --- Full Integration

Connect:

``` text
Home
 ↓
Design Studio
 ↓
Customize
 ↓
2.5D Preview
 ↓
Technical Output
 ↓
Save
 ↓
My Designs
 ↓
Cart
 ↓
Checkout
 ↓
Payment Simulation
 ↓
Order Confirmation
 ↓
Tracking
```

Acceptance: no broken state transitions.

------------------------------------------------------------------------

## PHASE 17 --- Testing and Debugging

Test:

-   UI
-   component selection
-   front/back
-   material
-   colour
-   pattern
-   rendering
-   technical sketch
-   specifications
-   recommendations
-   pricing
-   save/load
-   authentication
-   cart
-   checkout
-   payment
-   orders
-   responsive layout
-   browser compatibility

Required checks:

``` text
node --check frontend/js/app.js
node --check backend/server.js
git diff --check
```

Also perform real browser validation.

------------------------------------------------------------------------

## PHASE 18 --- Visual / UX Refinement

Refine:

-   spacing
-   typography
-   visual hierarchy
-   preview scale
-   panel proportions
-   hover states
-   active states
-   empty states
-   loading states
-   error states
-   responsiveness
-   accessibility
-   terminology consistency

Do not add random effects.

------------------------------------------------------------------------

## PHASE 19 --- Documentation

Complete:

-   README
-   architecture
-   database schema
-   API documentation
-   feature documentation
-   testing documentation
-   design decisions
-   limitations
-   future scope

------------------------------------------------------------------------

## PHASE 20 --- Viva / Presentation Preparation

Be able to explain:

-   problem statement
-   motivation
-   target users
-   architecture
-   frontend
-   backend
-   MongoDB
-   SVG rendering
-   2.5D approach
-   why real 3D was not used
-   material system
-   technical flat system
-   rule-based recommendation
-   pricing
-   authentication
-   order flow
-   limitations
-   future improvements

FashionForge should be described accurately as a **2.5D interactive
fashion-design application**, not a real 3D clothing simulator.

------------------------------------------------------------------------

# 27. Antigravity Operating Rules

Antigravity is the primary development agent for major implementation
phases.

For every phase:

1.  Read this document completely.
2.  Read `PROJECT_PLAN.md` completely.
3.  Inspect the current repository before editing.
4.  Understand the existing architecture.
5.  Preserve working functionality unless the phase explicitly replaces
    it.
6.  Prefer centralized data/configuration.
7.  Keep rendering logic centralized.
8.  Test after meaningful changes.
9.  Use browser validation for visual/UI work.
10. Never claim visual success without inspecting the browser result.
11. Stop and refine if the core visual result is poor.
12. Do not silently expand scope.
13. Never introduce true 3D.
14. Never introduce AI garment generation.
15. Do not replace the professional croquis with a custom mannequin.
16. Do not use raster garment images as the primary rendering system.
17. Keep the project understandable for a final-year viva.
18. Commit only after validation.

------------------------------------------------------------------------

# 28. Critical 2.5D Development Rule

Do not ask the agent to build the complete new 2.5D system in one giant
operation.

Correct sequence:

``` text
Specification
      ↓
Design system
      ↓
ONE beautiful garment
      ↓
Visual validation
      ↓
Refine
      ↓
Expand component library
      ↓
Technical output
      ↓
Business logic
```

The first single garment is the critical checkpoint.

------------------------------------------------------------------------

# 29. Visual Acceptance Standard

Technical correctness alone is insufficient.

The garment must:

-   sit correctly on the croquis
-   have believable depth
-   have coherent lighting
-   have material-specific appearance
-   avoid accidental overlaps
-   avoid geometry collisions
-   have clean edges
-   show intentional construction details
-   look like a designed garment rather than disconnected SVG pieces

------------------------------------------------------------------------

# 30. Git Strategy

Use meaningful commits such as:

``` text
docs: add FashionForge master project plan
design: define 2.5D studio architecture
design: build visual design system
feat: add 2.5D garment renderer
feat: add fabric material system
feat: add technical flat views
feat: add design management
feat: add pricing engine
feat: add MongoDB design persistence
feat: add authentication
feat: add cart and checkout
test: validate complete design workflow
docs: finalize project documentation
```

Avoid one giant undocumented commit.

------------------------------------------------------------------------

# 31. Final Definition of Done

FashionForge is complete when:

-   home page is polished
-   Design Studio is professional
-   professional croquis is used
-   visual component selection works
-   2.5D garment rendering works
-   fabric/colour/pattern work
-   front/back works
-   technical flats work
-   garment specifications work
-   Tech Pack Lite works
-   rule-based recommendations work
-   pricing works
-   designs can be saved
-   My Designs works
-   authentication works
-   cart works
-   checkout works
-   simulated payment works
-   orders work
-   tracking works
-   responsive UI works
-   browser testing passes
-   backend/database integration works
-   documentation is complete
-   project is demonstrable in a final-year viva

------------------------------------------------------------------------

# 32. Product Priority

``` text
VISUAL QUALITY
      ↓
DESIGN STUDIO FUNCTIONALITY
      ↓
TECHNICAL OUTPUT
      ↓
DATA / PERSISTENCE
      ↓
COMMERCE
```

Do not sacrifice Design Studio quality to finish secondary commerce
features faster.

FashionForge should first feel like a professional **digital fashion
design studio**, and only then like a shopping application.

------------------------------------------------------------------------

# 33. Immediate Next Action

The next Antigravity task is **not** to build the complete application.

It must:

1.  Read `FASHIONFORGE_MASTER_PROJECT_PLAN.md` completely.
2.  Read `PROJECT_PLAN.md` completely.
3.  Inspect the repository.
4.  Inspect the current Design Studio.
5.  Inspect the current assets and visual problems.
6.  Produce `FASHIONFORGE_2_5D_SPEC.md`.
7.  Do not modify the production implementation yet.
8.  Do not delete useful project infrastructure yet.
9.  Wait for review before implementing the new 2.5D renderer.

After the specification is approved, implementation begins with **one
professional garment rendered in 2.5D**.
