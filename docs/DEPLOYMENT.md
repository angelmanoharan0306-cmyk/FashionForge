# FashionForge — Deployment Guide

FashionForge is a Node.js + Express backend that also serves the static frontend.
The recommended deployment target is **Render** (free tier available), with **MongoDB Atlas** for the database.

---

## 1. MongoDB Atlas Setup

1. Sign up at https://cloud.mongodb.com
2. Create a free **M0 Shared** cluster.
3. Under **Database Access**, create a new user with Read/Write access. Note the username and password.
4. Under **Network Access**, add `0.0.0.0/0` to allow connections from your hosting provider.
5. From the cluster dashboard, click **Connect → Drivers** and copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/fashionforge?retryWrites=true&w=majority
   ```

---

## 2. Deploy on Render (Recommended)

Render hosts Node.js apps and can serve both the backend API and static frontend from a single service.

### Steps

1. Go to https://render.com and create an account.
2. Click **New → Web Service** and connect your GitHub repository.
3. Configure the service:

| Setting | Value |
| :--- | :--- |
| **Environment** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Node Version** | 18 (or later) |

4. Add the following **Environment Variables** in the Render dashboard:

| Variable | Value |
| :--- | :--- |
| `PORT` | `10000` (Render assigns this automatically via `$PORT`) |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random string (min 32 characters) |
| `JWT_EXPIRES_IN` | `7d` |
| `UPI_ID` | Your merchant UPI ID (e.g. `name@okhdfcbank`) |
| `MERCHANT_NAME` | `FashionForge` |
| `FRONTEND_URL` | Your Render app URL (e.g. `https://fashionforge.onrender.com`) |

5. Click **Deploy**. Render will build and start the server.
6. Your app will be live at `https://<your-service-name>.onrender.com`.

> **Note:** On Render free tier, the service spins down after 15 minutes of inactivity. The first request after idle will take ~30 seconds to respond.

---

## 3. UPI QR Code

The UPI QR code is a static image file at:
```
frontend/assets/images/upi-qr.png
```

Replace this file with your actual merchant UPI QR code before deploying. After replacing, commit and push the file — it will be included in the next deployment automatically.

---

## 4. Environment Variables Reference

See `.env.example` in the repository root for the full reference with descriptions.

| Variable | Required | Description |
| :--- | :--- | :--- |
| `PORT` | Yes | Server port (default: 5000) |
| `NODE_ENV` | Yes | Set to `production` for deployment |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT signing (keep private) |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `UPI_ID` | Yes | Merchant UPI ID shown on payment page |
| `MERCHANT_NAME` | No | Merchant display name (default: `FashionForge`) |
| `FRONTEND_URL` | No | Allowed CORS origin for the frontend |
| `API_BASE_URL` | No | Base URL for API calls (leave empty if frontend and backend share the same origin) |

---

## 5. Alternative: Railway

1. Go to https://railway.app and connect your GitHub repository.
2. Railway auto-detects Node.js. Set the same environment variables as listed above.
3. Railway assigns a public URL automatically.

---

## 6. Custom Domain (Optional)

Both Render and Railway support custom domains. Add a `CNAME` record in your DNS provider pointing to the platform-provided URL. Configure `FRONTEND_URL` to match your custom domain.
