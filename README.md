# FashionForge

FashionForge is a full-stack interactive fashion design web application that allows users to design custom garments on a layered SVG-based 2.5D canvas, preview front and back views on human figure models, receive rule-based styling recommendations, see real-time pricing, and complete an end-to-end shopping workflow including bag, checkout, and payment through UPI QR or Cash on Delivery. The application is built with vanilla HTML, CSS, and JavaScript on the frontend, and Node.js with Express and MongoDB on the backend.

---

## 1. Project Overview

FashionForge is a web-based fashion design studio that brings the concept of custom garment design to the browser. Instead of browsing fixed product listings, users interactively build their own garments by selecting components (top silhouette, bottom silhouette, sleeves, neckline), choosing fabrics, colours, and patterns, and seeing their choices rendered in real time on a human figure model.

The application covers the complete lifecycle from design to order: users create garments in the Design Studio, save them to their personal collection, add them to a shopping bag, proceed through checkout with delivery details, select a payment method, and receive order confirmation with tracking.

FashionForge is developed as a final-year academic project demonstrating interactive web application development, frontend visualization, REST API design, database persistence, authentication, business-rule logic, pricing calculations, and an e-commerce workflow.

---

## 2. Problem Statement

Traditional online fashion retail presents customers with pre-made garments in fixed designs. Customers cannot easily visualise how different combinations of tops, bottoms, sleeves, necklines, fabrics, and colours would look together before purchasing. There is a gap between the customer's creative vision and the available product catalogue.

FashionForge addresses this gap by providing an interactive design tool where users can:

- Combine garment components visually and see the result immediately.
- Experiment with different fabrics, colours, patterns, and sizes.
- Receive styling guidance based on their selections.
- Understand the cost of their custom design in real time.
- Save, revisit, and order their personalised creations.

---

## 3. Project Objective

1. Build an interactive browser-based garment design studio with real-time visual feedback.
2. Implement a layered SVG-based 2.5D rendering engine that visualises garment components on human figure models.
3. Provide rule-based styling recommendations that guide users toward harmonious design choices.
4. Calculate dynamic pricing based on selected garment components, fabric, and pattern.
5. Implement user authentication with secure password handling and JWT-based sessions.
6. Enable users to save, load, edit, duplicate, and delete their designs.
7. Build a complete shopping workflow: bag, checkout, payment, order confirmation, and order tracking.
8. Develop a RESTful backend API with Express and MongoDB for persistent data storage.
9. Make the application installable as a Progressive Web App (PWA) with offline support.

---

## 4. Key Features

### Design Studio
An interactive workspace where users select garment components, colours, fabrics, and patterns. Every change updates the garment preview and price in real time.

### Garment Customisation
Users choose from multiple options for each garment component:
- **Top:** Fitted Bodice, Relaxed Fit, Wrap Top, Peplum Bodice
- **Bottom:** A-Line Skirt, Straight Skirt, Wide Leg Trousers, Slim Trousers
- **Sleeves:** Short Sleeve, Long Sleeve, Flare / Bell Sleeve
- **Neckline:** Round Jewel, V-Neck, Square Neck
- **Fabric:** Organic Cotton, Mulberry Silk, Structured Denim, Natural Linen, Sheer Chiffon
- **Pattern:** Solid Colour, Subtle Stripe, Check / Plaid, Floral Damask, Geometric Motif, Polka Dots
- **Colour:** A curated palette of colour swatches
- **Size:** XS, S, M, L, XL, XXL, 3XL, 4XL
- **Gender / Figure:** Female and Male croquis (fashion figure) models

### Front and Back Visualisation
Users can toggle between front view and back view of the garment on the human figure model. Both views render with appropriate construction details.

### 2.5D Layered Garment Rendering
The garment preview is rendered using layered SVG elements with simulated depth, directional lighting, shadow gradients, fabric texture effects, and pattern overlays. This produces a fashion-illustration-style visualisation with visual depth, without being a true 3D cloth simulation.

### Technical Sketch and Garment Specifications
The Design Studio includes three workspace modes:
- **Design Mode** — the main 2.5D garment preview on the human figure model.
- **Technical Flat Mode** — a clean vector technical sketch (flat drawing) of the garment without the human figure, showing front and back construction.
- **Tech Pack Mode** — a printable specification sheet showing the garment name, measurements, component details, and a full pricing breakdown.

### Rule-Based Styling Recommendations
The application evaluates the current design state against a table of deterministic IF/THEN rules and displays a contextual styling recommendation. Rules cover fabric-silhouette harmony, pattern-proportion guidance, gender compatibility, size-fit guidance, and component accent suggestions.

### Dynamic Pricing
A centralized pricing engine calculates the total estimated price by summing the individual costs of the selected top, bottom, sleeves, neckline, fabric, and pattern. The price updates live as the user makes changes.

### User Accounts and Authentication
Users register with a name, email, and password. Passwords are hashed using bcrypt before storage. Authentication uses stateless JSON Web Tokens (JWT). A valid JWT is required for saving designs, accessing the bag, placing orders, and viewing order history.

### Save, Edit, Duplicate, and Delete Designs
Authenticated users can save their current design configuration to MongoDB. From the **My Designs** page, users can view all saved designs, load a design back into the studio for editing, duplicate a design (creating a copy with a new ID), or delete a design.

