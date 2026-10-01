# FashionForge — Technical Viva Voce Notes & System Architecture

**Project:** FashionForge — Interactive Digital Costume Design Studio & Atelier Platform  
**Target Domain:** Fashion Tech / Computer Graphics / Full-Stack Web Architecture / PWA  
**Stack:** Vanilla HTML5 / CSS3 / ES6+ JavaScript, Node.js, Express, MongoDB (Mongoose), PWA (Service Workers, Web App Manifest)

---

## 1. Executive Summary & Problem Statement

FashionForge is an end-to-end interactive digital costume design and bespoke garment crafting platform. Traditional e-commerce fashion interfaces treat clothing as pre-rendered static inventory catalog items. In contrast, FashionForge operates as an **interactive atelier**:
1. Users visually design garments in real time on calibrated anatomical croquis figures (Male and Female).
2. The custom rendering engine dynamically composites anatomical figures, silhouettes, sleeve styles, collars, fabrics, textures, and curated palette colors using 2.5D layered canvas projection.
3. Every custom configuration generates a live dynamic **Bill of Materials (BOM)** calculating manufacturing cost, fabric consumption, and retail pricing in real time.
4. Users can export **Technical Flat (vector line CAD)** and **Comprehensive Tech Packs** (measurements, care guides, BOM breakdown, design specifications).
5. The platform supports an authenticated end-to-end order flow: Design Studio &rarr; Saved Designs &rarr; Customer Bag &rarr; Multi-Step Checkout &rarr; Payment Simulation Sandbox &rarr; Order Confirmation &rarr; Order History & Order Tracking.
6. The frontend is built as an installable **Progressive Web App (PWA)** featuring offline resilience, versioned cache policies, and responsive layouts across all screen form factors.

---

## 2. Architectural Overview

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  Vanilla ES6+ JS | CSS Custom Properties Design Tokens | HTML5 Semantic Shells   |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |   Design Studio    |  |  Technical CAD Flat  |  |         Tech Pack         |  |
|  | Layered 2.5D Canvas|  | 2D Orthographic Path |  | Specification & BOM Sheet |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |   Customer Bag     |  | Multi-Step Checkout  |  | Payment Simulation Sandbox|  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|                                                                                   |
|  +-------------------------------------+  +------------------------------------+  |
|  |     Order Confirmation & History    |  |     Simulated Order Tracking       |  |
|  +-------------------------------------+  +------------------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |               PWA Layer: service-worker.js + manifest.webmanifest          |  |
|  |               Offline Fallback (/offline.html) + Versioned Cache            |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           | Fetch API / JSON / Bearer JWT
                                           v
