## BaadFaad / HisabSathi – Smart Bill Splitting Platform

BaadFaad (HisabSathi) is a **full‑stack bill splitting and settlement platform** designed for real‑world group payments in Nepal.  
It combines **AI-powered bill parsing**, **flexible split logic**, **real‑time sessions**, and a **PWA frontend** to remove the awkwardness of settling shared bills.

The system was originally built for a hackathon and has since been structured as a two‑part monorepo:

- **Backend**: `src/Backend/BaadFaad` – Node.js/Express + MongoDB + Socket.IO + Google Gemini bill parser
- **Frontend**: `src/Frontend/Baadfaad` – React (Vite) + Tailwind + PWA
- **Database**: Since we are using noSQL(MongoDB) and there is no need for seeding any data in the system the database folder is not included.

---

### Core Features

- **AI‑powered bill parsing**
  - Upload or scan a bill image; the backend uses **Google Gemini** (via `@google/genai`) to extract line items, subtotal, tax, and grand total  
  - Output is normalized JSON that feeds directly into the split engine

- **Flexible splitting engine**
  - Equal split, percentage‑based, custom amounts, and **item‑based** splits  
  - Central logic in `calculateSplit` computes per‑participant amounts and percentages from the parsed receipt

- **Group & session workflows**
  - Create/join **sessions** and **groups** for recurring friends/teams
  - Manage participants, track who has paid, and finalize settlements
  - Real‑time updates via **Socket.IO**

- **Nudges and email notifications**
  - Email delivery via **SMTP (Nodemailer)** for invitations, summaries, and payment reminders
  - Optional “nudge” flows to ping friends who haven’t settled yet

- **Modern PWA frontend**
  - Landing page with animated hero, feature highlights, and testimonials
  - Full **PWA install support** (`beforeinstallprompt`, app‑installed events, offline‑ready build)
  - Smooth scroll animations, counters, and polished UI throughout

- **Payment‑friendly UX for Nepal**
  - Designed around common friction points like “Rs. 7 change drama”
  - Visual emphasis on **eSewa** and **Khalti** as settlement channels (marketing & UX focus)

---

### Tech Stack

- **Backend (API & Realtime)**
  - Node.js + **Express 5**
  - **MongoDB** with **Mongoose**
  - **Socket.IO** for real‑time session updates
  - **JWT** authentication + **Passport Google OAuth 2.0**
  - **Nodemailer** + SMTP for email
  - **@google/genai** (Google Gemini) for bill parsing
  - `tesseract.js` available for OCR‑related tasks

- **Frontend (Web + PWA)**
  - **React 19** + **React Router 7**
  - **Vite 7** bundler/dev server
  - **Tailwind CSS 4** for design system & utility classes
  - `socket.io-client` for realtime
  - `react-hot-toast` for feedback toasts
  - `vite-plugin-pwa` for PWA assets and service worker

---

### Repository Structure

High‑level structure relevant to this system:

- `src/Backend/BaadFaad/`
  - `server.js` – Express entry point (HTTP + Socket.IO, route mounting)
  - `config/`
    - `database.js` – Mongo connection
    - `socket.js` – Socket.IO initialization
    - `passport.js`, `constants.js`, etc.
  - `routes/`
    - `authRoute.js` – auth & Google OAuth
    - `bill.routes.js` – bill upload / parsing
    - `group.routes.js` – group management
    - `mail.routes.js` – email utilities
    - `nudge.route.js` – nudge/reminder flows
    - `participant.routes.js` – participants in a session/split
    - `receipt.routes.js` – receipts and bill records
    - `session.route.js` – live split sessions
    - `split.routes.js` – split lifecycle (create, update, finalize, delete)
  - `controllers/` – per‑domain business logic (auth, groups, splits, mail, etc.)
  - `models/` – Mongoose models (`userModel`, `group.model`, `split.model`, `session.model`, `participant.model`, `receipt.model`, `nudge.model`)
  - `utils/`
    - `BillParsher.js` – AI bill parser using Google Gemini
    - `calculateSplit.js` – core split algorithms (equal / percentage / custom / item‑based)
    - `generateToken.js`, `response.js`, etc.
  - `templates/` – email templates (nudges, payment summary, welcome, etc.)
  - `package.json` – backend scripts and dependencies

- `src/Frontend/Baadfaad/`
  - `src/App.jsx` – main React tree + routing
  - `src/context/authContext.jsx` – global auth state (user, token, login/logout, loading)
  - `src/components/common/` – `ProtectedRoute`, `PublicRoute`, `Loader`, etc.
  - `src/components/layout/landing/` – `Topbar`, `Footer` for marketing pages
  - `src/components/layout/Dashboard/` – `SideBar`, `TopBar` for authenticated area
  - `src/pages/landing/` – `Landing`, `AboutUs`, `Contact`
  - `src/pages/Auth/` – `Login`, `AuthCallback`
  - `src/pages/Dashboard/` – `Home`, `JoinSession`
  - `src/pages/split/` – `CreateSplit`, `ScanBill`, `ReadyToSplit`, `JoinedParticipants`, `SplitBreakdown`, `SplitCalculated`
  - `src/pages/Group/` – `Group`, `Nudge`, `Settelment`
  - `src/config/` – environment config, Socket.IO client config
  - `vite.config.js`, `index.html`, `App.css`, `index.css`, etc.

- Root
  - `.env.example` – example environment config (backend‑focused)
  - `.env` – **local secrets (do not commit real values)**
  - `src/Backend/readme.md`, `src/Frontend/readme.md` – currently used as placeholders

---

### Environment Configuration

