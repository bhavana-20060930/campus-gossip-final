# CampusGossip 📌

A college-only social feed, inspired by the "campus gossip app" trope from K-dramas. Students log in with their **roll number** (pre-approved by an admin), and can post, comment, and like on a feed scoped only to their own college — like a digital corkboard/notice board for their campus.

Built as a full-stack MERN (MongoDB, Express, React, Node) project — good fit for a college major project submission.

---

## How it works

1. **Admin** uploads a CSV of valid roll numbers for the college (or adds them one by one), setting a shared **default password** for the whole batch (e.g. `vvit@123`). These students are created already "active" with that default password.
2. **Student** logs in with their roll number + college code + the default password everyone was given.
3. On that first login, the app forces them to a **"Set your password"** screen before they can see anything else — they pick their own password, and from then on they log in with that instead. This is enforced both in the UI and on the backend (any post/comment/like request is blocked with a 403 until the password has been changed).
4. After that, they see a **feed scoped to their own college only** — they can post, like, and comment using their real name/roll number (as you chose — no anonymity).
5. Posts look like sticky notes pinned to a corkboard, matching the "campus notice board" theme.

---

## Tech stack

- **Frontend:** React (Vite), React Router, Axios, plain CSS (no framework)
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt for password hashing, Multer + csv-parser for roll number CSV uploads

---

## Project structure

```
campus-gossip/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── models/                # Student, Post, Comment schemas
│   ├── controllers/           # Route logic (auth, admin, posts, comments)
│   ├── routes/                # Express routers
│   ├── middleware/auth.js     # JWT verification (student + admin)
│   ├── server.js              # App entry point
│   └── sample-rolllist.csv    # Example CSV for testing admin upload
└── frontend/
    └── src/
        ├── pages/              # Login, Signup, Feed, PostDetail, Profile, Admin*
        ├── components/         # Navbar, PostCard, ProtectedRoute
        ├── context/            # AuthContext (student session)
        └── api/axios.js        # API client with auth token interceptor
```

---

## Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally, or a free MongoDB Atlas cluster

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/campus_gossip
JWT_SECRET=some_long_random_string
ADMIN_SECRET=pick_a_secret_only_the_admin_knows
DEFAULT_STUDENT_PASSWORD=vvit@123
CLIENT_URL=http://localhost:5173
```

`DEFAULT_STUDENT_PASSWORD` is just the fallback if the admin doesn't type one in on the upload form — the admin dashboard lets you set/override this per upload anyway.

Run it:
```bash
npm run dev      # with nodemon, auto-restarts
# or
npm start
```

Server runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

(If your backend runs somewhere other than `localhost:5000`, create a `.env` file in `frontend/` with `VITE_API_URL=http://your-backend-url/api`.)

---

## Trying it out

1. Go to `http://localhost:5173/admin` and log in with the `ADMIN_SECRET` you set in `.env`.
2. Upload `backend/sample-rolllist.csv` (has 5 sample VVITU students), leaving the default password as `vvit@123` (or set your own).
3. Go to `http://localhost:5173/login`, enter one of those roll numbers (e.g. `21A91A0501`), college `VVITU`, and password `vvit@123`.
4. You'll immediately be asked to set your own password — do that, and you're in. Post something, like it, comment on it. Log in with a second roll number in another tab to see interactions between two students.

---

## Notes for your project report / viva

- **Roll number whitelisting**: only an admin can add valid roll numbers, so random people can't self-register — this simulates real college portal access control.
- **Shared default password, forced change**: every whitelisted student starts on the same admin-set password, but is blocked from doing anything else in the app (post/comment/like all return `403 PASSWORD_CHANGE_REQUIRED`) until they set their own. This is enforced server-side, not just hidden in the UI.
- **College scoping**: every student, post, and comment carries a `college` field, so the same app can serve multiple colleges without their feeds mixing.
- **Security**: passwords (default and self-chosen) are hashed with bcrypt, sessions use JWTs, and each API route checks the token before returning data.
- **Possible extensions** if you want to add more for the demo: image upload to cloud storage (currently just takes an image URL), notifications, hashtags/trending topics, report/flag a post, direct messages, dark mode.

---

## Known limitations (good to mention if asked in viva)

- Everyone starts on the **same** default password until they change it — anyone who knows a classmate's roll number could log into their account before they've changed it. Worth mentioning you're aware of this trade-off (it's why the password-change is forced immediately, not optional).
- Image posts use a direct URL rather than file upload — swapping in Cloudinary/S3 would be a natural next step.
- No rate limiting on posts/comments — could add `express-rate-limit` for a production version.