+-----------------------------------------------------------------------------------+
|                                  BACKEND LAYER                                    |
|                       Node.js (v18+) + Express REST API                           |
|                                                                                   |
|  [Security Middleware]  cors, helmet/headers, JWT authentication, error handler   |
|  [Static Middleware]    PWA assets, icons, frontend static file serving           |
|                                                                                   |
|  +------------------+  +-------------------+  +---------------+  +-------------+  |
|  |  /api/auth/*     |  |  /api/designs/*   |  |  /api/cart/*  |  | /api/orders |  |
|  | Register, Login, |  | CRUD Designs,     |  | Get, Add,     |  | Checkout,   |  |
|  | Profile          |  | Ownership filter  |  | Update, Clear |  | Sim Pay, Trk|  |
|  +------------------+  +-------------------+  +---------------+  +-------------+  |
+------------------------------------------+----------------------------------------+
                                           | Mongoose ODM (Strict Schemas)
                                           v
+-----------------------------------------------------------------------------------+
|                                 DATABASE LAYER                                    |
|                                    MongoDB                                        |
|                                                                                   |
|  Collections:                                                                     |
|  - `users`: userId, email (unique/lowercased), passwordHash (bcrypt), name        |
|  - `designs`: designId, userId (owner ref), garment specs, BOM pricing, snapshot  |
|  - `carts`: userId (unique), items [{ designId, quantity, addedAt }], active      |
|  - `orders`: orderId, userId, items, shippingAddress, paymentStatus, tracking     |
+-----------------------------------------------------------------------------------+
```

---

## 3. Core Engine Deep-Dive: 2.5D Garment Rendering Engine

### The Coordinate System & Anatomical Calibration
- **Canvas Resolution:** 800 × 1000 pixels (aspect ratio 4:5, optimal portrait fashion ratio).
- **Croquis Figures:** Mathematically plotted vector paths representing 9-head fashion illustration proportions for Male and Female figures.
- **Layer Stacking Order (Painter's Algorithm):**
  1. **Background Layer:** Studio backdrop gradient / lighting vignette.
  2. **Anatomical Base (Croquis):** Skin tone, contours, anatomical landmarks (acromion, sternum, waist, hips).
  3. **Undergarments / Bottom Base:** Trousers, skirts, or inner lining paths.
  4. **Primary Garment Silhouette:** Bodice, blazer body, shirt torso, or dress silhouette.
  5. **Sleeve Attachments:** Left and right sleeves positioned at shoulder pivot coordinates.
  6. **Neckline / Collar Overlay:** Lapels, mandarin collars, crew necks, or notch collars.
  7. **Fabric Shading & Texture Synthesis:** Procedural weave/grain patterns applied via canvas pattern fills and semi-transparent alpha overlays (`ctx.globalCompositeOperation = 'source-atop'`).
  8. **Structural Details & Highlights:** Seams, topstitching, buttonholes, pocket flaps, and directional lighting highlights.

### Real-Time Colorimetric Shading
Fabric color is dynamically modulated across highlights, midtones, and shadows using HSL color manipulation:
- **Specular Highlight:** `Luminance + 18%` with low opacity white overlay.
- **Crease / Fold Shadows:** `Luminance - 22%` using soft Gaussian blur or gradient stops along calibrated seam paths.

---

## 4. Dynamic Bill of Materials (BOM) & Pricing Calculation

Rather than hardcoded static price tiers, FashionForge uses an industrial-style parametric BOM pricing formula:

$$\text{Total Price} = \text{Base Garment Fee} + \text{Fabric Cost} + \text{Detail Adders} + \text{Surcharge (Size/Hardware)}$$

1. **Base Garment Fee:** Calibrated to garment type complexity (e.g., Blazer: ₹1200, Shirt: ₹800, Trouser: ₹900, Dress: ₹1400).
2. **Fabric Consumption & Multiplier:**
   - Silk / Cashmere: High-grade multiplier (1.6×).
   - Linen / Wool: Mid-grade multiplier (1.3×).
   - Cotton / Denim: Standard baseline multiplier (1.0×).
3. **Hardware & Accent Adders:**
   - Lapel collar / double-breasted buttons (+₹150).
   - Contrast topstitching / French cuffs (+₹100).
4. **Calculated in Milliseconds:** Rendered live on the client via `pricing.js` and verified authoritatively on the backend upon cart addition and checkout creation.

---

## 5. Security & Authentication Architecture

1. **Password Protection:** Passwords are never stored in plain text. Hashed using `bcrypt` (salt rounds = 10).
2. **Stateless JWT Sessions:** JSON Web Tokens signed with HS256 using a server-side secret (`JWT_SECRET`).
3. **Strict Resource Ownership:**
   - `GET /api/designs` filters strictly by the authenticated `req.user.userId`.
   - `PUT /api/designs/:id` and `DELETE /api/designs/:id` verify ownership before executing any database mutation.
   - `GET /api/cart` and `POST /api/cart/items` strictly bind to `req.user.userId`.
   - Orders are strictly scoped to the purchasing user; users cannot query or track other users' orders.
4. **Input Sanitization & Normalization:**
   - Email addresses are trimmed and lowercased before queries and insertions.
   - Numeric quantities in cart and prices in orders are clamped and type-checked against tampering.

---

## 6. Progressive Web App (PWA) Implementation

1. **Manifest File (`frontend/manifest.webmanifest`):**
   - Declares name, short_name, theme color (`#b96b61`), background color (`#faf8f5`), standalone display, and standard + maskable icon sets (192×192 and 512×512 PNGs).
2. **Service Worker (`frontend/service-worker.js`):**
   - **Cache Strategy:** Cache-First for static assets (HTML, CSS, JS, icons, fonts) paired with Network fallback.
   - **Dynamic Versioning:** Cache key `fashionforge-v1.0.0`; on activation (`activate` event), all outdated caches are purged automatically via `caches.delete()`.
   - **Immediate Control:** Uses `self.skipWaiting()` on install and `clients.claim()` on activation.
   - **Private API Bypass:** Network requests targeting `/api/*` bypass the service worker cache completely, preventing stale or leaked private user data.
   - **Offline Fallback:** If a navigation request fails while offline, the service worker catches the network error and serves `frontend/offline.html`.

---

## 7. Database Schemas (MongoDB / Mongoose)

- **`User`**: `userId` (UUID), `name` (String), `email` (String, unique, lowercase), `passwordHash` (String), timestamps.
- **`Design`**: `designId` (UUID), `userId` (UUID), `name` (String), `figure` (Enum), `top` (String), `bottom` (String), `sleeves` (String), `collar` (String), `fabric` (String), `colour` (Hex), `price` (Number), `snapshot` (Base64/SVG preview), timestamps.
- **`Cart`**: `userId` (UUID, unique index), `items` [ { `designId` (UUID), `quantity` (Number), `addedAt` (Date) } ], `updatedAt`.
- **`Order`**: `orderId` (UUID), `userId` (UUID), `items` [ ... ], `shippingAddress` { `name`, `email`, `phone`, `address`, `city`, `state`, `postalCode` }, `subtotal` (Number), `tax` (Number), `shipping` (Number), `total` (Number), `paymentStatus` (Enum: `pending`, `success`, `failed`), `orderStatus` (Enum: `Placed`, `Pattern Cutting`, `Tailoring`, `Quality Inspection`, `Dispatched`, `Delivered`), `trackingTimeline` [ { `status`, `timestamp`, `note` } ], timestamps.
