# FashionForge — Comprehensive Viva Voce Questions & Answers Guide

This document is prepared for final-year engineering / computer science project viva voce examinations, technical audits, and defense presentations for **FashionForge**.

---

## Category 1: Project Motivation & Domain Context

### Q1: What is FashionForge, and what core real-world problem does it solve?
**Answer:**  
FashionForge is a digital atelier web platform bridging bespoke fashion design and automated manufacturing estimation. In traditional fashion e-commerce, customers are limited to static catalog images of mass-produced apparel, while bespoke tailoring requires tedious manual consultations with slow turnaround times. FashionForge provides an interactive real-time 2.5D visual design studio where users customize garments directly on anatomical figures, instantly view accurate Bill of Materials (BOM) pricing, export CAD-standard technical flats and tech packs, and carry the bespoke item directly through bag, checkout, simulated payment, and simulated post-order manufacturing tracking.

### Q2: Why did you choose a 2.5D layered rendering engine rather than a heavy 3D framework like Three.js / WebGL?
**Answer:**  
1. **Performance & Instant Load Times:** Three.js and WebGL 3D meshes require downloading megabytes of polygon geometry and texture maps, straining mobile bandwidth and causing high device battery drain.
2. **Fashion Industry Conformity:** Fashion pattern makers, ateliers, and apparel tech pack creators work primarily in orthographic projections and 2.5D layered flats (front/back/silhouette/seam).
3. **Determinism & Vector Precision:** Using the HTML5 2D Canvas API with mathematical vector anchor paths provides pixel-crisp rendering, instant recoloring via HSL blending, sub-millisecond layer compositing, and easy vector/SVG export for manufacturing technical flats.

---

## Category 2: Architecture & Technology Stack

### Q3: Explain the high-level architecture of FashionForge.
**Answer:**  
FashionForge follows a decoupled client-server architectural pattern:
- **Client (Frontend):** Modern vanilla HTML5 semantic structures, a tokenized CSS custom-property design system, and ES6+ modular JavaScript. It incorporates a Progressive Web App (PWA) layer with service workers for caching and offline fallback.
- **Application Server (Backend):** Node.js and Express RESTful API with modular separation into routers (`/api/auth`, `/api/designs`, `/api/cart`, `/api/orders`), controllers, middleware (JWT verification, CORS, error handling), and schema models.
- **Database Layer:** MongoDB with Mongoose ODM, utilizing typed schemas, strict field validation, compound indexes for user-scoping, and pre-save lifecycle hooks.

### Q4: Why did you avoid frontend frameworks like React, Vue, or Angular?
**Answer:**  
Building with vanilla ES6+ modules and native Web APIs:
1. Avoids framework build-step overhead, runtime bloat, and dependency churn.
2. Demonstrates deep mastery of foundational web technologies: Document Object Model (DOM), Canvas 2D API, Fetch API, LocalStorage/SessionStorage, and Service Worker lifecycle.
3. Guarantees ultra-fast First Contentful Paint (FCP) and near-zero runtime framework overhead.

---

## Category 3: Canvas Rendering & Design Studio

### Q5: How does the 2.5D canvas rendering pipeline work internally?
**Answer:**  
The rendering pipeline implements the **Painter's Algorithm** (back-to-front rendering) on an 800×1000 viewport:
1. **Background & Lighting:** Soft gradient backdrop with studio vignette.
2. **Anatomical Base (Croquis):** Vector-defined silhouettes for Male or Female proportions with anatomical anchor points (shoulders, chest, waist, hips).
3. **Bottom Garment:** Trousers, skirts, or shorts rendered with crease shading.
4. **Top Garment Silhouette:** Bodice, blazer torso, shirt, or dress base.
5. **Sleeve Geometry:** Sleeves dynamically aligned to shoulder pivot points (sleeveless, short, 3/4, or long).
6. **Collar & Neckline:** Notch lapels, mandarin collars, crew necks, or v-necks overlaid at the cervical collar anchor.
7. **Fabric Shading & Texture:** Pattern synthesis applied through canvas pattern fills combined with HSL lightness offsets (`source-atop` compositing) to preserve realistic shadow and highlight curves.
8. **Accent Lines & Hardware:** Seams, topstitching, pocket flaps, and buttons rendered as vector stroke paths.

### Q6: What is a Tech Pack, and how does FashionForge generate it?
**Answer:**  
A **Tech Pack (Technical Package)** is an apparel industry blueprint containing all technical specifications needed by an atelier or garment factory to cut and sew a design. FashionForge synthesizes:
- High-resolution SVG / orthographic CAD line drawing (Technical Flat).
- Anatomical measurements and target sizing table.
- Exact fabric specifications (fiber composition, weave, color hex code).
- Itemized Bill of Materials (BOM) with consumption values and cost breakdown.
- Recommended care and pressing instructions.

---

## Category 4: Pricing Model & Bill of Materials (BOM)

