from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MeetingRequest(BaseModel):
    contact_name: str
    company: str
    role: str
    meeting_notes: str


class MeetingResponse(BaseModel):
    message: str
    contact_id: int
    meeting_id: int
    memory_status: str


class BriefRequest(BaseModel):
    contact_name: str


class BriefResponse(BaseModel):
    contact_name: str
    contact_summary: str
    previous_meetings: List[dict]
    recurring_concerns: List[str]
    pending_tasks: List[str]
    suggested_talking_points: List[str]
    recommended_actions: List[str]
    relationship_health_score: int


class InsightRequest(BaseModel):
    contact_name: str
    question: str


class InsightResponse(BaseModel):
    contact_name: str
    insights: str


class MemoryItem(BaseModel):
    id: int
    contact_name: str
    company: Optional[str]
    role: Optional[str]
    date: datetime
    concerns: Optional[str]
    objections: Optional[str]
    budget: Optional[str]
    promises: Optional[str]
    follow_up_items: Optional[str]
    outcomes: Optional[str]
    raw_notes: Optional[str]

    class Config:
        from_attributes = True


class ContactOut(BaseModel):
    id: int
    name: str
    company: Optional[str]
    role: Optional[str]
    created_at: datetime
    meeting_count: int = 0
    memory_count: int = 0

    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    total_contacts: int
    total_meetings: int
    total_memories: int
    avg_health_score: float
