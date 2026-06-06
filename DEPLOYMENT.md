# MemoryMeet Deployment Guide

Complete walkthrough: **local validation first**, then **Render (backend) + Vercel (frontend)**.

---

## Phase 1: Local Validation (Always First)

### Step 1.1 — Start Hindsight Server (if using real Hindsight)

**Option A — Hindsight Cloud:** Sign up at https://ui.hindsight.vectorize.io, get your endpoint URL.

**Option B — Local Docker:**
```bash
docker run -it --pull always --name hindsight --restart unless-stopped \
  -p 8888:8888 -p 9999:9999 \
  -e HINDSIGHT_API_LLM_API_KEY=your_groq_key \
  -e HINDSIGHT_API_LLM_PROVIDER=groq \
  ghcr.io/vectorize-io/hindsight:latest
```
Hindsight UI: http://localhost:9999 · API: http://localhost:8888

**Option C — Skip Hindsight:** Leave `HINDSIGHT_BASE_URL` blank — SQLite memory fallback activates automatically.

---

### Step 1.2 — Backend local setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:
```env
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=sqlite:///./memorymeet.db
FRONTEND_URL=http://localhost:5173
HINDSIGHT_BASE_URL=http://localhost:8888    # or cloud URL, or leave blank
```

Start the server:
```bash
uvicorn app:app --reload --port 8000
```

### Step 1.3 — Verify backend locally

```bash
# Health check — shows Hindsight status
curl http://localhost:8000/health

# Add a meeting (triggers Hindsight retain)
curl -X POST http://localhost:8000/meeting \
  -H "Content-Type: application/json" \
  -d '{"contact_name":"Sarah Chen","company":"Acme Corp","role":"CTO","meeting_notes":"Concerned about security and SOC2. Budget 50k. Needs proposal by Friday."}'

# Generate brief (triggers Hindsight recall + Groq)
curl -X POST http://localhost:8000/brief \
  -H "Content-Type: application/json" \
  -d '{"contact_name":"Sarah Chen"}'

# Get insights (triggers Hindsight reflect + Groq)
curl -X POST http://localhost:8000/insights \
  -H "Content-Type: application/json" \
  -d '{"contact_name":"Sarah Chen","question":"What patterns does Sarah show?"}'
```

Expected `/health` with Hindsight enabled:
```json
{"status":"ok","service":"MemoryMeet API","hindsight":"enabled"}
```

### Step 1.4 — Frontend local setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit http://localhost:5173 and verify:
- [ ] Dashboard loads
- [ ] Add Meeting stores data
- [ ] Brief shows AI-generated content
- [ ] Insights returns pattern analysis

**Do not proceed to production until all local checks pass.**

---

## Phase 2: Backend Deployment on Render

### Step 2.1 — Push to GitHub

Push your project to a GitHub repository.

### Step 2.2 — Create Render Web Service

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app:app --host 0.0.0.0 --port $PORT` |

### Step 2.3 — Set Render Environment Variables

| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | Your Groq key from console.groq.com |
| `DATABASE_URL` | `sqlite:///./memorymeet.db` |
| `FRONTEND_URL` | Your Vercel URL (set after frontend deploy) |
| `HINDSIGHT_BASE_URL` | Your Hindsight Cloud endpoint URL (or leave blank) |

> **Hindsight on Render:** Use **Hindsight Cloud** for production (Option A).
> Self-hosted Hindsight requires a separate server — the Hindsight Cloud endpoint is the simplest choice for Render deployments.

> **SQLite on Render free tier:** Data resets on each deploy. For persistent storage, use Render's free PostgreSQL: create a PostgreSQL instance, copy the connection string, update `DATABASE_URL`, and add `psycopg2-binary` to `requirements.txt`.

### Step 2.4 — Deploy and verify

After deploy, note your URL (e.g. `https://memorymeet-backend.onrender.com`):

```bash
curl https://memorymeet-backend.onrender.com/health
# Expected: {"status":"ok","hindsight":"enabled"}

curl -X POST https://memorymeet-backend.onrender.com/meeting \
  -H "Content-Type: application/json" \
  -d '{"contact_name":"Test User","company":"Test Corp","role":"CTO","meeting_notes":"Security concerns. Budget 20k."}'
```

**Production backend checklist:**
- [ ] `/health` returns OK with hindsight status
- [ ] `POST /meeting` returns `memory_status: "saved"`
- [ ] `POST /brief` returns full brief JSON
- [ ] `POST /insights` returns insight text
- [ ] `GROQ_API_KEY` is set and valid
- [ ] `HINDSIGHT_BASE_URL` is set (or blank for fallback)
- [ ] `FRONTEND_URL` will match your Vercel domain

---

## Phase 3: Frontend Deployment on Vercel

### Step 3.1 — Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Confirm settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Step 3.2 — Set Vercel Environment Variable

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://memorymeet-backend.onrender.com` |

Redeploy after adding the variable.

### Step 3.3 — Update CORS on Render

Go back to Render → update `FRONTEND_URL` to your Vercel domain:
```
FRONTEND_URL=https://memorymeet.vercel.app
```

### Step 3.4 — Verify end-to-end

Open your Vercel URL and confirm:
- [ ] Dashboard shows stats from Render backend
- [ ] Add Meeting submits and stores memory in Hindsight
- [ ] Brief Generator returns AI brief backed by Hindsight recall
- [ ] Insights returns Hindsight reflect analysis
- [ ] Timeline shows meetings

---

## End-to-End Checklist

### Backend (Render)
- [ ] Service is running (Render dashboard shows green)
- [ ] `/health` returns `hindsight: enabled` (or fallback if not configured)
- [ ] `POST /meeting` triggers Hindsight retain
- [ ] `POST /brief` triggers Hindsight recall → Groq
- [ ] `POST /insights` triggers Hindsight reflect → Groq
- [ ] CORS allows Vercel domain

### Hindsight
- [ ] Hindsight server is running (Cloud or local)
- [ ] `/health` shows `"hindsight":"enabled"` (not fallback)
- [ ] `retain` is called on meeting save
- [ ] `recall` returns memories on brief generation
- [ ] `reflect` returns insights on pattern questions
- [ ] Memory improves with each new meeting added

### Frontend (Vercel)
- [ ] `VITE_API_BASE_URL` points to Render URL
- [ ] No CORS errors in browser console
- [ ] All pages load and function correctly

---

## Troubleshooting

### Hindsight shows "disabled (using SQLite fallback)"
- Check `HINDSIGHT_BASE_URL` is set in your `.env`
- Verify the Hindsight server is reachable: `curl http://localhost:8888/health`
- For Hindsight Cloud, confirm the endpoint URL from your dashboard

### `ModuleNotFoundError: No module named 'hindsight_client'`
```bash
pip install hindsight-client==0.7.2
```

### Groq `401 Unauthorized`
- Re-copy key from [console.groq.com](https://console.groq.com)
- Verify `GROQ_API_KEY` is set in `.env`

### `Connection refused` on port 8000
- Backend server is not running
- Open a new terminal and run: `uvicorn app:app --reload --port 8000`
- Keep that terminal open — the server must stay running

### Data resets on Render deploys (SQLite)
- Upgrade to Render paid plan with persistent disk, or
- Switch to PostgreSQL: create Render PostgreSQL → copy connection string → update `DATABASE_URL`

### CORS errors in browser
- Confirm `FRONTEND_URL` on Render exactly matches your Vercel domain
- No trailing slash: `https://memorymeet.vercel.app` ✓
