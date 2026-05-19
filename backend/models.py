from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=utcnow)

    onboarding_completed = Column(Boolean, default=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(50), nullable=True)
    skin_type = Column(String(50), nullable=True)
    allergies = Column(Text, nullable=True)
    current_products = Column(Text, nullable=True)

    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=utcnow)

    severity = Column(String(20), nullable=False)
    confidence = Column(Float, nullable=False)
    regions_detected = Column(Integer, nullable=False)
    processed = Column(Integer, nullable=False)
    primary_concern = Column(String(50), nullable=False)
    result_json = Column(Text, nullable=False)

    user = relationship("User", back_populates="scans")
