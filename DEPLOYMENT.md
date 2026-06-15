# MemoryMeet Deployment Guide

Complete walkthrough: **local validation first**, then **Render (backend) + Vercel (frontend)**.

---

## Phase 1: Local Validation (Always First)

### Step 1.1 — Configure Hindsight Memory

MemoryMeet supports three memory configurations:

### Option A — Hindsight Cloud (Recommended)

1. Sign up at https://ui.hindsight.vectorize.io
2. Create a workspace/project
3. Copy your endpoint URL
4. Use it as `HINDSIGHT_BASE_URL`

### Option B — Local Docker

```bash
docker run -it --pull always --name hindsight --restart unless-stopped \
  -p 8888:8888 -p 9999:9999 \
  -e HINDSIGHT_API_LLM_API_KEY=your_groq_key \
  -e HINDSIGHT_API_LLM_PROVIDER=groq \
  ghcr.io/vectorize-io/hindsight:latest
```

Available endpoints:

| Service | URL |
|----------|----------|
| Hindsight API | http://localhost:8888 |
| Hindsight Dashboard | http://localhost:9999 |

Verify:

```bash
curl http://localhost:8888/health
```

### Option C — SQLite Fallback

Leave `HINDSIGHT_BASE_URL` blank.

MemoryMeet automatically falls back to SQLite memory storage.

---

### Step 1.2 — Backend Local Setup

```bash
cd backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

cp .env.example .env
```

Update `.env`:

```env
GROQ_API_KEY=your_groq_api_key

DATABASE_URL=sqlite:///./memorymeet.db

FRONTEND_URL=http://localhost:5173

# Hindsight Cloud URL or local URL
# Leave blank for SQLite fallback
HINDSIGHT_BASE_URL=http://localhost:8888
```

Start backend:

```bash
uvicorn app:app --reload --port 8000
```

Backend URL:

```text
http://localhost:8000
```

---

### Step 1.3 — Verify Backend

#### Health Check

```bash
curl http://localhost:8000/health
```

Expected:

```json
{
  "status": "ok",
  "service": "MemoryMeet API",
  "hindsight": "enabled"
}
```

#### Create Meeting

```bash
curl -X POST http://localhost:8000/meeting \
  -H "Content-Type: application/json" \
  -d '{
    "contact_name":"Sarah Chen",
    "company":"Acme Corp",
    "role":"CTO",
    "meeting_notes":"Concerned about security and SOC2. Budget 50k. Needs proposal by Friday."
  }'
```

Expected:

```json
{
  "memory_status":"saved"
}
```

#### Generate Brief

```bash
curl -X POST http://localhost:8000/brief \
  -H "Content-Type: application/json" \
  -d '{
    "contact_name":"Sarah Chen"
  }'
```

Flow:

```text
Hindsight Recall → Groq LLM
```

#### Generate Insights

```bash
curl -X POST http://localhost:8000/insights \
  -H "Content-Type: application/json" \
  -d '{
    "contact_name":"Sarah Chen",
    "question":"What patterns does Sarah show?"
  }'
```

Flow:

```text
Hindsight Reflect → Groq LLM
```

---

### Step 1.4 — Frontend Local Setup

```bash
cd frontend

npm install

cp .env.example .env

npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

### Local Validation Checklist

- [ ] Backend starts successfully
- [ ] Frontend loads successfully
- [ ] `/health` returns OK
- [ ] Add Meeting stores data
- [ ] Brief Generator returns AI-generated content
- [ ] Insights returns analysis
- [ ] No CORS errors in browser console
- [ ] Hindsight status is correct

> Do not proceed to deployment until all local checks pass.

---

## Phase 2: Backend Deployment (Render)

### Step 2.1 — Push to GitHub

```bash
git add .
git commit -m "Production deployment"
git push origin main
```

### Step 2.2 — Create Render Web Service

| Setting | Value |
|----------|----------|
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app:app --host 0.0.0.0 --port $PORT` |

### Step 2.3 — Environment Variables

| Key | Value |
|------|------|
| `GROQ_API_KEY` | Your Groq API key |
| `DATABASE_URL` | `sqlite:///./memorymeet.db` |
| `FRONTEND_URL` | Your Vercel URL |
| `HINDSIGHT_BASE_URL` | Hindsight endpoint URL |

Example:

```env
GROQ_API_KEY=gsk_xxxxx

DATABASE_URL=sqlite:///./memorymeet.db

FRONTEND_URL=https://memorymeet.vercel.app

HINDSIGHT_BASE_URL=https://your-hindsight-endpoint
```

### PostgreSQL Recommendation

SQLite is not persistent on Render free instances.

For production:

1. Create a Render PostgreSQL database
2. Copy the connection string
3. Replace `DATABASE_URL`
4. Add:

```txt
psycopg2-binary
```

Example:

```env
DATABASE_URL=postgresql://user:password@host/database
```

### Step 2.4 — Verify Deployment

```bash
curl https://memorymeet-backend.onrender.com/health
```

Create test meeting:

```bash
curl -X POST https://memorymeet-backend.onrender.com/meeting \
  -H "Content-Type: application/json" \
  -d '{
    "contact_name":"Test User",
    "company":"Test Corp",
    "role":"CTO",
    "meeting_notes":"Security concerns. Budget 20k."
  }'
```

### Backend Checklist

- [ ] Render service running
- [ ] Health endpoint responding
- [ ] Groq key configured
- [ ] Hindsight configured
- [ ] Meeting endpoint working
- [ ] Brief endpoint working
- [ ] Insights endpoint working
- [ ] CORS configured correctly

---

## Phase 3: Frontend Deployment (Vercel)

### Step 3.1 — Create Vercel Project

| Setting | Value |
|----------|----------|
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### Step 3.2 — Environment Variables

```env
VITE_API_BASE_URL=https://memorymeet-backend.onrender.com
```

Redeploy after saving.

### Step 3.3 — Update Backend CORS

Render environment variable:

```env
FRONTEND_URL=https://memorymeet.vercel.app
```

Correct:

```text
https://memorymeet.vercel.app
```

Incorrect:

```text
https://memorymeet.vercel.app/
```

### Step 3.4 — End-to-End Verification

- [ ] Dashboard loads
- [ ] Statistics load
- [ ] Add Meeting works
- [ ] Timeline works
- [ ] Brief generation works
- [ ] Insights generation works
- [ ] No browser console errors

---

## Architecture

```text
Frontend (Vercel)
        │
        ▼
Backend API (Render)
        │
        ├── Groq LLM
        │
        └── Hindsight Memory
                │
                ├── Hindsight Cloud
                └── SQLite Fallback
```

---

## Troubleshooting

### Hindsight Shows Disabled

```bash
curl http://localhost:8888/health
```

Verify:

- `HINDSIGHT_BASE_URL` is configured
- Hindsight service is running
- Endpoint is reachable

### Missing Hindsight Client

```bash
pip install hindsight-client==0.7.2
```

### Groq 401 Unauthorized

Verify:

- API key is valid
- `GROQ_API_KEY` is configured correctly
- No extra spaces or quotes

### Connection Refused on Port 8000

```bash
uvicorn app:app --reload --port 8000
```

### SQLite Data Resets

Expected on Render free instances.

Solutions:

- Use PostgreSQL
- Use Render persistent disk

### CORS Errors

Verify:

```env
FRONTEND_URL=https://memorymeet.vercel.app
```

Checklist:

- HTTPS enabled
- No trailing slash
- Exact Vercel URL match

---

## Deployment Rule

**Always validate locally first.**

If something fails locally, fix it before deploying to Render or Vercel.
