# FashionForge — Interactive Digital Costume Design Studio & Atelier

FashionForge is an end-to-end interactive digital costume design studio and bespoke fashion platform. It bridges the gap between artistic fashion design, parametric manufacturing estimation (Bill of Materials), and direct consumer ordering.

---

## Key Features

- **2.5D Layered Canvas Studio:** Custom rendering engine for real-time garment visualization with male and female croquis figures, neckline/collar variations, sleeve styles, fabric textures, and dynamic HSL color blending.
- **Dynamic Bill of Materials (BOM):** Real-time parametric cost calculation based on garment complexity, fabric multipliers, and bespoke hardware accents.
- **CAD & Specification Export:** High-precision orthographic 2D Technical Flat rendering and comprehensive industry-standard Tech Pack generation (specifications, measurements, care guides, and BOM).
- **End-to-End Bespoke Ordering:**
  - Save / Load / Update designs with MongoDB persistence.
  - Customer Bag with real-time quantity and BOM adjustments.
  - Multi-step checkout with recipient validation.
  - Realistic Payment Simulation Sandbox with instant approval/decline state handling.
  - Order Confirmation with unique order tracking reference.
  - My Orders history and simulated multi-stage manufacturing & delivery tracking (`Placed` &rarr; `Pattern Cutting` &rarr; `Tailoring` &rarr; `Quality Inspection` &rarr; `Dispatched` &rarr; `Delivered`).
- **Progressive Web App (PWA):**
  - Installable home screen app with `manifest.webmanifest`.
  - Service worker with versioned cache management (`fashionforge-v1.0.0`).
  - Offline fallback experience (`/offline.html`).
  - Standard & maskable icons (192×192 and 512×512).
- **Responsive Haute Couture Design System:**
  - Curated luxury editorial palette (`#faf8f5`, `#1d1918`, `#b96b61`, `#c59b27`).
  - Responsive layouts tested across 1440px, 1280px, 1024px, 768px, 480px, and 375px viewports with zero horizontal overflow.
  - Distinct marketing header on Home and dedicated workflow headers across internal application tools.

---

## Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Vanilla HTML5, CSS3 Custom Properties (Design Tokens), Modular ES6+ JavaScript |
| **Graphics** | HTML5 2D Canvas API (Painter's Algorithm, HSL color compositing, vector CAD paths) |
| **PWA** | Service Worker API (Cache-First with Network fallback), Web App Manifest |
| **Backend** | Node.js (v18+), Express REST API |
| **Database** | MongoDB with Mongoose ODM (Strict schemas, compound indexes) |
| **Authentication** | Stateless JWT (JSON Web Tokens) with `bcrypt` password hashing |
| **Testing** | Node.js native test runner + Puppeteer headless browser E2E test suite |

---

## Directory Structure

```
FashionForge/
├── backend/
│   ├── config/              # Database connection & environment configuration
│   ├── controllers/         # REST API business logic (auth, designs, cart, orders)
│   ├── middleware/          # JWT auth, error handling, static serving
│   ├── models/              # Mongoose database models (User, Design, Cart, Order)
│   ├── routes/              # Express API route declarations
│   └── server.js            # Express server initialization & PWA route endpoints
├── frontend/
│   ├── assets/              # SVG illustrations, textures, and PWA icon sets
│   ├── css/                 # Comprehensive bespoke design system (style.css)
│   ├── js/                  # ES6+ modular client controllers and services
│   │   ├── services/        # auth-service, cart-service, pwa, auth-nav
│   │   ├── app.js           # Design Studio coordinator
│   │   ├── canvas-view.js   # 2.5D Canvas rendering engine
│   │   ├── flat-view.js     # 2D Orthographic CAD flat renderer
│   │   ├── techpack-view.js # Specification & BOM Tech Pack generator
│   │   ├── cart.js          # Customer Bag controller
│   │   ├── checkout.js      # Multi-step checkout controller
│   │   ├── payment.js       # Payment simulation sandbox controller
│   │   ├── confirmation.js  # Order confirmation controller
│   │   ├── orders.js        # Order history controller
│   │   └── tracking.js      # Order tracking timeline controller
│   ├── index.html           # Marketing Home page
│   ├── design.html          # Interactive Design Studio
│   ├── cart.html            # Customer Bag
│   ├── checkout.html        # Checkout
│   ├── payment.html         # Payment Simulation Sandbox
│   ├── order-confirmation.html # Order Confirmation
│   ├── orders.html          # Order History
│   ├── order-details.html   # Order Details & Tracking Timeline
│   ├── my-designs.html      # Saved Designs Gallery
│   ├── login.html           # Authentication (Sign In / Register)
│   ├── offline.html         # PWA Offline Fallback
│   ├── manifest.webmanifest # PWA Web App Manifest
│   └── service-worker.js    # PWA Service Worker (Cache & Offline)
├── docs/
│   ├── VIVA_NOTES.md        # Technical viva voce notes & system architecture
│   └── VIVA_QA.md           # Comprehensive viva examination Q&A guide
└── tests/                   # Automated unit, integration, and browser E2E suites
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance running locally (default: `mongodb://127.0.0.1:27017/fashionforge`)

### Installation & Execution

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Ensure a `.env` file exists with:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/fashionforge
   JWT_SECRET=fashionforge_jwt_secret_dev
   ```

3. **Start the backend server:**
   ```bash
   npm start
   ```
   Open `http://localhost:5000` in your web browser.

---

## Running Automated Tests

Run the complete test suite (314 unit, API, and PWA integrity tests):
```bash
npm test
```

Run the end-to-end multi-viewport browser QA test suite:
```bash
node tests/test_browser_responsive_pwa.cjs
```

---

## Academic Documentation

For viva voce examination preparation and technical defense:
- **Architecture & System Deep-Dive:** [docs/VIVA_NOTES.md](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/docs/VIVA_NOTES.md)
- **Comprehensive Viva Questions & Answers:** [docs/VIVA_QA.md](file:///c:/Users/Angel.ENOCH/Project%20Folder/FashionForge/docs/VIVA_QA.md)