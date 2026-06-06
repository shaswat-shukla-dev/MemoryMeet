from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from database import engine, Base
from routes import meetings, briefs, insights
from hindsight_service import HINDSIGHT_ENABLED

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MemoryMeet API", version="1.0.0")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:5173", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings.router, tags=["meetings"])
app.include_router(briefs.router, tags=["briefs"])
app.include_router(insights.router, tags=["insights"])


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "MemoryMeet API",
        "hindsight": "enabled" if HINDSIGHT_ENABLED else "disabled (using SQLite fallback)",
    }


@app.get("/")
def root():
    return {"message": "MemoryMeet API is running"}
