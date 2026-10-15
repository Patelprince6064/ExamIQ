# 🚀 Deployment Guide: Render (Backend) & Vercel (Frontend)

This guide walks you through deploying **ExamIQ** with the **Backend on Render** and the **Frontend on Vercel**.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:
1. A [GitHub](https://github.com/) account (Repository: `https://github.com/Patelprince6064/ExamIQ`).
2. A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (cloud database for Render).
3. A free [Render](https://render.com/) account.
4. A free [Vercel](https://vercel.com/) account.

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Cloud Database)

Since Render runs in the cloud, it cannot connect to your local `localhost:27017` database.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Create a free cluster (**M0 Free Tier**).
3. In **Database Access**:
   - Create a database user (e.g. `examiq_admin` with a strong password).
4. In **Network Access**:
   - Click **Add IP Address** -> Select **Allow Access from Anywhere** (`0.0.0.0/0`).
5. In **Database** -> Click **Connect** -> Choose **Drivers (Node.js)**:
   - Copy the connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ai-exam-prep?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials.

---

## ⚙️ Step 2: Deploy Backend to Render

1. Log in to [Render](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `Patelprince6064/ExamIQ`.
4. Configure the Web Service settings:
   - **Name**: `examiq-backend` (or your choice)
   - **Region**: Choose the closest region (e.g., *Singapore*, *Oregon*, or *Frankfurt*)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`

5. Under **Environment Variables**, add:
   | Key | Value | Notes |
   |---|---|---|
   | `PORT` | `5000` | (Render also auto-assigns PORT) |
   | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string from Step 1 |
   | `JWT_SECRET` | `your_super_strong_jwt_secret_key_2026` | Any secure random string |
   | `JWT_EXPIRES_IN` | `7d` | Token lifetime |
   | `CLIENT_URL` | `https://your-frontend.vercel.app` | *Leave as `*` or update after Step 3* |
   | `GROQ_API_KEY` | `gsk_...` | *(Optional)* If using online Groq AI completions |

6. Click **Deploy Web Service**.
7. Wait 2-3 minutes for the build to finish. Once live, copy your backend URL:
   ```
   https://examiq-backend.onrender.com
   ```
   *(Test it in your browser: visiting `https://examiq-backend.onrender.com/` should show: `{ "status": "✅ AI Exam Prep Backend Running" }`)*

---

## 🌐 Step 3: Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `Patelprince6064/ExamIQ`.
4. Configure the project:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: Click **Edit** and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. Expand **Environment Variables** and add:
   | Key | Value |
   |---|---|
   | `REACT_APP_API_URL` | `https://examiq-backend.onrender.com` *(Paste your Render backend URL from Step 2 without a trailing slash)* |
   | `CI` | `false` |

6. Click **Deploy**.
7. Vercel will build and deploy the React application. Once completed, you will receive your live domain:
   ```
   https://examiq.vercel.app
   ```

---

## 🔄 Step 4: Final Connection (CORS Update)

Now that you have your live Vercel domain:
1. Go back to [Render Dashboard](https://dashboard.render.com/) -> `examiq-backend` -> **Environment**.
2. Update `CLIENT_URL` to your Vercel URL (e.g. `https://examiq.vercel.app`).
   - The backend enforces a CORS allowlist: exact matches of `CLIENT_URL`
     (comma-separated for multiple origins) plus `https://examiq*.vercel.app`
     preview deployments. Any other origin gets `403 Origin not allowed`.
   - Multiple origins example: `https://examiq-prep.vercel.app,http://localhost:3000`
3. Render will automatically redeploy the service with updated environment variables.

---

## 🛠️ Verification & Testing

1. Open your Vercel URL in your browser: `https://examiq.vercel.app`.
2. Register a new user account.
3. Test **AI Chat & Tutor**: Ask a question (e.g., "Explain Deadlock avoidance").
4. Test **PDF Upload**: Upload lecture notes (up to 50MB) and click "Generate Quiz".
5. Test **Paper Analyzer**: Upload an exam paper to extract high-frequency topics.

---

## 💡 Important Notes

- **Render Free Tier Spin-down**: Free Render Web Services spin down after 15 minutes of inactivity. The first request after idle can take ~30-50 seconds to wake up (Render's standard cold start).
- **Persistent Storage**: Uploaded files on Render are stored in temporary instance disk. For production storage at scale, files can be streamed to AWS S3 or Cloudinary.

## 🧰 Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `403 Origin not allowed` from API | `CLIENT_URL` on Render doesn't match the Vercel domain | Set `CLIENT_URL` to the exact Vercel URL (no trailing slash); redeploy backend |
| Frontend calls go to `localhost` in production | `REACT_APP_API_URL` missing at Vercel build time | Set `REACT_APP_API_URL=https://<backend>.onrender.com` in Vercel → **Redeploy** (CRA embeds it at build time) |
| `500 Server configuration error` on login | `JWT_SECRET` missing on Render | Set a long random `JWT_SECRET` in Render env vars |
| First API call slow (~30-50s) | Render free-tier cold start | Expected; retry once. Consider paid instance for production SLA |
| Uploads disappear after redeploy | Render ephemeral disk | Expected on free tier; use S3/Cloudinary for persistence |
| `JWT_SECRET` / `MONGO_URI` confusion locally | `.env` not loaded | Backend reads `MONGO_URI` (or `MONGODB_URI`) + `JWT_SECRET` from `backend/.env`; never commit that file |