### My Designs
A dedicated page that displays all designs saved by the logged-in user, each shown with a rendered thumbnail preview, design name, and action buttons for editing, duplicating, deleting, and adding to bag.

### Bag and Checkout
Users add saved designs to their shopping bag with a specified quantity. The bag page shows each item with its unit price, quantity, and subtotal. From the bag, users proceed to checkout where they enter delivery details (name, email, phone, address, city, state, postal code).

### UPI QR and Cash on Delivery Payment
After checkout, the payment page offers two options:
- **UPI:** Displays a merchant QR code and UPI ID. The user scans with any UPI app and clicks "I've Completed Payment" to confirm.
- **Cash on Delivery (COD):** The order is placed immediately with payment collected on delivery.

No third-party payment gateway (such as Razorpay or Stripe) is integrated. Payment confirmation is manual.

### Orders and Tracking
After payment, users see an order confirmation page with a unique order ID. The **Orders** page lists all past orders. The **Order Details** page shows the full order with items, delivery address, payment status, and a multi-stage tracking timeline (Placed → Processing → Ready to Ship → Shipped → Delivered).

### Progressive Web App (PWA)
The application includes a web app manifest and service worker, making it installable on supported devices. Static assets are cached for offline access, and an offline fallback page is displayed when the network is unavailable. API requests are never cached.

### Responsive Design
The interface adapts across desktop, tablet, and mobile screen sizes.

---

## 5. How FashionForge Works

The complete user journey through FashionForge follows these steps:

1. **Home Page** — The user lands on the home page and can browse or navigate to the Design Studio.
2. **Design Studio** — The user opens the Design Studio and begins customising a garment. No login is required to use the studio.
3. **Customise** — The user selects a top, bottom, sleeves, neckline, colour, fabric, pattern, size, and gender. Each change updates the preview and price instantly.
4. **Preview** — The user views the garment on front and back views, toggles the figure model visibility, zooms in/out, and reviews the styling recommendation.
5. **Technical Sketch / Specifications** — The user switches to Technical Flat mode for a clean construction sketch, or Tech Pack mode for a printable specification sheet with measurements and pricing breakdown.
6. **Save** — When ready, the user clicks Save. If not logged in, the application preserves the design and redirects to the login page. After authentication, the design is saved to the database.
7. **Bag** — The user adds the saved design to their shopping bag (directly from the studio or from My Designs).
8. **Checkout** — The user reviews the bag, enters delivery details, and proceeds to create the order.
9. **Payment** — The user selects UPI or Cash on Delivery. For UPI, the user scans the QR code and confirms; for COD, the order is placed immediately.
10. **Order Confirmation** — A confirmation page displays the unique order ID and summary.
11. **Order History and Tracking** — The user can view all past orders and check the status and tracking timeline for each order.

---

## 6. Design Studio

The Design Studio is the core feature of FashionForge. It is a single-page workspace divided into three areas: the garment preview canvas, the component/material selectors, and the inspector panel with specifications.

### Component Selection

Users select garment components through visual cards:

| Component | Options |
|:---|:---|
| **Top** | Fitted Bodice, Relaxed Fit, Wrap Top, Peplum Bodice |
| **Bottom** | A-Line Skirt, Straight Skirt, Wide Leg Trousers, Slim Trousers |
| **Sleeves** | Set-In Short Sleeve, Long Sleeve, Flare / Bell Sleeve |
| **Neckline** | Round Jewel, V-Neck, Square Neck |

### Material and Appearance

| Selection | Options |
|:---|:---|
| **Colour** | Curated palette of colour swatches |
| **Fabric** | Organic Cotton, Mulberry Silk, Structured Denim, Natural Linen, Sheer Chiffon |
| **Pattern** | Solid Colour, Subtle Stripe, Check / Plaid, Floral Damask, Geometric Motif, Polka Dots |

### Size and Figure

| Selection | Options |
|:---|:---|
| **Size** | XS, S, M, L, XL, XXL, 3XL, 4XL (with chest, waist, hip, length, shoulder, armhole measurements) |
| **Gender / Figure** | Female croquis model, Male croquis model |

Switching between female and male models automatically adjusts incompatible components. For example, selecting the male model replaces female-specific tops (Fitted Bodice, Wrap, Peplum) with the Relaxed Fit, and replaces skirts with trousers.

### How Selections Affect the Preview

Every selection change triggers the rendering pipeline, which:
1. Redraws the SVG garment layers on the human figure model.
2. Applies the selected fabric texture and pattern overlay.
3. Applies the selected colour with harmonised lighting and shadow gradients.
4. Recalculates and displays the price.
5. Evaluates and displays the styling recommendation.

### Additional Studio Controls

- **Front / Back view toggle** — Switches the garment and figure between front and back views.
- **Undo / Redo** — Reverts or re-applies design changes (Ctrl+Z / Ctrl+Y supported).
- **Reset** — Returns the design to the default ensemble.
- **Zoom** — Adjusts the preview scale (50%–200%).
- **Figure visibility toggle** — Shows or hides the human figure model.
- **Construction lines toggle** — Shows or hides construction seams and topstitching.
- **Fullscreen** — Expands the preview canvas to fullscreen.
- **Export** — Downloads the technical flat as an SVG file, or prints the tech pack sheet.

