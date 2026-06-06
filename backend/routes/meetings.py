from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Contact, Meeting
from schemas import MeetingRequest, MeetingResponse, StatsResponse, ContactOut
from hindsight_service import save_memory
from typing import List
from datetime import datetime

router = APIRouter()


@router.post("/meeting", response_model=MeetingResponse)
def add_meeting(payload: MeetingRequest, db: Session = Depends(get_db)):
    # Get or create contact
    contact = db.query(Contact).filter(
        Contact.name.ilike(payload.contact_name)
    ).first()

    if not contact:
        contact = Contact(
            name=payload.contact_name,
            company=payload.company,
            role=payload.role,
        )
        db.add(contact)
        db.commit()
        db.refresh(contact)
    else:
        # Update company/role if provided
        if payload.company:
            contact.company = payload.company
        if payload.role:
            contact.role = payload.role
        db.commit()

    # Create meeting record
    meeting = Meeting(
        contact_id=contact.id,
        notes=payload.meeting_notes,
        date=datetime.utcnow(),
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    # Save to Hindsight memory layer
    save_memory(db, contact, meeting, payload.meeting_notes)

    return MeetingResponse(
        message="Meeting stored successfully",
        contact_id=contact.id,
        meeting_id=meeting.id,
        memory_status="saved",
    )


@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    from models import Memory
    total_contacts = db.query(Contact).count()
    total_meetings = db.query(Meeting).count()
    total_memories = db.query(Memory).count()
    return StatsResponse(
        total_contacts=total_contacts,
        total_meetings=total_meetings,
        total_memories=total_memories,
        avg_health_score=78.0,
    )


@router.get("/contacts", response_model=List[ContactOut])
def list_contacts(db: Session = Depends(get_db)):
    from models import Memory
    contacts = db.query(Contact).order_by(Contact.created_at.desc()).all()
    result = []
    for c in contacts:
        meeting_count = db.query(Meeting).filter(Meeting.contact_id == c.id).count()
        memory_count = db.query(Memory).filter(Memory.contact_id == c.id).count()
        result.append(ContactOut(
            id=c.id,
            name=c.name,
            company=c.company,
            role=c.role,
            created_at=c.created_at,
            meeting_count=meeting_count,
            memory_count=memory_count,
        ))
    return result


@router.get("/meetings/{contact_name}")
def get_meetings_for_contact(contact_name: str, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(
        Contact.name.ilike(f"%{contact_name}%")
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    meetings = db.query(Meeting).filter(
        Meeting.contact_id == contact.id
    ).order_by(Meeting.date.desc()).all()
    return {
        "contact": {"id": contact.id, "name": contact.name, "company": contact.company, "role": contact.role},
        "meetings": [{"id": m.id, "notes": m.notes, "date": m.date} for m in meetings],
    }
