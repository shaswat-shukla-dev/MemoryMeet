from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Contact
from schemas import BriefRequest, BriefResponse
from hindsight_service import (
    retrieve_memories,
    build_memory_timeline,
    format_memories_for_llm,
    compute_relationship_health,
    get_recurring_themes,
    hindsight_recall,
    HINDSIGHT_ENABLED,
)
from groq_service import generate_brief

router = APIRouter()


@router.post("/brief", response_model=BriefResponse)
def get_brief(payload: BriefRequest, db: Session = Depends(get_db)):
    contact_name = payload.contact_name.strip()

    contact = db.query(Contact).filter(
        Contact.name.ilike(f"%{contact_name}%")
    ).first()

    if not contact:
        raise HTTPException(
            status_code=404,
            detail=f"No contact found for '{contact_name}'. Add a meeting first."
        )

    # Step 1: Recall from Hindsight (AI-enriched memory) if enabled
    hindsight_context = hindsight_recall(contact.name) if HINDSIGHT_ENABLED else ""

    # Step 2: Fallback — get SQLite memories for timeline + health score
    memories = retrieve_memories(db, contact_name)
    timeline = build_memory_timeline(memories)
    health_score = compute_relationship_health(memories)
    recurring_themes = get_recurring_themes(memories)

    # Step 3: Build memory context (Hindsight-first, SQLite fallback)
    memory_context = format_memories_for_llm(memories, hindsight_context)

    if not memories and not hindsight_context:
        return BriefResponse(
            contact_name=contact.name,
            contact_summary=(
                f"{contact.name} is a {contact.role or 'contact'} at "
                f"{contact.company or 'their company'}. No meeting history yet."
            ),
            previous_meetings=timeline,
            recurring_concerns=[],
            pending_tasks=[],
            suggested_talking_points=[
                "Introduce your solution",
                "Understand their current challenges",
                "Identify key decision criteria",
            ],
            recommended_actions=["Add first meeting notes to build memory"],
            relationship_health_score=health_score,
        )

    # Step 4: Send recalled memory to Groq for brief generation
    llm_result = generate_brief(
        contact_name=contact.name,
        company=contact.company or "",
        role=contact.role or "",
        memory_context=memory_context,
        health_score=health_score,
        recurring_themes=recurring_themes,
        hindsight_enabled=HINDSIGHT_ENABLED,
    )

    return BriefResponse(
        contact_name=contact.name,
        contact_summary=llm_result.get("contact_summary", ""),
        previous_meetings=timeline,
        recurring_concerns=llm_result.get("recurring_concerns", recurring_themes[:3]),
        pending_tasks=llm_result.get("pending_tasks", []),
        suggested_talking_points=llm_result.get("suggested_talking_points", []),
        recommended_actions=llm_result.get("recommended_actions", []),
        relationship_health_score=health_score,
    )