---

## 7. Garment Visualisation

FashionForge uses a **layered SVG-based 2D rendering pipeline with 2.5D visual styling** to create the garment preview. This approach produces a fashion-design illustration with visual depth, shading, and material effects, without being a real-time 3D cloth simulation.

### How It Works

1. **Human Figure Layer** — A pre-drawn croquis (fashion figure) model image is displayed as the base layer. Size-specific model images (XS through 4XL) are used for both male and female figures, with separate front and back views.

2. **Garment Geometry** — Each garment component (bodice, skirt, trousers, sleeves, neckline) is defined as a set of SVG vector paths generated by JavaScript geometry functions. The paths are calculated based on body landmarks and garment construction rules.

3. **Material System** — Each fabric type (cotton, silk, denim, linen, chiffon) has a material profile that controls roughness, highlight intensity, shadow opacity, and texture characteristics. These profiles influence how the SVG gradients and overlays are generated.

4. **Lighting and Depth** — Directional linear and radial gradients simulate a key light source, creating highlights on elevated surfaces and shadows in recessed areas. This produces the 2.5D depth effect that gives garments a sense of volume.

5. **Pattern Overlays** — Patterns (stripes, checks, floral, geometric, dots) are rendered as SVG pattern fills that follow the garment shape and respond to the selected colour.

6. **Construction Details** — Optional seam lines, topstitching, and hem facings are rendered as thin SVG paths to show garment construction.

7. **Layer Ordering** — Components are rendered in a specific painter's-algorithm order: back depth layer → lower garment → waist connection → upper garment → sleeves → neckline → construction details → foreground occlusion layer → shadows.

### Technical Flat

The Technical Flat mode renders the garment without the human figure model, as a clean orthographic construction sketch. Front and back views are available side by side in the inspector panel, and as a full-scale drawing in the Technical Flat workspace.

---

## 8. Recommendation System

FashionForge includes a **rule-based recommendation engine** that provides contextual styling guidance. This is **not** a machine learning or AI-based system. It uses deterministic IF/THEN JavaScript logic to evaluate the current design state against a prioritised table of rules.

### How It Works

1. Each rule has a **condition function** that checks specific aspects of the current design (e.g., fabric type, pattern, silhouette combination, gender, size).
2. Rules are assigned a **priority number**. Higher-priority rules are evaluated first.
3. When the user makes a change, the engine identifies the most relevant rule whose condition matches the current state and displays its recommendation.
4. If no specific rule matches, a default balanced-silhouette recommendation is shown.

### Example Rules (from the actual code)

| Condition | Recommendation |
|:---|:---|
| IF fabric = silk | "Relaxed & Wrap Silhouettes Recommended" — Silk features high sheen and liquid drape, best paired with relaxed or wrap silhouettes. |
| IF pattern = floral | "Simpler Construction Recommended" — The rich floral motif is prominent; simpler garment construction keeps it centre stage. |
| IF male croquis AND bottom = skirt | "Compatibility Notice" — Skirts are specific to the female silhouette; trousers are recommended. |
| IF top = basic AND bottom = wide | "Balanced Silhouette" — A fitted bodice with wide-leg trousers achieves ideal volume contrast. |

### Gender Compatibility

When the male croquis model is active, certain female-specific components (Fitted Bodice, Wrap Top, Peplum, A-Line Skirt, Straight Skirt) are automatically replaced with compatible alternatives and a compatibility notice is shown.

---

## 9. Pricing System

FashionForge uses a **centralized pricing engine** that calculates the total estimated garment price by summing the costs of each selected component. The pricing function (`calculateDesignPrice`) is the single source of truth for all price calculations throughout the application.

### Price Composition

| Component | Examples of Prices (₹) |
|:---|:---|
| Top | Fitted Bodice: 450, Relaxed Fit: 380, Wrap Top: 420, Peplum: 490 |
| Bottom | A-Line Skirt: 550, Straight Skirt: 520, Wide Leg: 640, Slim Trousers: 600 |
| Sleeves | Short: 150, Long: 220, Flare: 200 |
| Neckline | Round: 80, V-Neck: 90, Square: 95 |
| Fabric | Cotton: 250, Silk: 520, Denim: 380, Linen: 320, Chiffon: 290 |
| Pattern | Solid: 0, Stripes: 120, Checks: 140, Floral: 180, Geometric: 150, Dots: 110 |
| Size modifier | Currently 0 for all sizes |

**Total Price = Top + Bottom + Sleeves + Neckline + Fabric + Pattern + Size Modifier**

The price updates instantly as the user changes any component. All prices are defined in the `GARMENT_CATALOG` data structure in [`garment-data.js`](frontend/js/renderer/garment-data.js).

---

## 10. Authentication and User Accounts

FashionForge uses a standard email/password authentication system.

### Registration
Users create an account by providing a name, email address, and password (minimum 6 characters). The password is hashed using **bcrypt** (with 10 salt rounds) before being stored in MongoDB. Plaintext passwords are never stored.

### Login
Users log in with their email and password. The server verifies the credentials by comparing the submitted password against the stored bcrypt hash. On success, a **JSON Web Token (JWT)** is issued.

