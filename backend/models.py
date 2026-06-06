from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    company = Column(String(200))
    role = Column(String(200))
    created_at = Column(DateTime, default=datetime.utcnow)

    meetings = relationship("Meeting", back_populates="contact", cascade="all, delete-orphan")
    memories = relationship("Memory", back_populates="contact", cascade="all, delete-orphan")


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    notes = Column(Text)
    date = Column(DateTime, default=datetime.utcnow)

    contact = relationship("Contact", back_populates="meetings")


class Memory(Base):
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    contact_name = Column(String(200))
    company = Column(String(200))
    role = Column(String(200))
    date = Column(DateTime, default=datetime.utcnow)
    concerns = Column(Text, default="")
    objections = Column(Text, default="")
    budget = Column(String(500), default="")
    promises = Column(Text, default="")
    follow_up_items = Column(Text, default="")
    outcomes = Column(Text, default="")
    raw_notes = Column(Text, default="")

    contact = relationship("Contact", back_populates="memories")
