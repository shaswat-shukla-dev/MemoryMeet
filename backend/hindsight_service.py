"""
Hindsight Memory Service — Real Hindsight SDK (hindsight-client)
Docs: https://hindsight.vectorize.io

Setup options (set HINDSIGHT_BASE_URL in .env):
  A) Self-hosted local (no API key needed):
       docker run -p 8888:8888 -e HINDSIGHT_API_LLM_API_KEY=$GROQ_KEY
         -e HINDSIGHT_API_LLM_PROVIDER=groq ghcr.io/vectorize-io/hindsight:latest
       HINDSIGHT_BASE_URL=http://localhost:8888

  B) Hindsight Cloud (API key optional, depends on your plan):
       HINDSIGHT_BASE_URL=https://your-cloud-endpoint
       HINDSIGHT_API_KEY=your-bearer-token   (if required)

  C) Leave HINDSIGHT_BASE_URL blank → falls back to built-in SQLite memory.
"""

import os
import re
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from models import Contact, Memory, Meeting
from datetime import datetime
from typing import List, Dict, Optional

load_dotenv()

HINDSIGHT_BASE_URL = os.getenv("HINDSIGHT_BASE_URL", "").strip()
HINDSIGHT_API_KEY  = os.getenv("HINDSIGHT_API_KEY", "").strip()
HINDSIGHT_ENABLED  = bool(HINDSIGHT_BASE_URL)

_client = None


def _get_client():
    """Lazy-init the Hindsight client."""
    global _client
    if _client is None:
        from hindsight_client import Hindsight
        kwargs = {"base_url": HINDSIGHT_BASE_URL, "timeout": 30.0}
        if HINDSIGHT_API_KEY:
            kwargs["api_key"] = HINDSIGHT_API_KEY
        _client = Hindsight(**kwargs)
    return _client


def _bank_id(contact_name: str) -> str:
    """Convert contact name to a valid Hindsight bank_id (lowercase, hyphenated)."""
    return re.sub(r"[^a-z0-9\-]", "-", contact_name.lower().strip()).strip("-")


# ─── Real Hindsight Operations ────────────────────────────────────────────────

def hindsight_retain(
    contact_name: str,
    company: str,
    role: str,
    date: str,
    raw_notes: str,
) -> bool:
    """
    Store meeting memory in Hindsight via retain().
    Each contact gets their own memory bank (bank_id = sanitized name).
    """
    if not HINDSIGHT_ENABLED:
        return False
    try:
        client = _get_client()
        bank = _bank_id(contact_name)

        # Ensure the bank exists (create if not)
        try:
            client.banks.create(bank_id=bank, name=f"MemoryMeet — {contact_name}")
        except Exception:
            pass  # Already exists

        content = (
            f"Meeting with {contact_name} ({role} at {company}) on {date}.\n"
            f"Notes: {raw_notes}"
        )
        client.retain(
            bank_id=bank,
            content=content,
            context=f"meeting notes for {contact_name}",
            timestamp=datetime.utcnow(),
            metadata={"contact": contact_name, "company": company, "role": role},
        )
        return True
    except Exception as e:
        print(f"[Hindsight] retain failed: {e}")
        return False


def hindsight_recall(contact_name: str, query: str = None) -> str:
    """
    Retrieve memories for a contact via recall().
    Returns formatted text of all recalled memories.

    recall() returns: response.results — list of RecallResult with .text attribute
    """
    if not HINDSIGHT_ENABLED:
        return ""
    try:
        client = _get_client()
        bank = _bank_id(contact_name)
        q = query or (
            f"All meetings, concerns, objections, budget, promises, "
            f"follow-ups, and outcomes for {contact_name}"
        )
        response = client.recall(
            bank_id=bank,
            query=q,
            budget="high",
            max_tokens=4096,
        )
        # response.results is a list of RecallResult, each with .text
        if not response or not hasattr(response, "results"):
            return ""
        parts = [r.text for r in response.results if r.text]
        return "\n\n".join(parts)
    except Exception as e:
        print(f"[Hindsight] recall failed: {e}")
        return ""


def hindsight_reflect(contact_name: str, question: str) -> str:
    """
    Deep analysis of memories via reflect().
    Returns a generated answer string.

    reflect() returns: answer.text — a generated string response
    """
    if not HINDSIGHT_ENABLED:
        return ""
    try:
        client = _get_client()
        bank = _bank_id(contact_name)
        answer = client.reflect(
            bank_id=bank,
            query=question,
            budget="high",
            context=f"Analyzing relationship patterns for {contact_name}",
        )
        # answer.text is the generated response string
        if answer and hasattr(answer, "text"):
            return answer.text or ""
        return str(answer) if answer else ""
    except Exception as e:
        print(f"[Hindsight] reflect failed: {e}")
        return ""


# ─── SQLite Fallback Memory ───────────────────────────────────────────────────

def _extract_field(notes: str, keywords: List[str]) -> str:
    sentences = re.split(r"[.!?\n]", notes)
    matches = [s.strip() for s in sentences if s.strip() and
               any(kw.lower() in s.lower() for kw in keywords)]
    return ". ".join(matches)