### JWT Authentication
The JWT contains the user's ID, email, and name. It is sent with each API request in the `Authorization: Bearer <token>` header. The server verifies the token on every protected endpoint. Tokens expire after a configurable period (default: 7 days).

### Protected Operations
The following operations require a valid JWT:
- Saving, loading, editing, duplicating, and deleting designs
- Viewing and modifying the shopping bag
- Placing orders and making payments
- Viewing order history and order details

### Guest Mode
Users can freely use the Design Studio without logging in. When a guest tries to save a design or add to bag, the current design is preserved in the browser's session storage, the user is redirected to log in, and the design is restored after authentication.

---

## 11. Saved Designs

When an authenticated user saves a design, all configuration details (top, bottom, sleeves, neckline, fabric, colour, pattern, size, gender, price, notes) are stored as a document in the MongoDB `designs` collection.

### What Users Can Do

| Action | Description |
|:---|:---|
| **Save** | Stores the current studio configuration as a new design with a unique ID |
| **Edit** | Loads a saved design back into the studio, makes changes, and saves again |
| **Duplicate** | Creates a copy of a saved design with a new ID and an incremented name |
| **Delete** | Permanently removes a design from the database |
| **Add to Bag** | Adds a saved design to the shopping bag for purchase |

Each design is owned by the user who created it. Users can only view, edit, and delete their own designs.

---

## 12. Bag, Checkout, and Orders

### Shopping Bag
- Users add saved designs to their bag with a quantity.
- If the same design is added again, the quantity is incremented rather than creating a duplicate line.
- The bag displays each item's name, configuration summary, unit price, quantity, and line total.
- A subtotal is calculated on the server side.
- Users can update quantities, remove individual items, or clear the bag.

### Checkout
- From the bag, users proceed to the checkout page.
- The checkout form collects: full name, email, phone, shipping address, city, state, and postal code.
- All fields are validated both on the client and on the server.
- On submission, the server creates a new order from the current bag contents.
- The server performs authoritative price calculation (it does not trust client-submitted totals).

### Order Creation
- The order is stored in MongoDB with a unique order ID (format: `FF-ORD-XXXXX-XXXX`).
- The order records all items with their configuration snapshots, customer details, and timestamps.
- Initial status: order status = "placed", payment status = "pending".

### Order Tracking
Orders progress through a defined lifecycle:

```
placed → processing → ready → shipped → delivered
```

Each status transition is recorded in the order's tracking array with a timestamp. The order details page displays this as a visual timeline.

**Note:** Order tracking is a simulated lifecycle for demonstration purposes. There is no integration with real shipping carriers or inventory systems.

---

## 13. Payment

FashionForge implements a simplified payment system with two methods:

### UPI QR Payment
1. The payment page displays the merchant's UPI ID and a QR code image.
2. A dynamic UPI URI is generated in the standard NPCI format: `upi://pay?pa=<UPI_ID>&pn=FashionForge&am=<AMOUNT>&cu=INR&tn=FashionForge Order <ORDER_ID>`.
3. The user scans the QR code with any UPI app (PhonePe, Google Pay, Paytm, BHIM, etc.) and completes the payment externally.
4. The user clicks "I've Completed Payment" to confirm.
5. The order is marked as paid and the bag is cleared.

### Cash on Delivery (COD)
1. The user selects Cash on Delivery on the payment page.
2. The order is confirmed immediately with payment status "pending".
3. The bag is cleared.

### Important Notes
- There is **no third-party payment gateway** integrated (no Razorpay, Stripe, Cashfree, etc.).
- UPI payment confirmation is based on the user's self-declaration ("I've Completed Payment"). The system does not verify the payment with the bank.
- The UPI QR code image is a static file that must be replaced with the merchant's actual QR code for real use.

---

## 14. Technology Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) | Application pages, styling, and client-side logic |
| **Garment Rendering** | SVG (Scalable Vector Graphics) | Layered 2.5D garment visualisation with vector paths, gradients, and pattern fills |
| **Backend Runtime** | Node.js | Server-side JavaScript runtime |
| **Web Framework** | Express 5 | REST API routing, middleware, and static file serving |
| **Database** | MongoDB | Document-based storage for users, designs, carts, and orders |
| **ODM** | Mongoose | Schema-based data modelling and validation for MongoDB |
| **Authentication** | JSON Web Tokens (jsonwebtoken) | Stateless user session management |
| **Password Hashing** | bcryptjs | Secure one-way password hashing |
| **Configuration** | dotenv | Loading environment variables from `.env` file |
| **PWA** | Service Worker, Web App Manifest | Offline caching, installability |
| **Testing** | Node.js built-in test runner, Puppeteer | Unit tests, API integration tests, browser end-to-end tests |

---

## 15. System Architecture

```
┌─────────────────────────────────┐
│          User (Browser)         │
│   HTML / CSS / JavaScript       │
│   SVG Rendering Engine          │
│   Service Worker (PWA)          │
└──────────────┬──────────────────┘
               │  HTTP / REST
               ▼
┌─────────────────────────────────┐
│     Node.js + Express Server    │
│  ┌───────────────────────────┐  │
│  │  Routes + Controllers     │  │
│  │  Auth Middleware (JWT)     │  │
│  │  Validation Middleware     │  │
│  │  Error Handler             │  │
│  │  UPI Service               │  │
│  └───────────────────────────┘  │
│  Static File Serving (frontend) │
└──────────────┬──────────────────┘
               │  Mongoose ODM
               ▼
┌─────────────────────────────────┐
│          MongoDB                │
│  Collections:                   │
│  • users                        │
│  • designs                      │
│  • carts                        │
│  • orders                       │
└─────────────────────────────────┘
```

