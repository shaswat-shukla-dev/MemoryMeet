from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Contact
from schemas import InsightRequest, InsightResponse
from hindsight_service import (
    retrieve_memories,
    format_memories_for_llm,
    hindsight_reflect,
    hindsight_recall,
    HINDSIGHT_ENABLED,
)
from groq_service import generate_insights

router = APIRouter()


@router.post("/insights", response_model=InsightResponse)
def get_insights(payload: InsightRequest, db: Session = Depends(get_db)):
    contact_name = payload.contact_name.strip()

    contact = db.query(Contact).filter(
        Contact.name.ilike(f"%{contact_name}%")
    ).first()

    if not contact:
        raise HTTPException(
            status_code=404,
            detail=f"No contact found for '{contact_name}'. Add a meeting first."
        )

    # Step 1: Try Hindsight reflect (deepest, most accurate)
    if HINDSIGHT_ENABLED:
        hindsight_answer = hindsight_reflect(contact.name, payload.question)
        if hindsight_answer and hindsight_answer.strip():
            return InsightResponse(
                contact_name=contact.name,
                insights=hindsight_answer,
            )

        # Fallback: recall + Groq if reflect returned nothing
        hindsight_context = hindsight_recall(contact.name)
        if hindsight_context:
            memories = retrieve_memories(db, contact_name)
            memory_context = format_memories_for_llm(memories, hindsight_context)
            insights_text = generate_insights(
                contact_name=contact.name,
                question=payload.question,
                memory_context=memory_context,
            )
            return InsightResponse(contact_name=contact.name, insights=insights_text)

    # Step 2: SQLite fallback — recall + Groq
    memories = retrieve_memories(db, contact_name)

    if not memories:
        return InsightResponse(
            contact_name=contact.name,
            insights=(
                f"No meeting memories found for {contact.name}. "
                "Add meeting notes to start building insights."
            ),
        )

    memory_context = format_memories_for_llm(memories)
    insights_text = generate_insights(
        contact_name=contact.name,
        question=payload.question,
        memory_context=memory_context,
    )

    return InsightResponse(contact_name=contact.name, insights=insights_text)