def save_memory(db: Session, contact: Contact, meeting: Meeting, raw_notes: str) -> Memory:
    """
    Save structured memory to SQLite (used for timeline/health/stats UI).
    Also calls Hindsight retain() if Hindsight is enabled.
    """
    concerns      = _extract_field(raw_notes, ["concern","worried","security","compliance","SOC2","privacy","risk","issue","problem"])
    objections    = _extract_field(raw_notes, ["but","however","not sure","hesitant","objection","too expensive","not ready","pushback"])
    budget        = _extract_field(raw_notes, ["budget","cost","price","$","k","thousand","million","spend"])
    promises      = _extract_field(raw_notes, ["will","promise","commit","send","proposal","demo","schedule","follow up","provide","deliver"])
    follow_ups    = _extract_field(raw_notes, ["follow up","follow-up","deadline","friday","monday","week","asap","urgent","next step"])
    outcomes      = _extract_field(raw_notes, ["agreed","decided","confirmed","approved","rejected","next meeting","closed","signed"])

    memory = Memory(
        contact_id=contact.id,
        contact_name=contact.name,
        company=contact.company,
        role=contact.role,
        date=meeting.date,
        concerns=concerns,
        objections=objections,
        budget=budget,
        promises=promises,
        follow_up_items=follow_ups,
        outcomes=outcomes,
        raw_notes=raw_notes,
    )
    db.add(memory)
    db.commit()
    db.refresh(memory)

    # Also retain in Hindsight cloud/server if configured
    hindsight_retain(
        contact_name=contact.name,
        company=contact.company or "",
        role=contact.role or "",
        date=meeting.date.strftime("%B %d, %Y"),
        raw_notes=raw_notes,
    )

    return memory


def retrieve_memories(db: Session, contact_name: str) -> List[Memory]:
    contact = db.query(Contact).filter(Contact.name.ilike(f"%{contact_name}%")).first()
    if not contact:
        return []
    return db.query(Memory).filter(
        Memory.contact_id == contact.id
    ).order_by(Memory.date.asc()).all()


def build_memory_timeline(memories: List[Memory]) -> List[Dict]:
    return [
        {
            "date": m.date.strftime("%b %d, %Y"),
            "raw_notes": m.raw_notes,
            "concerns": m.concerns,
            "objections": m.objections,
            "budget": m.budget,
            "promises": m.promises,
            "follow_up_items": m.follow_up_items,
            "outcomes": m.outcomes,
        }
        for m in memories
    ]


def format_memories_for_llm(memories: List[Memory], hindsight_context: str = "") -> str:
    """Hindsight recalled context takes priority over SQLite fallback."""
    if hindsight_context and hindsight_context.strip():
        return f"=== HINDSIGHT MEMORY (AI-enriched recall) ===\n{hindsight_context}"

    if not memories:
        return "No prior meeting memories found for this contact."

    parts = []
    for i, m in enumerate(memories, 1):
        parts.append(f"--- Memory {i} | {m.date.strftime('%B %d, %Y')} ---")
        parts.append(f"Raw Notes: {m.raw_notes}")
        if m.concerns:      parts.append(f"Concerns: {m.concerns}")
        if m.objections:    parts.append(f"Objections: {m.objections}")
        if m.budget:        parts.append(f"Budget: {m.budget}")
        if m.promises:      parts.append(f"Promises: {m.promises}")
        if m.follow_up_items: parts.append(f"Follow-ups: {m.follow_up_items}")
        if m.outcomes:      parts.append(f"Outcomes: {m.outcomes}")
        parts.append("")
    return "\n".join(parts)


def compute_relationship_health(memories: List[Memory]) -> int:
    if not memories:
        return 50
    score = 70 + min(len(memories) * 3, 15)
    score -= min(sum(1 for m in memories if m.promises    and m.promises.strip())    * 5, 20)
    score -= min(sum(1 for m in memories if m.objections  and m.objections.strip())  * 3, 12)
    score += min(sum(1 for m in memories if m.outcomes    and m.outcomes.strip())    * 4, 12)
    return max(10, min(100, score))


def get_recurring_themes(memories: List[Memory]) -> List[str]:
    text = " ".join([(m.concerns or "") + " " + (m.raw_notes or "") for m in memories]).lower()
    topics = {
        "Security":    ["security","breach","vulnerability"],
        "Compliance":  ["compliance","soc2","gdpr","audit"],
        "Pricing":     ["price","pricing","cost","budget","expensive"],
        "Integration": ["integration","api","connect","sync"],
        "Support":     ["support","training","onboarding"],
        "Timeline":    ["deadline","urgent","friday","asap"],
        "ROI":         ["roi","return","value","benefit"],
        "Proposal":    ["proposal","quote","contract"],
    }
    scored = [(t, sum(text.count(k) for k in kws)) for t, kws in topics.items()]
    return [t for t, c in sorted(scored, key=lambda x: -x[1]) if c >= 1][:6]