The Express server serves both the REST API (under `/api/`) and the frontend static files. This means the frontend and backend run from a single server process.

---

## 16. Application Flow

```
┌──────────┐    ┌──────────────┐    ┌───────────┐    ┌──────┐
│   Home   │───▶│Design Studio │───▶│   Save    │───▶│ Bag  │
└──────────┘    └──────────────┘    └───────────┘    └──┬───┘
                                                        │
                   ┌────────────────────────────────────┘
                   ▼
            ┌────────────┐    ┌─────────┐    ┌──────────────────┐
            │  Checkout  │───▶│ Payment │───▶│ Order            │
            │  (Address) │    │(UPI/COD)│    │ Confirmation     │
            └────────────┘    └─────────┘    └────────┬─────────┘
                                                      │
                                                      ▼
                                            ┌──────────────────┐
                                            │  Orders /        │
                                            │  Order Details   │
                                            │  (Tracking)      │
                                            └──────────────────┘
```

---

## 17. Project Structure

```
FashionForge/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection manager
│   ├── controllers/
│   │   ├── authController.js        # Registration, login, JWT issuing
│   │   ├── designController.js      # CRUD operations for saved designs
│   │   ├── cartController.js        # Shopping bag operations
│   │   ├── orderController.js       # Checkout, order retrieval, status tracking
│   │   └── paymentController.js     # UPI details, payment confirmation, COD
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification middleware
│   │   ├── errorHandler.js          # Global error formatting middleware
│   │   └── validateDesign.js        # Design payload validation
│   ├── models/
│   │   ├── User.js                  # User schema (name, email, passwordHash)
│   │   ├── Design.js                # Design schema (components, fabric, price)
│   │   ├── Cart.js                  # Cart schema (items, quantities, totals)
│   │   └── Order.js                 # Order schema (items, customer, tracking)
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth endpoints
│   │   ├── designRoutes.js          # /api/designs endpoints
│   │   ├── cartRoutes.js            # /api/cart endpoints
│   │   ├── orderRoutes.js           # /api/orders endpoints
│   │   └── paymentRoutes.js         # /api/payments endpoints
│   ├── services/
│   │   └── upiService.js            # UPI merchant configuration and URI builder
│   └── server.js                    # Express app entry point, routing, static serving
├── frontend/
│   ├── assets/
│   │   ├── icons/                   # PWA icons (192px, 512px, maskable, SVG)
│   │   ├── images/                  # UPI QR code image
│   │   ├── models/                  # Male and female croquis figure images (XS–4XL, front/back)
│   │   └── svg/                     # SVG garment component overlays (tops, bottoms, sleeves, collars)
│   ├── css/
│   │   └── style.css                # Complete design system (tokens, layout, components, responsive)
│   ├── js/
│   │   ├── renderer/
│   │   │   ├── renderer.js          # Main SVG rendering pipeline
│   │   │   ├── geometry.js          # Garment geometry path generators
│   │   │   ├── materials.js         # Fabric material profiles and colour harmonisation
│   │   │   ├── lighting.js          # Directional lighting and depth gradients
│   │   │   ├── garment-data.js      # Garment component catalogue and pricing engine
│   │   │   ├── size-data.js         # Size chart measurements (XS–4XL)
│   │   │   ├── body-profiles.js     # Body landmark coordinates for rendering
│   │   │   ├── croquis-calibration.js # Calibration utilities for figure alignment
│   │   │   └── qrcode.js           # QR code generation utility
│   │   ├── services/
│   │   │   ├── auth-service.js      # Login, registration, JWT token management
│   │   │   ├── auth-nav.js          # Navigation bar authentication state
│   │   │   ├── design-storage.js    # Design save, load, update, delete, duplicate
│   │   │   ├── cart-service.js      # Bag API client (add, update, remove, clear)
│   │   │   └── pwa.js              # Service worker registration
│   │   ├── app.js                   # Design Studio controller (state, UI, events)
│   │   ├── recommendation.js        # Rule-based recommendation engine
│   │   ├── auth.js                  # Login/register page controller
│   │   ├── cart.js                  # Bag page controller
│   │   ├── checkout.js              # Checkout page controller
│   │   ├── payment.js               # Payment page controller
│   │   ├── order-confirmation.js    # Order confirmation page controller
│   │   ├── orders.js                # Order history page controller
│   │   ├── order-details.js         # Order details page controller
│   │   └── my-designs.js            # My Designs page controller
│   ├── index.html                   # Home page
│   ├── design.html                  # Design Studio page
│   ├── my-designs.html              # My Designs page
│   ├── cart.html                    # Shopping Bag page
│   ├── checkout.html                # Checkout page
│   ├── payment.html                 # Payment page (UPI QR + COD)
│   ├── order-confirmation.html      # Order confirmation page
│   ├── orders.html                  # Order history page
│   ├── order-details.html           # Order details page
│   ├── login.html                   # Login and registration page
│   ├── offline.html                 # PWA offline fallback page
│   ├── manifest.webmanifest         # PWA manifest
│   └── service-worker.js            # Service worker for caching
├── tests/                           # Automated test suites
├── docs/
│   ├── DEPLOYMENT.md                # Deployment guide (Render + MongoDB Atlas)
│   ├── VIVA_NOTES.md                # Technical architecture notes
│   ├── VIVA_QA.md                   # Viva voce Q&A reference
│   └── archive/                     # Development planning documents
├── scripts/
│   └── generate_default_qr.cjs     # Utility to generate a placeholder UPI QR image
├── .env.example                     # Environment variable template
├── .gitignore                       # Git ignore rules
├── vercel.json                      # Vercel deployment configuration
└── package.json                     # Project metadata, dependencies, and scripts
```