### Q7: How is garment pricing calculated dynamically?
**Answer:**  
Pricing is computed parametrically:
$$\text{Total Price} = \text{Base Price} + (\text{Fabric Cost} \times \text{Consumption Factor}) + \text{Detail Adders} + \text{Hardware Charges}$$
- **Base Fee:** Derived from garment pattern complexity (e.g., Blazer base ₹1200, Shirt base ₹800).
- **Fabric Multiplier:** Silk (1.6×), Cashmere (1.8×), Wool (1.4×), Linen (1.2×), Cotton (1.0×).
- **Detail Adders:** Notch lapel (+₹150), French cuffs (+₹100), contrast lining (+₹200).
- **Authoritative Validation:** The client calculates BOM live for immediate UX feedback, but upon checkout, the backend recalculates and verifies every item independently to prevent client-side price tampering.

---

## Category 5: Authentication & Security

### Q8: How is authentication handled, and how are user designs protected?
**Answer:**  
- **Registration & Passwords:** Passwords are hashed using `bcrypt` with 10 salt rounds before storage in MongoDB; plain-text passwords never touch the database.
- **Stateless Tokens:** Successful login issues a signed JSON Web Token (JWT) with an expiration window and claims (`userId`, `email`).
- **Authorization Middleware (`authMiddleware.js`):** Intercepts requests, validates the Bearer token signature, and attaches `req.user`.
- **Strict Ownership Scoping:** All design CRUD (`GET`, `PUT`, `DELETE` on `/api/designs`), cart operations (`/api/cart`), and orders (`/api/orders`) enforce `userId: req.user.userId`. Users cannot view, modify, or delete another user's creations or transactions.

---

## Category 6: Shopping Workflow & Payment Simulation

### Q9: Describe the end-to-end shopping workflow from design to tracking.
**Answer:**  
1. **Design Studio:** User customizes garment silhouette, sleeves, collar, fabric, and color on croquis.
2. **Save Design:** Persists the custom configuration to MongoDB under user's account.
3. **Add to Bag:** Design configuration snapshot is transferred into user's persistent Cart document.
4. **Customer Bag:** User reviews quantity, itemized BOM pricing, subtotal, and can update or remove items.
5. **Checkout:** Multi-step form captures shipping and recipient details with client and server validation.
6. **Payment Simulation:** Realistic sandbox payment gateway interface allowing simulation of both approval (`success`) and decline (`failure`).
   - If payment fails: The order status transitions to `failed`, but the user's bag remains intact for retry.
   - If payment succeeds: The order status transitions to `paid` (`Placed`), and the user's bag is automatically emptied.
7. **Order Confirmation & Tracking:** Generates a persistent order record with full tracking timeline milestones (`Placed` &rarr; `Pattern Cutting` &rarr; `Tailoring` &rarr; `Quality Inspection` &rarr; `Dispatched` &rarr; `Delivered`).

---

## Category 7: Progressive Web App (PWA) & Responsive Design

### Q10: How did you implement PWA capabilities, and how does offline support work?
**Answer:**  
- **Manifest (`manifest.webmanifest`):** Declares application name, theme color (`#b96b61`), display mode (`standalone`), start URL, and standard + maskable icons (192×192 and 512×512) for home screen installation.
- **Service Worker (`service-worker.js`):** Implements versioned cache management (`fashionforge-v1.0.0`). Static assets are served via a Cache-First strategy with network fallback.
- **API Exemption:** `/api/*` endpoints strictly bypass the cache to ensure real-time consistency and prevent storing sensitive user data.
- **Offline Fallback (`offline.html`):** When the browser loses network connectivity and a navigation request fails, the service worker intercepts the failure and presents a branded offline recovery page.

### Q11: How did you ensure responsive design across diverse viewports?
**Answer:**  
- Fluid CSS grid and flexbox layouts with standard breakpoints (Desktop: 1440px/1280px, Tablet: 1024px/768px, Mobile: 480px/375px).
- Strict separation of page shells: content pages use `.app-page-body` and `.app-page-shell` allowing natural document scrolling (`overflow-y: auto`), while only `design.html` uses constrained viewport panels (`studio-app-body`).
- Automated headless browser tests verify `document.documentElement.scrollWidth <= window.innerWidth` across all 6 target screen widths with zero horizontal overflow.

---

## Category 8: Testing & Quality Assurance

### Q12: How is the system tested and validated?
**Answer:**  
FashionForge includes a comprehensive multi-layered automated test suite:
- **Backend Unit & Integration Tests:** Node.js native test runner testing API endpoints, JWT authentication, user scoping, cart mutations, BOM recalculation, and order state machines.
- **PWA & UI Integrity Tests (`test_ui_pwa.js`):** Verifies manifest JSON validity, service worker syntax and lifecycle methods, offline fallback file presence, and icon dimension conformity.
- **End-to-End Headless Browser Tests (`test_browser_responsive_pwa.cjs`):** Puppeteer suite executing the entire user lifecycle across 6 screen sizes, verifying zero horizontal overflow, marketing header isolation, cart additions, checkout submission, payment simulation transitions, and order tracking timeline rendering.
