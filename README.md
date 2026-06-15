# MemoryMeet

> AI Meeting Preparation Agent That Learns Every Interaction Using Hindsight

MemoryMeet is a memory-first AI meeting preparation agent. It stores meeting notes as long-term memory using the **real Hindsight SDK**, recalls prior context, identifies recurring concerns and commitments, and generates personalized meeting prep briefs that improve over time.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS + Axios |
| Backend | FastAPI + SQLAlchemy + Pydantic |
| LLM | Groq (`qwen/qwen3-32b`) |
| Memory | **Hindsight** (`hindsight-client` — real SDK) |
| Database | SQLite |
| Deployment | Frontend → Vercel · Backend → Render |

---

## Project Structure

```
memorymeet/
├── frontend/
│   ├── src/
│   │   ├── components/   Navbar, MetricCard
│   │   ├── pages/        Dashboard, AddMeeting, Brief, Insights, Timeline
│   │   ├── services/     api.js (Axios)
│   │   ├── App.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
└── backend/
    ├── app.py
    ├── database.py
    ├── models.py
    ├── schemas.py
    ├── hindsight_service.py   ← Real Hindsight SDK integration
    ├── groq_service.py
    ├── routes/
    │   ├── meetings.py
    │   ├── briefs.py
    │   └── insights.py
    ├── requirements.txt
    └── .env.example
```

---

## Hindsight Memory — How It Works

MemoryMeet uses the **real Hindsight SDK** from [vectorize.io](https://hindsight.vectorize.io).

### Hindsight Operations Used

| Operation | When | What it does |
|-----------|------|-------------|
| `retain()` | After each meeting is saved | Stores structured meeting memory in Hindsight |
| `recall()` | When generating a brief | Retrieves all memories for a contact |
| `reflect()` | When answering an insight question | Deep pattern analysis across all memories |

### Memory Flow

```
Add Meeting → hindsight.retain(bank_id="sarah-chen", content="Meeting notes...")
                     ↓
Generate Brief → hindsight.recall(bank_id="sarah-chen", query="All concerns and promises")
                     ↓
                 Send recalled context to Groq → Personalized brief
                     ↓
Ask Insight → hindsight.reflect(bank_id="sarah-chen", query="What patterns does Sarah show?")
```

Each contact gets their own **Hindsight memory bank** (bank_id = sanitized contact name).

---

## Setup

### Step 1 — Get API Keys

**Groq (required):**
1. Go to [console.groq.com](https://console.groq.com)
2. Create API key
3. Save as `GROQ_API_KEY`

**Hindsight (choose one option):**

**Option A — Hindsight Cloud (easiest, no server needed):**
1. Sign up at [ui.hindsight.vectorize.io](https://ui.hindsight.vectorize.io)
2. Create a project and get your endpoint URL
3. Set `HINDSIGHT_BASE_URL` to your cloud endpoint

**Option B — Self-hosted local (for development):**
```bash
# Requires Docker on your machine
docker run -it --pull always --name hindsight --restart unless-stopped \
  -p 8888:8888 -p 9999:9999 \
  -e HINDSIGHT_API_LLM_API_KEY=$GROQ_API_KEY \
  -e HINDSIGHT_API_LLM_PROVIDER=groq \
  ghcr.io/vectorize-io/hindsight:latest
```
Then set `HINDSIGHT_BASE_URL=http://localhost:8888`

**Option C — No Hindsight (SQLite fallback):**
Leave `HINDSIGHT_BASE_URL` blank — the app will use the built-in SQLite memory layer automatically.

---

### Step 2 — Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your keys
uvicorn app:app --reload --port 8000
```

**`.env` (backend):**
```env
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=sqlite:///./memorymeet.db
FRONTEND_URL=http://localhost:5173
HINDSIGHT_BASE_URL=http://localhost:8888   # or Hindsight Cloud URL, or leave blank
```

---

### Step 3 — Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

**`.env` (frontend):**
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Verify Hindsight is Connected

After starting the backend:
```bash
curl http://localhost:8000/health
```

**Hindsight enabled:**
```json
{"status": "ok", "hindsight": "enabled"}
```

**Using SQLite fallback:**
```json
{"status": "ok", "hindsight": "disabled (using SQLite fallback)"}
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check + Hindsight status |
| GET | `/stats` | Dashboard statistics |
| GET | `/contacts` | List all contacts |
| GET | `/meetings/{name}` | Meeting history for a contact |
| POST | `/meeting` | Add meeting → Hindsight retain |
| POST | `/brief` | Brief → Hindsight recall + Groq |
| POST | `/insights` | Insights → Hindsight reflect + Groq |

---

## Environment Variables

### Backend `.env`
```env
GROQ_API_KEY=             # Required — from console.groq.com
DATABASE_URL=             # Required — sqlite:///./memorymeet.db
FRONTEND_URL=             # Required — your frontend URL
HINDSIGHT_BASE_URL=       # Optional — Hindsight server URL
```

### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Deployment

See **DEPLOYMENT.md** for the full Vercel + Render walkthrough.

---

## License

MIT

---
## Development Team

* **[Friend 1 Name]** ([@Username](https://github.com/)) — Lead AI Engineer & System Architect
* **[Your Name]** ([@YourUsername](https://github.com/)) — Backend Engineer & API Developer
* **[Friend 3 Name]** ([@Username](https://github.com/)) — Frontend Engineer & UI Designer
* **[Friend 4 Name]** ([@Username](https://github.com/)) — DevOps & Prompt Engineer