---

## 18. Backend Architecture

The backend follows a layered architecture pattern:

### Entry Point
[`server.js`](backend/server.js) — Initialises Express, registers middleware, mounts API routes, serves frontend static files, and starts the HTTP server.

### Routes
Each route file defines the HTTP endpoints for a specific domain and delegates to the corresponding controller:
- [`authRoutes.js`](backend/routes/authRoutes.js) — Authentication endpoints
- [`designRoutes.js`](backend/routes/designRoutes.js) — Design CRUD endpoints (all protected)
- [`cartRoutes.js`](backend/routes/cartRoutes.js) — Shopping bag endpoints (all protected)
- [`orderRoutes.js`](backend/routes/orderRoutes.js) — Order and checkout endpoints (all protected)
- [`paymentRoutes.js`](backend/routes/paymentRoutes.js) — Payment endpoints (most protected)

### Controllers
Each controller contains the business logic for handling requests:
- [`authController.js`](backend/controllers/authController.js) — User registration, login, and profile retrieval
- [`designController.js`](backend/controllers/designController.js) — Create, read, update, delete designs with ownership enforcement
- [`cartController.js`](backend/controllers/cartController.js) — Add, update, remove, and clear bag items
- [`orderController.js`](backend/controllers/orderController.js) — Checkout processing, order retrieval, payment simulation, status advancement
- [`paymentController.js`](backend/controllers/paymentController.js) — UPI details generation, payment confirmation (UPI and COD), status queries, cancellation

### Middleware
- [`auth.js`](backend/middleware/auth.js) — Extracts and verifies the JWT from the `Authorization` header; attaches the authenticated user to the request
- [`validateDesign.js`](backend/middleware/validateDesign.js) — Validates design creation and update payloads (name, gender, size, components, fabric, colour, price)
- [`errorHandler.js`](backend/middleware/errorHandler.js) — Catches errors and returns consistent JSON error responses

### Services
- [`upiService.js`](backend/services/upiService.js) — Provides the merchant UPI ID, merchant name, QR image URL, and builds standard UPI payment URIs

### Configuration
- [`db.js`](backend/config/db.js) — Manages the MongoDB connection using Mongoose

---

## 19. Database Design

FashionForge uses MongoDB with four collections, each defined by a Mongoose model:

### User (`users` collection)

| Field | Type | Description |
|:---|:---|:---|
| `userId` | String | Unique user identifier (format: `FF-UXXXXX-XXXX`), auto-generated |
| `name` | String | User's display name |
| `email` | String | Unique email address (lowercase, validated) |
| `passwordHash` | String | bcrypt-hashed password (excluded from query results by default) |
| `createdAt` | Date | Account creation timestamp |
| `updatedAt` | Date | Last update timestamp |

### Design (`designs` collection)

| Field | Type | Description |
|:---|:---|:---|
| `designId` | String | Unique design identifier (format: `FF-DXXXXX-XXXX`) |
| `userId` | String | Owner's user ID |
| `name` | String | Design name (user-editable) |
| `gender` | String | `female` or `male` |
| `size` | String | Garment size (XS–4XL) |
| `top` | String | Top component ID (basic, crop, wrap, peplum) |
| `bottom` | String | Bottom component ID (skirt, straight, wide, trousers) |
| `sleeves` | String | Sleeve type (short, long, flare) |
| `collar` | String | Neckline type (round, vneck, square) |
| `fabric` | String | Fabric type (cotton, silk, denim, linen, chiffon) |
| `colour` | String | Colour hex code |
| `pattern` | String | Pattern type (solid, stripes, checks, floral, geometric, dots) |
| `price` | Number | Calculated total price |
| `notes` | String | Designer notes |
| `view` | String | Last viewed perspective (front or back) |
| `configuration` | Object | Full configuration snapshot |

### Cart (`carts` collection)

| Field | Type | Description |
|:---|:---|:---|
| `userId` | String | Owner's user ID (one cart per user) |
| `items` | Array | List of cart items |
| `items[].cartItemId` | String | Unique cart item identifier |
| `items[].designId` | String | Reference to the saved design |
| `items[].designName` | String | Design name at time of adding |
| `items[].quantity` | Number | Quantity (minimum 1) |
| `items[].unitPrice` | Number | Price per unit |
| `items[].totalPrice` | Number | quantity × unitPrice |
| `items[].configuration` | Object | Design configuration snapshot |

