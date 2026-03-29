# Antariksh Command Console

Mission-control styled full-stack app for asteroid awareness: live 3D orbital canvas, community feeds, research publishing, watchlists, and notification system (desktop, in-app, email, SMS ready). Frontend is Vite/React with R3F; backend is Node/Express + MongoDB + Cloudinary + mailer.

## Stack
- Frontend: React 18, Vite, Tailwind, React Three Fiber + Drei, Postprocessing
- Backend: Node/Express, MongoDB/Mongoose, Multer + Cloudinary, Nodemailer
- Auth/State: JWT + protected API routes, local notification store

## Quick Start
1) Install deps  
   - `cd backend && npm install`  
   - `cd ../Frontend && npm install`
2) Env setup: copy `.env.example` in each folder to `.env`, fill values (see Env Vars).
3) Run dev: terminal A `cd backend && npm run dev`; terminal B `cd Frontend && npm run dev`.
4) Open frontend at Vite URL (default http://localhost:5173).

## Env Vars (backend)
- `MONGO_URI` – Mongo connection string
- `JWT_SECRET` – auth signing key
- Cloudinary: either `CLOUDINARY_URL` or trio `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
- Mail: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, optional `SMTP_FROM`
- `VITE_NASA_API_KEY` (frontend reads via Vite proxyed build-time)

## Env Vars (frontend)
- `VITE_API_BASE_URL` – points to backend (e.g., http://localhost:5000/api)
- `VITE_NASA_API_KEY` – optional override for NEO feed (falls back to DEMO_KEY)

## Key Features
- 3D Orbital Canvas: live NASA NEO feed, selectable planets/asteroids, cinematic lighting, target detail card.
- Community Hub: posts with media (img/video/pdf), likes/comments, per-asteroid threads.
- Research Facility: upload/publish PDF papers per asteroid; profile archive + notifications.
- DataHub Watchlist: user-private saved asteroids, refresh-stable.
- Notifications: in-app bell with storage; desktop notifications with permission; email/SMS preference toggles ready for backend wiring.
- Media: Cloudinary-backed uploads with size/type filtering.

## Scripts
- Backend: `npm run dev` (nodemon), `npm run lint`
- Frontend: `npm run dev`, `npm run build`, `npm run preview`

## Testing / Checks
- Lint: `cd backend && npm run lint` (if configured), `cd Frontend && npm run build` for type/bundle sanity.
- No automated tests included yet; manual flows: auth login, community post with media, research publish PDF, watchlist save, notifications toggles.

## Deployment Notes
- Set all env vars; ensure Cloudinary + SMTP reachable from host.
- Serve frontend build (`Frontend/dist`) via CDN or static host; backend runs separately on Node.
- Configure CORS/API base URL to match deployed domains.

## Paths of Interest
- Frontend: `Frontend/src/features/3D/ThreeDView.jsx`, `Frontend/src/features/Community/CommunityRegistry.jsx`, `Frontend/src/features/ResearchLab/ResearchLab.jsx`, `Frontend/src/features/DataHub/DataHub.jsx`, `Frontend/src/features/Settings/SettingsPage.jsx`
- Backend: `backend/src/controllers/communityController.js`, `backend/src/controllers/researchController.js`, `backend/src/controllers/watchlistController.js`, `backend/src/config/cloudinary.js`, `backend/src/services/emailService.js`

## Roadmap Ideas
- Per-user backend notification store (sync across devices); SMS sender hook.
- Texture assets for planets/asteroids to further raise visual fidelity without external fetches.
- Automated tests for uploads, permissions, and notification preferences.
