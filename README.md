# FashionForge — Interactive Digital Fashion Design Studio

FashionForge is a full-stack interactive fashion design platform. It lets customers design garments on a 2.5D canvas studio, review a real-time Bill of Materials, save designs, and place orders with UPI or Cash on Delivery.

---

## Features

- **2.5D Design Studio** — Real-time garment visualization on male and female croquis figures. Customize necklines, collars, sleeve styles, fabric textures, and HSL color blending using an HTML5 Canvas rendering engine.
- **Dynamic Bill of Materials (BOM)** — Parametric cost estimation based on garment complexity, fabric type, and hardware accents, recalculated on every design change.
- **CAD Export** — 2D orthographic technical flat view and full Tech Pack generation (measurements, specifications, care guide, BOM).
- **End-to-End Order Flow:**
  - Save, load, and update designs with MongoDB persistence.
  - Shopping Bag with quantity management and real-time BOM recalculation.
  - Multi-step checkout with delivery address validation.
  - **Payment Page:** UPI QR code (scan with PhonePe, Google Pay, Paytm, BHIM) and Cash on Delivery.
  - Order Confirmation with a unique tracking reference.
  - Order History and multi-stage manufacturing/delivery tracking.
- **Progressive Web App (PWA)** — Installable, with service worker caching and offline fallback.
- **Responsive Design** — Tested across 1440px, 1280px, 1024px, 768px, 480px, and 375px viewports.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Vanilla HTML5, CSS3 Custom Properties, Modular ES6+ JavaScript |
| **Graphics** | HTML5 2D Canvas API (HSL compositing, vector paths, painter''s algorithm) |
| **Payment** | UPI QR (static merchant QR image) + Cash on Delivery |
| **PWA** | Service Worker (Cache-First + Network fallback), Web App Manifest |
| **Backend** | Node.js (v18+), Express REST API |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | Stateless JWT with bcrypt password hashing |
| **Testing** | Node.js native test runner + Puppeteer browser E2E suite |

---

## Directory Structure

``````
FashionForge/
├── backend/
│   ├── config/              # Database connection (db.js)
│   ├── controllers/         # Business logic — auth, designs, cart, orders, payment
│   ├── middleware/          # JWT auth, error handler, design validation
│   ├── models/              # Mongoose models — User, Design, Cart, Order
│   ├── routes/              # Express route declarations
│   ├── services/            # upiService.js — UPI merchant config
│   └── server.js            # Express app entry point, static serving, PWA routes
├── frontend/
│   ├── assets/
│   │   ├── icons/           # PWA icons (192px, 512px, maskable)
│   │   ├── images/          # upi-qr.png — merchant UPI QR code
│   │   ├── models/          # Male/Female croquis model images (XS–4XL)
│   │   └── svg/             # SVG garment part overlays
│   ├── css/
│   │   └── style.css        # Full design system — tokens, layout, components
│   ├── js/
│   │   ├── renderer/        # 2.5D canvas engine (geometry, materials, lighting)
│   │   ├── services/        # auth-service, cart-service, design-storage, pwa
│   │   ├── app.js           # Design Studio coordinator
│   │   ├── payment.js       # Payment page controller
│   │   ├── cart.js          # Shopping Bag controller
│   │   ├── checkout.js      # Checkout flow controller
│   │   └── ...              # order-confirmation, order-details, orders, my-designs
│   ├── index.html           # Home page
│   ├── design.html          # Design Studio
│   ├── cart.html            # Shopping Bag
│   ├── checkout.html        # Checkout
│   ├── payment.html         # Payment (UPI QR + COD)
│   ├── order-confirmation.html
│   ├── orders.html
│   ├── order-details.html
│   ├── my-designs.html
│   ├── login.html
│   ├── offline.html         # PWA offline fallback
│   ├── manifest.webmanifest # PWA manifest
│   └── service-worker.js
├── docs/
│   ├── DEPLOYMENT.md        # Deployment guide (Render + MongoDB Atlas)
│   ├── VIVA_NOTES.md        # Technical architecture notes
│   ├── VIVA_QA.md           # Viva voce Q&A reference
│   └── archive/             # Development planning documents (not required at runtime)
├── scripts/
│   └── generate_default_qr.cjs  # Utility to regenerate upi-qr.png placeholder
├── tests/                   # Unit, API integration, and browser E2E test suites
├── .env.example             # Environment variable reference
├── .gitignore
└── package.json
``````

---

## Getting Started

### Prerequisites

- Node.js v18 or later
- MongoDB (local or MongoDB Atlas)

### Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Copy and configure the environment file:**
   ```bash
   cp .env.example .env
   ```
   Minimum required variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/fashionforge
   JWT_SECRET=your_secure_secret_here
   UPI_ID=your_upi_id@bank
   MERCHANT_NAME=FashionForge
   ```

3. **Add your UPI QR code image:**
   Replace `frontend/assets/images/upi-qr.png` with your actual merchant UPI QR image.

4. **Start the server:**
   ```bash
   npm start
   ```
   Open http://localhost:5000 in your browser.

---

## Payment

FashionForge supports two payment methods:

| Method | Behaviour |
| :--- | :--- |
| **UPI** | Displays a static merchant QR code. Customer scans with any UPI app and clicks "I''ve Completed Payment." |
| **Cash on Delivery** | Order is placed immediately; payment is collected on delivery. |

To update the UPI QR code, replace `frontend/assets/images/upi-qr.png` with your new QR image and redeploy.

---

## Running Tests

Run the full unit and API test suite:
```bash
npm test
```

Run the Puppeteer browser E2E suite:
```bash
node tests/test_browser_e2e_journey.cjs
node tests/test_browser_responsive_pwa.cjs
```

---

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for a step-by-step guide on deploying to Render with MongoDB Atlas.

---

## Academic Documentation

- **Architecture and System Design:** [docs/VIVA_NOTES.md](docs/VIVA_NOTES.md)
- **Viva Voce Q and A Reference:** [docs/VIVA_QA.md](docs/VIVA_QA.md)