### Order (`orders` collection)

| Field | Type | Description |
|:---|:---|:---|
| `orderId` | String | Unique order identifier (format: `FF-ORD-XXXXX-XXXX`) |
| `userId` | String | Customer's user ID |
| `items` | Array | Ordered items with configuration snapshots |
| `subtotal` | Number | Sum of all item totals |
| `total` | Number | Order total |
| `customer` | Object | Delivery details (name, email, phone, address, city, state, postalCode) |
| `paymentStatus` | String | `pending`, `paid`, or `failed` |
| `paymentMethod` | String | `upi` or `cod` |
| `orderStatus` | String | `placed`, `processing`, `ready`, `shipped`, or `delivered` |
| `tracking` | Array | Status history entries with timestamps |
| `paidAt` | Date | Payment confirmation timestamp |

---

## 20. API Overview

### Health

| Method | Endpoint | Purpose |
|:---|:---|:---|
| GET | `/api/health` | Server health check with database connection status |

### Authentication

| Method | Endpoint | Purpose |
|:---|:---|:---|
| POST | `/api/auth/register` | Create a new user account |
| POST | `/api/auth/login` | Authenticate and receive a JWT |
| GET | `/api/auth/me` | Get the current authenticated user's profile |

### Designs (all require JWT)

| Method | Endpoint | Purpose |
|:---|:---|:---|
| GET | `/api/designs` | List all designs for the authenticated user |
| GET | `/api/designs/:id` | Get a specific design by ID |
| POST | `/api/designs` | Save a new design |
| PUT | `/api/designs/:id` | Update an existing design |
| DELETE | `/api/designs/:id` | Delete a design |

### Bag / Cart (all require JWT)

| Method | Endpoint | Purpose |
|:---|:---|:---|
| GET | `/api/cart` | Get the current user's bag |
| POST | `/api/cart/items` | Add a design to the bag |
| PUT | `/api/cart/items/:itemId` | Update item quantity |
| DELETE | `/api/cart/items/:itemId` | Remove an item from the bag |
| DELETE | `/api/cart` | Clear all items from the bag |

### Orders (all require JWT)

| Method | Endpoint | Purpose |
|:---|:---|:---|
| POST | `/api/orders/checkout` | Create an order from the current bag |
| GET | `/api/orders` | List all orders for the authenticated user |
| GET | `/api/orders/:orderId` | Get a specific order by ID |
| POST | `/api/orders/:orderId/pay` | Simulate payment processing |
| POST | `/api/orders/:orderId/advance-status` | Advance order to the next lifecycle stage |

### Payments

| Method | Endpoint | Auth | Purpose |
|:---|:---|:---|:---|
| GET | `/api/payments/config` | No | Get public merchant UPI configuration |
| GET | `/api/payments/:orderId/upi-details` | Yes | Get UPI details and dynamic URI for an order |
| POST | `/api/payments/:orderId/upi-qr` | Yes | Generate dynamic UPI QR data for an order |
| POST | `/api/payments/:orderId/confirm-upi` | Yes | Confirm UPI payment ("I've Completed Payment") |
| POST | `/api/payments/:orderId/cod` | Yes | Confirm Cash on Delivery |
| GET | `/api/payments/:orderId/status` | Yes | Check payment status for an order |
| POST | `/api/payments/:orderId/cancel` | Yes | Cancel payment (bag is preserved) |

---

## 21. Local Setup

