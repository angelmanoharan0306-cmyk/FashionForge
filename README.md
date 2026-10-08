# FashionForge

**Interactive Digital Fashion Design Studio**

🌐 **Live Demo / Project Website:** [https://fashionforge-8yuv.onrender.com/](https://fashionforge-8yuv.onrender.com/)

FashionForge is a full-stack web application that brings interactive garment design and customization directly to the browser. Instead of browsing fixed product catalogs, users interactively configure garments using a layered SVG-based 2.5D visual canvas on male and female fashion figures (croquis), receive real-time styling recommendations, view dynamic price breakdowns, and complete an end-to-end e-commerce journey from shopping bag to checkout, payment simulation, and order tracking.

The project is built entirely with native web standards on the frontend—HTML5, CSS3, Vanilla JavaScript, and SVG—paired with a Node.js, Express, and MongoDB backend.

---

## Table of Contents

- [Problem Statement & Solution](#problem-statement--solution)
- [Key Features](#key-features)
- [User Workflow](#user-workflow)
- [Technology Stack](#technology-stack)
- [Design Studio & 2.5D Visualization](#design-studio--25d-visualization)
- [Recommendation & Pricing Logic](#recommendation--pricing-logic)
- [Shopping & Order Workflow](#shopping--order-workflow)
- [Payment Simulation](#payment-simulation)
- [Project Structure](#project-structure)
- [Installation & Local Setup](#installation--local-setup)
- [Database Configuration](#database-configuration)
- [Authentication & Security](#authentication--security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Current Limitations](#current-limitations)
- [Future Enhancements](#future-enhancements)
- [Security Notice](#security-notice)

---

## Problem Statement & Solution

### The Problem
Traditional online fashion retail presents shoppers with pre-manufactured garments in rigid catalog listings. Customers cannot easily visualize how different silhouette combinations (e.g., pairing a wrap bodice with wide-leg trousers, or swapping short sleeves for flare sleeves) would look together in their preferred fabric, color, or pattern before purchasing. This creates uncertainty in online shopping and disconnects customer creativity from the ordering process.

### The Solution
FashionForge bridges this gap by providing an interactive digital studio where users can:
- **Build custom garments** by freely mixing and matching components (tops, bottoms, sleeves, necklines).
- **Visualize combinations in real time** on male and female figure models across front and back perspectives.
- **Experiment with materials** including fabrics, colors, and patterned overlays.
- **Receive guided styling feedback** based on garment harmony and proportions.
- **View transparent pricing** updated immediately with every selection.
- **Save and order designs** through a complete e-commerce bag, checkout, and simulated payment flow.

---

## Key Features

- **Interactive Design Studio:** Real-time visual configuration workspace with immediate canvas feedback and zero page reloads.
- **2.5D SVG Garment Visualization:** Layered vector geometry with simulated depth, directional lighting, and fabric textures (front and back views).
- **Technical Flat & Tech Pack Modes:** Switch between figure illustration, clean vector technical flats (CAD sketches), and a printable tech pack specification sheet with measurement tables.
- **Rule-Based Recommendations:** Contextual styling advice evaluated dynamically against deterministic fashion rules.
- **Dynamic Pricing Engine:** Instantaneous Bill of Materials (BOM) cost calculation based on component, fabric, and pattern selections.
- **User Authentication & Session Preservation:** Secure registration, bcrypt password hashing, JWT stateless sessions, and guest design preservation across login redirects.
- **Saved Designs Management (My Designs):** Full CRUD capability to save, view, reload into studio, duplicate, and delete personal creations.
- **Shopping Bag & Checkout:** Add designs with custom quantities, manage bag contents, and enter validated shipping details.
- **Payment Simulation:** Realistic UPI QR code payment (with dynamic URI deep links) and Cash on Delivery (COD) workflows.
- **Order Lifecycle & Tracking:** Unique order identification (`FF-ORD-XXXXX-XXXX`) with an interactive multi-stage tracking timeline.
- **Progressive Web App (PWA):** Installable web application with service worker caching and offline fallback support.

---

## User Workflow

FashionForge provides a continuous, cohesive user journey from first landing through garment production tracking:

```text
                  ┌───────────────────────────────┐
                  │           Home Page           │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │         Design Studio         │
                  │   Customize: Top, Bottom,     │
                  │   Sleeves, Neckline, Fabric,  │
                  │   Color, Pattern, Size, Model │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │       Real-Time Preview       │
                  │  • 2.5D SVG (Front / Back)    │
                  │  • Technical Flat CAD View    │
                  │  • Styling Recommendation     │
                  │  • Instant Dynamic Price      │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │    Save Design / Add to Bag   │
                  │  (Guest Session Preserved     │
                  │   or Authenticated User)      │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │          My Designs           │
                  │  Load, Edit, Duplicate, Delete│
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │         Shopping Bag          │
                  │  Review Items & Quantities    │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │           Checkout            │
                  │  Enter Shipping & Details     │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │      Payment Simulation       │
                  │  • UPI QR Code + Deep Link    │
                  │  • Cash on Delivery (COD)     │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │      Order Confirmation       │
                  │    Unique Order ID Issued     │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │   Order Details & Tracking    │
                  │  Placed → Processing → Ready  │
                  │   → Shipped → Delivered       │
                  └───────────────────────────────┘
```

### Guest Mode Experience
Users can explore the Design Studio and build garments immediately without creating an account. When a guest clicks **Save Design** or **Add to Bag**, the current garment state is saved to the browser's `sessionStorage` (`fashionforge_pending_design`). The user is redirected to sign in or register, and upon authentication, the pending design is automatically restored to the studio canvas.

---

## Technology Stack

The application relies strictly on standard web technologies without heavy front-end frameworks or unneeded dependencies:

| Layer | Technology | Role in Project |
|:---|:---|:---|
| **Frontend UI** | HTML5 | Semantic page structures across all 9 views |
| **Styling** | CSS3 (Vanilla) | Custom design system using CSS variables, flexbox, grid, glassmorphism, and responsive breakpoints |
| **Client Logic** | JavaScript (ES6+) | Vanilla client-side state management, DOM manipulation, and API integration |
| **Garment Canvas** | SVG (Scalable Vector Graphics) | Vector garment path rendering, depth shading, pattern definitions, and technical flats |
| **Icons & Fonts** | Font Awesome & Google Fonts | UI iconography and Outfit/Inter typography |
| **PWA** | Service Worker & Web Manifest | Device installability, static asset caching, and offline fallback |
| **Backend Runtime**| Node.js (v18+) | Server-side JavaScript execution environment |
| **Web Framework** | Express.js (v5) | RESTful API routing, static file serving, and middleware |
| **Database** | MongoDB | Document database for users, designs, carts, and orders |
| **Object Modeling**| Mongoose (v9) | Schema modeling, validation, and database operations |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) | Stateless Bearer token generation and route protection |
| **Password Security**| `bcryptjs` | One-way salted password hashing (10 salt rounds) |
| **Environment** | `dotenv` | Centralized environment variable loading |
| **Deployment** | Render & MongoDB Atlas | Cloud application hosting and managed cloud database |
| **Version Control**| Git & GitHub | Source code tracking and version control |

> **Note:** The frontend intentionally uses **Vanilla JavaScript and CSS**—no React, Angular, Vue, TypeScript, or Tailwind CSS are used. Likewise, the backend uses **pure Node.js/Express**—no Python or external AI/ML services are required.

---

## Design Studio & 2.5D Visualization

The Design Studio (`design.html` + `frontend/js/renderer/`) is the central feature of FashionForge.

### Available Customization Options

| Category | Options Available |
|:---|:---|
| **Figure Model** | Female croquis model, Male croquis model |
| **Sizes** | XS, S, M, L, XL, XXL, 3XL, 4XL (with chest, waist, hip, and length measurements) |
| **Top Silhouettes** | Fitted Bodice, Relaxed Fit, Wrap Top, Peplum Bodice |
| **Bottom Silhouettes**| A-Line Skirt, Straight Skirt, Wide Leg Trousers, Slim Trousers |
| **Sleeves** | Short Sleeve, Long Sleeve, Flare / Bell Sleeve |
| **Necklines / Collars**| Round Jewel, V-Neck, Square Neck |
| **Fabrics** | Organic Cotton, Mulberry Silk, Structured Denim, Natural Linen, Sheer Chiffon |
| **Patterns** | Solid Colour, Subtle Stripe, Check / Plaid, Floral Damask, Geometric Motif, Polka Dots |
| **Colors** | Curated palette swatches with hex color customization |
| **Views** | Front view and Back view toggle |

### What 2.5D Visualization Means

FashionForge renders garments using a **layered SVG-based 2.5D rendering pipeline**:
1. **Croquis Base Layer:** Pre-drawn fashion illustration figures (male and female, XS through 4XL, front and back).
2. **Vector Garment Geometry:** Dynamic SVG `<path>` elements generated by geometric functions based on body landmark points.
3. **Painter's Algorithm Ordering:** Elements are stacked in realistic depth order (back garment depth → lower body → waist seam → upper bodice → sleeves → neckline → topstitching → front highlights/shadows).
4. **Directional Lighting & Shading:** Simulated linear and radial SVG gradients create light reflection, fabric drape, and recessed folds.
5. **Pattern Overlays:** Dynamic SVG `<pattern>` definitions that repeat across paths while respecting the garment color.

> **Important Clarification:** The visualization is **layered 2.5D SVG illustration**. It is **NOT**:
> - Full 3D modeling (no WebGL mesh or 3D engine)
> - Augmented Reality (AR) or Virtual Reality (VR)
> - 360-degree free-angle rotation
> - Webcam-based virtual try-on
> - Physics-based fabric cloth simulation

### Studio Workspace Modes

- **Design Mode:** The default interactive canvas showing the garment rendered on the fashion figure croquis with real-time lighting.
- **Technical Flat Mode:** An orthographic vector technical sketch (CAD flat) showing clean front and back construction lines without the figure model.
- **Tech Pack Mode:** An exportable, printable production specification sheet summarizing garment components, size measurements, and full Bill of Materials (BOM) cost breakdown.

---

## Recommendation & Pricing Logic

### Deterministic Recommendation Engine
FashionForge features a **rule-based recommendation system** implemented in `frontend/js/recommendation.js`. 

- **How it works:** When any garment attribute changes, the engine evaluates the current design against a prioritized table of deterministic **IF/THEN rules**.
- **Rule criteria:** The engine inspects silhouette pairing harmony, fabric drape suitability, pattern visual balance, size proportion notes, and gender silhouette compatibility.
- **Gender compatibility:** When the male croquis model is selected, female-specific tops (Fitted Bodice, Wrap, Peplum) and skirts are automatically substituted with relaxed tops and trousers, accompanied by a polite compatibility notice.

> **Clarification:** This recommendation system is **100% deterministic rule-based JavaScript logic**. It does **NOT** use Machine Learning, Deep Learning, Neural Networks, or Generative AI.

### Centralized Pricing Engine
Garment prices are calculated deterministically using the centralized `calculateDesignPrice` function defined in `frontend/js/renderer/garment-data.js`.

The total price is calculated by summing the costs of each selected component:

$$\text{Total Price} = \text{Top} + \text{Bottom} + \text{Sleeves} + \text{Neckline} + \text{Fabric} + \text{Pattern} + \text{Size Modifier}$$

#### Representative Price Schedule (in ₹ INR):
- **Tops:** Fitted Bodice (₹450), Relaxed Fit (₹380), Wrap Top (₹420), Peplum (₹490)
- **Bottoms:** A-Line Skirt (₹550), Straight Skirt (₹520), Wide Leg (₹640), Slim Trousers (₹600)
- **Sleeves:** Short Sleeve (₹150), Long Sleeve (₹220), Flare Sleeve (₹200)
- **Necklines:** Round Jewel (₹80), V-Neck (₹90), Square Neck (₹95)
- **Fabrics:** Organic Cotton (₹250), Mulberry Silk (₹520), Structured Denim (₹380), Natural Linen (₹320), Sheer Chiffon (₹290)
- **Patterns:** Solid (₹0), Stripes (₹120), Checks (₹140), Floral (₹180), Geometric (₹150), Dots (₹110)
- **Size Modifier:** ₹0 across all standard sizes

**Authoritative Server-Side Validation:** When an order is checked out, the Express backend recalculates the total price directly from catalog data and rejects client-tampered prices.

---

## Shopping & Order Workflow

1. **Saving Designs:** Authenticated users save designs to their personal collection in MongoDB with a custom name and notes.
2. **My Designs Dashboard (`my-designs.html`):** Displays all saved garments with preview thumbnails. Users can reload a design into the studio, duplicate it, delete it, or add it directly to their shopping bag.
3. **Shopping Bag (`cart.html`):** Displays selected garments, unit prices, configurable quantities, and the calculated subtotal. Redundant additions increment item quantities rather than creating duplicate lines.
4. **Checkout (`checkout.html`):** Collects customer name, email, phone number, and detailed delivery address (street, city, state, postal code). Validated on both client and server.
5. **Order Lifecycle (`orders.html` & `order-details.html`):** Every confirmed order is assigned a unique tracking ID (`FF-ORD-XXXXX-XXXX`) and transitions through an audited status lifecycle:
   ```text
   placed → processing → ready → shipped → delivered
   ```
   Each milestone includes a timestamp recorded in the order's tracking timeline.

---

## Payment Simulation

Payment in FashionForge is strictly a **simulation** designed for educational and demonstration purposes.

### Implemented Methods

1. **UPI QR Code Payment:**
   - The payment page displays the merchant UPI ID (`fashionforge@upi`) alongside a static QR code image (`frontend/assets/images/upi-qr.png`).
   - A standard NPCI UPI URI string (`upi://pay?pa=...&pn=FashionForge&am=...`) is generated dynamically for each order.
   - On mobile devices, clicking the URI opens supported UPI apps (Google Pay, PhonePe, Paytm, BHIM).
   - If the static image is unavailable, an inline SVG QR code is generated dynamically in the browser via `qrcode.js`.
   - The customer clicks **"I've Completed Payment"** to confirm.
   - The server marks the order as `paid`, sets status to `placed`, and clears the shopping bag.

2. **Cash on Delivery (COD):**
   - The customer selects Cash on Delivery.
   - The order is confirmed immediately with payment status `pending` and order status `placed`, and the shopping bag is cleared.

### Payment Simulation Facts
- **No real payment gateway** (such as Razorpay, Stripe, or PayPal) is integrated.
- **No real financial transaction** takes place.
- **No debit/credit card numbers** are requested, stored, or processed.
- **No banking webhooks or settlement APIs** are connected.
- UPI confirmation is based on the user's manual declaration ("I've Completed Payment").
- If payment is cancelled or fails, the user's shopping bag is safely preserved.

---

## Project Structure

```text
FashionForge/
├── backend/                         # Express.js REST API & server logic
│   ├── config/
│   │   └── db.js                    # MongoDB connection manager via Mongoose
│   ├── controllers/
│   │   ├── authController.js        # User registration, login, and profile fetching
│   │   ├── cartController.js        # Shopping bag CRUD and item quantity management
│   │   ├── designController.js      # Saved design CRUD and ownership verification
│   │   ├── orderController.js       # Order creation, checkout, and status advancement
│   │   └── paymentController.js     # UPI URI generation, payment confirmation, and COD
│   ├── middleware/
│   │   ├── auth.js                  # JWT extraction and route protection middleware
│   │   ├── errorHandler.js          # Centralized error response formatter
│   │   └── validateDesign.js        # Request payload validation for design configurations
│   ├── models/
│   │   ├── Cart.js                  # Mongoose schema for shopping bag items
│   │   ├── Design.js                # Mongoose schema for saved custom garment designs
│   │   ├── Order.js                 # Mongoose schema for orders, delivery, and tracking
│   │   └── User.js                  # Mongoose schema for users with hashed passwords
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth endpoints
│   │   ├── cartRoutes.js            # /api/cart endpoints
│   │   ├── designRoutes.js          # /api/designs endpoints
│   │   ├── orderRoutes.js           # /api/orders endpoints
│   │   └── paymentRoutes.js         # /api/payments endpoints
│   ├── services/
│   │   └── upiService.js            # UPI URI string formatting and merchant configuration
│   └── server.js                    # Server entry point, middleware assembly, static file serving
├── frontend/                        # Client-side web application
│   ├── assets/
│   │   ├── icons/                   # PWA icons (192px, 512px, maskable, SVG)
│   │   ├── images/                  # UPI QR code image asset
│   │   ├── models/                  # Male & female croquis figure images (XS–4XL, front/back)
│   │   └── svg/                     # Component vector assets
│   ├── css/
│   │   └── style.css                # Global design system (tokens, layout, responsive styles)
│   ├── js/
│   │   ├── renderer/                # 2.5D SVG visualization engine
│   │   │   ├── body-profiles.js     # Anatomical landmark points for croquis figures
│   │   │   ├── croquis-calibration.js# Alignment matrices for SVG layers on figures
│   │   │   ├── garment-data.js      # Garment catalog definitions and BOM pricing formulas
│   │   │   ├── geometry.js          # Dynamic SVG vector path generators
│   │   │   ├── lighting.js          # Lighting gradients and depth shading calculations
│   │   │   ├── materials.js         # Fabric material profiles, roughness, and color tuning
│   │   │   ├── qrcode.js            # In-browser SVG QR code fallback generator
│   │   │   └── size-data.js         # Standard size chart dimension tables (XS–4XL)
│   │   ├── services/                # API client services
│   │   │   ├── auth-nav.js          # Navigation bar authentication state synchronization
│   │   │   ├── auth-service.js      # Token storage and authentication HTTP requests
│   │   │   ├── cart-service.js      # Bag operations HTTP client
│   │   │   ├── design-storage.js    # Design persistence HTTP client
│   │   │   └── pwa.js               # Service worker registration helper
│   │   ├── app.js                   # Design Studio main controller and event binder
│   │   ├── auth.js                  # Login and registration form handler
│   │   ├── cart.js                  # Shopping bag page controller
│   │   ├── checkout.js              # Checkout form controller and order submission
│   │   ├── my-designs.js            # Saved designs gallery controller
│   │   ├── order-confirmation.js    # Order receipt display controller
│   │   ├── order-details.js         # Order status tracking timeline controller
│   │   ├── orders.js                # Order history list controller
│   │   ├── payment.js               # Payment page controller (UPI & COD)
│   │   └── recommendation.js        # Rule-based styling recommendation engine
│   ├── cart.html                    # Shopping bag page
│   ├── checkout.html                # Delivery details and checkout page
│   ├── design.html                  # Core interactive Design Studio workspace
│   ├── index.html                   # Landing and home page
│   ├── login.html                   # User login and registration portal
│   ├── manifest.webmanifest         # PWA web application manifest
│   ├── my-designs.html              # User saved designs dashboard
│   ├── offline.html                 # PWA offline fallback page
│   ├── order-confirmation.html      # Post-purchase order confirmation page
│   ├── order-details.html           # Live order tracking and receipt page
│   ├── orders.html                  # Past orders listing page
│   ├── payment.html                 # Simulated payment portal (UPI QR & COD)
│   └── service-worker.js            # Service worker for offline caching and assets
├── tests/                           # Automated test suites
│   ├── test_payment.js              # UPI QR and COD payment verification
│   ├── test_phase7.js               # Design persistence and client storage tests
│   ├── test_phase8.js               # Design REST API and database integration tests
│   ├── test_phase9.js               # Authentication, bcrypt, and user isolation tests
│   ├── test_phase10.js              # Bag operations, checkout, and price tampering tests
│   ├── test_phase11.js              # Orders, tracking timeline, and lifecycle tests
│   ├── test_ui_pwa.js               # PWA manifest, service worker, and layout tests
│   ├── test_workflow.js             # End-to-end multi-page user journey integration tests
│   └── test_browser_*.cjs           # Puppeteer Chrome browser validation scripts
├── docs/                            # Project documentation
│   ├── DEPLOYMENT.md                # Cloud deployment instructions for Render and Atlas
│   ├── VIVA_NOTES.md                # Architecture summary for viva examinations
│   └── VIVA_QA.md                   # Questions and answers reference for evaluation
├── scripts/                         # Project maintenance utility scripts
│   └── generate_default_qr.cjs      # Standalone utility to regenerate placeholder UPI QR image
├── .env.example                     # Environment configuration template
├── .gitignore                       # Git ignore list
├── package.json                     # Node.js project metadata, dependencies, and npm scripts
└── README.md                        # Primary project documentation
```

---

## Installation & Local Setup

Follow these steps to run FashionForge on your local machine:

### 1. Prerequisites
- **Node.js:** v18.0.0 or later installed ([nodejs.org](https://nodejs.org/))
- **npm:** v9.0.0 or later (bundled with Node.js)
- **MongoDB:** A running local MongoDB instance (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://cloud.mongodb.com/) cluster connection URI
- **Git:** Installed on your system

### 2. Clone the Repository
```bash
git clone https://github.com/angelmanoharan0306-cmyk/FashionForge.git
cd FashionForge
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the project root by copying the provided `.env.example`:

```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On macOS/Linux:
cp .env.example .env
```

Open `.env` in an editor and set your local configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/fashionforge
JWT_SECRET=fashionforge_development_secret_key_min_32_chars!
JWT_EXPIRES_IN=7d
UPI_ID=fashionforge@upi
MERCHANT_NAME=FashionForge
```

*(Note: Replace `MONGODB_URI` with your MongoDB Atlas connection string if you are using cloud database hosting).*

### 5. Start the Server
Run the application in development mode:

```bash
npm run dev
```

Or run using standard start:

```bash
npm start
```

### 6. Open the Application
Open your web browser and navigate to:
```text
http://localhost:5000
```

The Express server serves both the frontend web pages and the `/api/` REST endpoints simultaneously.

---

## Database Configuration

FashionForge uses **MongoDB** managed through **Mongoose** Object Data Modeling (ODM).

- **Connection Management:** Handled in `backend/config/db.js`. It establishes connection on server startup using the `MONGODB_URI` environment variable.
- **Automatic Collection Creation:** MongoDB and Mongoose automatically create the required database and collections when the first document is inserted. No manual SQL migrations or database provisioning scripts are needed.
- **The 4 Database Collections:**
  1. `users`: Stores user identity, display name, validated unique email, and bcrypt-hashed passwords.
  2. `designs`: Stores customized garment configurations linked to the owning `userId` (top, bottom, sleeves, collar, fabric, colour, pattern, size, gender, price, notes, front/back view).
  3. `carts`: Stores one active shopping bag document per user with an array of items, quantities, and price snapshots.
  4. `orders`: Stores completed purchases containing delivery details, item snapshots, subtotal, total, payment status (`pending`, `paid`), payment method (`upi`, `cod`), order status (`placed` through `delivered`), and status history with timestamps.

---

## Authentication & Security

FashionForge implements token-based authentication and defense-in-depth security:

- **Password Hashing:** Passwords must be at least 6 characters. They are hashed using **`bcryptjs`** with 10 salt rounds before storage. Plaintext passwords are never saved or logged.
- **Stateless Tokens:** Successful login issues a **JSON Web Token (JWT)** signed with `JWT_SECRET`. Tokens expire after 7 days (`JWT_EXPIRES_IN=7d`).
- **Protected Endpoints:** Sensitive API routes (`/api/designs`, `/api/cart`, `/api/orders`, `/api/payments`) require the `Authorization: Bearer <token>` header, verified by `backend/middleware/auth.js`.
- **User Resource Isolation:** All database queries for designs, carts, and orders strictly enforce the authenticated user's ID (`req.user.userId`). Users cannot read, modify, or delete resources belonging to other accounts (verified by automated tests returning HTTP 403 Forbidden).
- **Authoritative Price Recalculation:** The server does not trust client-submitted monetary totals during checkout. The backend independently calculates item costs from catalog rules and rejects altered prices.
- **Input Validation:** User input and design configurations are sanitized and validated against allowed options via Express middleware (`validateDesign.js`).

---

## Testing

The project includes automated validation covering the major application workflows and modules. The latest verified test run passed **363 out of 363 checks**.

### Running the Test Suite
Ensure the server is running locally on port 5000 with a connected database, then execute:

```bash
npm test
```

### Test Coverage Breakdown
`npm test` executes 8 comprehensive test scripts sequentially:

1. `tests/test_phase7.js`: Design persistence, normalization, and My Designs CRUD operations against local and remote storage.
2. `tests/test_phase8.js`: Design REST API routes (`/api/designs`), MongoDB persistence, and schema input validation.
3. `tests/test_phase9.js`: Authentication security, bcrypt hashing, JWT issuance, design ownership enforcement, and cross-user data isolation.
4. `tests/test_phase10.js`: Shopping bag operations (`/api/cart`), checkout creation, price tampering rejection, and cart isolation.
5. `tests/test_phase11.js`: Order creation, history retrieval, lifecycle status transitions (`placed` → `delivered`), and tracking timeline accuracy.
6. `tests/test_workflow.js`: Complete 9-page end-to-end workflow validation, verifying registration, design customization, bag management, checkout, payment simulation, and order delivery.
7. `tests/test_ui_pwa.js`: UI shell, Web App Manifest schema, service worker cache strategies, and offline page fallback behavior.
8. `tests/test_payment.js`: Payment simulation checks covering UPI QR generation, dynamic UPI URI formatting, mobile intent deep links, customer manual confirmation, bag clearance on payment, and COD processing.

### Browser End-to-End Testing (Puppeteer)
Additional automated end-to-end browser tests run directly in Google Chrome using Puppeteer:

```bash
node tests/test_browser_e2e_journey.cjs    # Full visual user journey in Chrome
node tests/test_browser_responsive_pwa.cjs # Responsive viewports (mobile, tablet, desktop)
node tests/test_browser_audit.cjs          # DOM audit and element accessibility checks
node tests/test_browser_payment.cjs        # Payment modal and UI interaction checks
```

---

## Deployment

FashionForge is designed to deploy easily as a unified service where Node.js handles both the API and static file serving.

### Production Setup
- **Live Project Website:** [https://fashionforge-8yuv.onrender.com/](https://fashionforge-8yuv.onrender.com/)
- **Hosting Platform:** [Render](https://render.com/) (Web Service)
- **Cloud Database:** [MongoDB Atlas](https://cloud.mongodb.com/) (Free M0 Shared Cluster)

### Deployment Steps
1. **Set up MongoDB Atlas:**
   - Create a free cluster.
   - Create a database user under **Database Access**.
   - Add `0.0.0.0/0` under **Network Access** to allow hosting connections.
   - Copy the MongoDB connection URI string.
2. **Deploy on Render:**
   - Create a **New Web Service** connected to your GitHub repository.
   - Configure:
     - **Environment:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
   - Set environment variables in the Render dashboard:
     - `PORT`: `10000` (assigned by Render)
     - `NODE_ENV`: `production`
     - `MONGODB_URI`: `<your-mongodb-atlas-uri>`
     - `JWT_SECRET`: `<a-long-secure-random-key>`
     - `JWT_EXPIRES_IN`: `7d`
     - `UPI_ID`: `<your-upi-id>`
     - `MERCHANT_NAME`: `FashionForge`
     - `FRONTEND_URL`: `https://<your-service-name>.onrender.com`
3. **Launch:** Click **Deploy**. Your app will be live at `https://<your-service-name>.onrender.com`.

> **Note on Free Tier Hosting:** On Render's free tier, the web service enters sleep mode after 15 minutes of inactivity. The initial request after being idle may take approximately 30–50 seconds to complete a cold start.

---

## Current Limitations

To maintain academic and professional transparency, the following boundaries of the current implementation are explicitly acknowledged:

- **2.5D Illustration, Not 3D:** Garments are rendered as layered SVG paths on 2D croquis figures. There is no 3D polygon mesh, 360-degree rotation, or physics-based cloth simulation.
- **No AR / Webcam Fitting:** There is no augmented reality try-on, webcam capture, or body measurement scanning.
- **Rule-Based, Not AI/ML:** The styling recommendation engine is based on deterministic IF/THEN JavaScript heuristics rather than trained machine learning or generative AI models.
- **Simulated Payment:** Payment is a simulation. The application does not connect to live banking gateways (Razorpay, Stripe) or process actual financial transactions.
- **Simulated Order Tracking:** The status pipeline (`placed` → `delivered`) is an internal state machine; there is no integration with real logistics or courier APIs (e.g., Shiprocket, FedEx).
- **Single Currency & Language:** Currency is fixed to Indian Rupees (₹ INR) and the interface is English-only.
- **Client Rendering Overhead:** Because SVG layers and patterns are rendered in the DOM, performance may vary on low-memory mobile devices.

---

## Future Enhancements

The following enhancements represent potential future directions:

- **3D Garment Rendering:** Transitioning to WebGL / Three.js for real-time 3D cloth draping and 360-degree model rotation.
- **Augmented Reality Try-On:** Adding camera-based virtual fitting using AR face/body tracking libraries.
- **Machine Learning Recommendations:** Integrating styling models trained on fashion design datasets for personalized aesthetic recommendations.
- **Live Payment Gateway:** Connecting Razorpay or Stripe for real credit/debit card, net banking, and verified UPI webhooks.
- **Real Logistics Integration:** Hooking order tracking into courier tracking APIs for live GPS package tracking.
- **Tailored Measurement Fitting:** Allowing customers to enter individual body measurements (bust, waist, hip, inseam) to generate custom patterns.
- **Admin Dashboard:** Creating a dedicated portal for store administrators to manage catalog items, review orders, and update shipping statuses.

---

## Security Notice

- **Never commit `.env` files** containing sensitive secrets or credentials to public source repositories.
- Use `.env.example` as a template for team onboarding and continuous integration.
- Ensure production deployments generate strong, cryptographically secure values for `JWT_SECRET` (at least 32 random characters).
- Maintain MongoDB Atlas network access controls and rotate database user credentials regularly.

---

## License

This project is developed for educational and academic demonstration purposes as a final-year B.Sc. Computer Science project under the **ISC License**.