Environment variables are centralized via **root** `.env` / `.env.example`.  
Copy and edit as needed:

```bash
cp .env.example .env
```

**Variables (backend‑critical):**

- `PORT` – Backend HTTP port (default `5000`)
- `MONGO_URI` – MongoDB connection string (Atlas or local)
- `EMAIL_USER` / `EMAIL_PASS` – credentials for Nodemailer (e.g. Gmail app password)
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_MAIL` / `SMTP_PASS` – SMTP configuration
- `JWT_SECRET` – secret used for signing JWTs
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` – Google OAuth 2.0 credentials
- `GOOGLE_CALLBACK_URL` – OAuth callback (e.g. `http://localhost:5000/api/auth/google/callback`)
- `GOOGLE_API_KEY` – Google Gemini API key for AI bill parsing
- `QR_BASE_URL` – Base URL for QR/session links (typically the frontend URL, e.g. `http://localhost:5173`)

> **Security note:** The sample `.env` in this repository is for local development only.  
> Replace all sensitive keys with your own values and **never commit real production secrets**.

---

### Backend – Getting Started

From the project root:

```bash
cd src/Backend/BaadFaad
npm install
```

Then run the server in development mode:

```bash
npm run dev
```

This:

- Loads environment variables from `.env`
- Connects to MongoDB
- Starts Express on `PORT` (default `5000`)
- Initializes Socket.IO
- Mounts API routes under `/api/*`

Basic health check:

- Open `http://localhost:5000/` → should respond with `Server is running!`

**Production start:**

```bash
npm start
```

---

### Frontend – Getting Started

From the project root:

```bash
cd src/Frontend/Baadfaad
npm install
```

Run the development server:

```bash
npm run dev
```

By default, Vite will start on `http://localhost:5173`.  
The app includes:

- Landing/marketing pages at `/`
- Auth flow (`/login`, `/auth/callback`) using Google OAuth
- Dashboard & split flows behind protected routes (`/dashboard`, `/split/*`, `/group/*`)

**Frontend scripts:**

- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview production build locally
- `npm run lint` – run ESLint

---

### High‑Level API Overview

All backend APIs are mounted under `/api/*`. Key route groups:

- **`/api/auth`**
  - Google OAuth and JWT‑based authentication
  - Login, callback, token issuance

- **`/api/bills`**
  - Bill upload & parsing endpoints
  - Uses `BillParsher.js` (Google Gemini) to extract structured receipt data

- **`/api/splits`**
  - Create a split from a receipt
  - Retrieve/update a split
  - Mark participant payment status
  - Finalize a split and lock in amounts

- **`/api/session`**
  - Manage real‑time split sessions
  - Join/leave via links or QR

- **`/api/groups`**
  - Create and manage friend groups / squads
  - Group‑level settlements and history

- **`/api/participants`**
  - Participant CRUD within sessions/splits

- **`/api/receipts`**
  - Store and retrieve receipt data for splits

- **`/api/mail` & `/api/nudge`**
  - Emailing of invites, summaries, and nudges

Some routes are public (e.g. joining a split via link) while others are protected by JWT middleware (`protect`).

---

### Split Logic (Conceptual)

The core split engine lives in `utils/calculateSplit.js` and supports:

- **Equal split**
  - Total amount divided equally across participants (rounded to 2 decimals)

- **Percentage split**
  - Each participant specifies a percentage; amounts are derived from that

- **Custom amount split**
  - Direct amounts per person; percentages are derived for summaries

- **Item‑based split**
  - Each participant selects items they consumed; amounts are the sum of those items

The engine returns a breakdown array that is attached to a `Split` document, which the frontend then uses to render per‑person amounts and statuses.

---

### Authentication & Frontend Guarding

On the frontend:

- `AuthProvider` (`src/context/authContext.jsx`) manages:
  - `user`, `isAuthenticated`, `isLoading`
  - `login(user, token)` and `logout()`
  - Rehydrates from `localStorage` on load

- `ProtectedRoute` wraps routes that require authentication, redirecting to `/login` if unauthenticated.
- `PublicRoute` ensures some routes remain accessible only when logged out.

On the backend:

- JWTs are issued on successful login / OAuth and validated by `auth.middleware.js` (`protect`).
- Protected routes (e.g. some `/api/splits`, `/api/groups`) require a valid JWT.

---

### PWA & Installation

The landing page implements:

- Handling of the `beforeinstallprompt` event
- Detection of standalone mode / app‑installed state
- A prominent “Install BaadFaad on Your Phone” CTA section

In production builds:

- `vite-plugin-pwa` generates the service worker and manifest
- The app can be installed to the home screen and works offline for cached routes

---

### Development Tips

- Keep the **backend** and **frontend** running in separate terminals:
  - Backend: `cd src/Backend/BaadFaad && npm run dev`
  - Frontend: `cd src/Frontend/Baadfaad && npm run dev`
- Make sure `QR_BASE_URL` in `.env` matches your frontend base URL.
- For AI bill parsing to work, configure `GOOGLE_API_KEY` with a valid Gemini key.
- For Google OAuth to work, set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL`, and configure the same callback URL in the Google Cloud Console.

---

### Future Improvements / Ideas

- Deeper integration with payment gateways (e.g. direct hand‑off to eSewa/Khalti APIs)
- Exportable split reports (PDF/CSV)
- More detailed analytics for frequent groups/sessions
- Admin dashboard for monitoring active sessions and error logs

---

### License

This project was created for hackathon use and internal experimentation.  
Before using it in production, review the code, update all secrets, and apply your own license and compliance checks as needed.