### Prerequisites
- **Node.js** version 18 or later — [Download from nodejs.org](https://nodejs.org/)
- **MongoDB** — Either a local MongoDB instance or a free [MongoDB Atlas](https://cloud.mongodb.com/) cluster

### Steps

1. **Clone or open the repository:**
   ```bash
   git clone <repository-url>
   cd FashionForge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create the environment file:**

   Copy the example file and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with at minimum:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/fashionforge
   JWT_SECRET=<your-secure-random-string>
   UPI_ID=<your-upi-id@bank>
   MERCHANT_NAME=FashionForge
   ```

4. **(Optional) Replace the UPI QR code:**

   Replace `frontend/assets/images/upi-qr.png` with your actual merchant UPI QR image.

5. **Start the server:**
   ```bash
   npm start
   ```
   Or use the development alias:
   ```bash
   npm run dev
   ```

6. **Open the application:**

   Navigate to [http://localhost:5000](http://localhost:5000) in your browser.

---

## 22. Environment Variables

| Variable | Required | Purpose |
|:---|:---|:---|
| `PORT` | No | Server port (default: `5000`) |
| `NODE_ENV` | No | Environment mode (`production` for deployment) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key used to sign and verify JWTs. Use a long random string. |
| `JWT_EXPIRES_IN` | No | JWT expiry duration (default: `7d`) |
| `UPI_ID` | Yes | Merchant UPI ID displayed on the payment page (e.g., `yourname@upi`) |
| `MERCHANT_NAME` | No | Merchant display name (default: `FashionForge`) |
| `FRONTEND_URL` | No | Allowed CORS origin for the frontend |
| `API_BASE_URL` | No | Base URL for API calls (leave empty if frontend and backend share the same origin) |

**Example `.env` (with placeholders):**
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secure-random-string-min-32-characters>
JWT_EXPIRES_IN=7d
UPI_ID=<your-upi-id@bank>
MERCHANT_NAME=FashionForge
FRONTEND_URL=<your-deployed-url>
```

> **Important:** Never commit real credentials to the repository. The `.env` file is excluded from Git via `.gitignore`.

---

## 23. Testing

FashionForge includes automated test suites that cover design persistence, cart operations, order workflows, payment flows, and UI/PWA verification.

### Running the Test Suite

Ensure MongoDB is running and the server is accessible, then run:

```bash
npm test
```

This executes the following test files sequentially:
- `tests/test_phase7.js` — Design persistence, saved schema, My Designs operations
- `tests/test_phase8.js` — Additional design and rendering tests
- `tests/test_phase9.js` — Cart and checkout operations
- `tests/test_phase10.js` — Order workflow and lifecycle
- `tests/test_phase11.js` — Extended order and integration tests
- `tests/test_workflow.js` — End-to-end workflow verification
- `tests/test_ui_pwa.js` — UI structure and PWA manifest validation
- `tests/test_payment.js` — Payment flow (UPI and COD) tests

### Browser End-to-End Tests (Puppeteer)

Additional browser-based tests require Puppeteer and a running server:

```bash
node tests/test_browser_e2e_journey.cjs
node tests/test_browser_responsive_pwa.cjs
```

These tests automate browser interactions to verify the full user journey and responsive behaviour across different viewport sizes.

---

## 24. Deployment

FashionForge can be deployed as a single Node.js service that serves both the API and frontend.

### Recommended Approach

1. **Database:** Create a free MongoDB Atlas cluster at [cloud.mongodb.com](https://cloud.mongodb.com/) and obtain the connection string.

2. **Hosting:** Deploy the Node.js application on a platform such as [Render](https://render.com/) (free tier available):
   - Connect your GitHub repository.
   - Set the build command to `npm install` and the start command to `npm start`.
   - Configure environment variables in the hosting dashboard (see Section 22).

3. **UPI QR Code:** Replace `frontend/assets/images/upi-qr.png` with your merchant QR code before deploying.

4. **Environment Variables:** Set all required environment variables (`MONGODB_URI`, `JWT_SECRET`, `UPI_ID`) in the hosting platform's dashboard. Do not hardcode credentials.

For a detailed step-by-step guide, see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

> **Note:** On Render free tier, the service spins down after 15 minutes of inactivity. The first request after idle will take approximately 30 seconds.

---

## 25. Scope and Limitations

FashionForge is an academic project with a defined scope. The following are explicit limitations of the current implementation:

| Area | Limitation |
|:---|:---|
| **Garment Visualisation** | The 2.5D rendering is a layered SVG illustration with simulated depth. It is not a real-time 3D cloth simulation with physics. |
| **Augmented Reality** | There is no AR, webcam try-on, or body scanning feature. |
| **Recommendation Engine** | Recommendations are deterministic rule-based IF/THEN logic. There is no machine learning, AI, or data-driven model. |
| **Payment Gateway** | No third-party payment gateway is integrated. UPI confirmation is based on the user's manual declaration. |
| **Inventory and Shipping** | There is no real inventory management, stock tracking, or shipping carrier integration. Order tracking is simulated. |
| **Admin Dashboard** | There is no admin panel for managing users, orders, or products. |
| **Multi-currency / Multi-language** | Prices are in INR only. The interface is English only. |
| **Real Manufacturing** | The system does not connect to any garment manufacturing workflow. |

---

## 26. Future Enhancements

The following are potential future improvements, clearly labeled as **not currently implemented**:

- **Real 3D garment simulation** with physics-based cloth draping using WebGL or Three.js.
- **AI-assisted design recommendations** using machine learning trained on fashion datasets.
- **Third-party payment gateway integration** (Razorpay, Stripe) for verified online payments.
- **Inventory and shipping integration** with real carrier APIs for live tracking.
- **Measurement-based body fitting** using user-entered measurements for personalised garment sizing.
- **Social sharing** allowing users to share their designs publicly.
- **Admin dashboard** for order management, user analytics, and product catalogue administration.
- **Multi-currency and internationalisation** support.

---

## 27. Academic Project Summary

FashionForge demonstrates the following technical competencies in a single integrated application:

- **Interactive Web Application Development** — A multi-page, responsive web application with a rich interactive design interface built using vanilla HTML, CSS, and JavaScript.
- **Frontend Visualisation** — A custom SVG-based 2.5D rendering engine that combines vector geometry, material systems, lighting gradients, and pattern overlays to create real-time garment previews.
- **REST API Design** — A structured Express.js backend with organised routes, controllers, middleware, and services following a layered architecture pattern.
- **Database Persistence** — MongoDB with Mongoose schemas for users, designs, carts, and orders, with proper validation, indexing, and data integrity.
- **Authentication and Security** — Stateless JWT-based authentication, bcrypt password hashing, ownership-based access control, and server-side price validation to prevent client tampering.
- **Business Rule Logic** — A deterministic rule-based recommendation engine and a centralised pricing system that serves as the single source of truth for all cost calculations.
- **E-commerce Workflow** — A complete shopping flow from design creation through bag, checkout, payment, order confirmation, and tracking.
- **Progressive Web App** — Service worker caching, offline fallback, and installability via web app manifest.
