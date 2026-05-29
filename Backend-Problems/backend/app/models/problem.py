from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import Integer, String, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base  # Assuming your declarative base is here

class Problem(Base):
    __tablename__ = "problems"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String, index=True, nullable=False)
    category: Mapped[str] = mapped_column(String, index=True, nullable=False)
    algorithm: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    difficulty: Mapped[str] = mapped_column(String, nullable=False)  # e.g., Beginner, Intermediate, Advanced
    explanation: Mapped[str] = mapped_column(String, nullable=False)
    markdown_content: Mapped[str] = mapped_column(String, nullable=False)
    
    # SQLite supports JSON columns natively via text representation
    technologies: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True) 
    complexity: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)   # e.g., {"time": "O(N)", "space": "O(1)"}
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    tags: Mapped[List["Tag"]] = relationship(
        "Tag", secondary="problem_tags", back_populates="problems"
    )
    
    # Graph edges where this problem is the source or destination
    outgoing_relationships: Mapped[List["Relationship"]] = relationship(
        "Relationship", foreign_keys="[Relationship.source_id]", back_populates="source_node"
    )
    incoming_relationships: Mapped[List["Relationship"]] = relationship(
        "Relationship", foreign_keys="[Relationship.target_id]", back_populates="target_node"
    )