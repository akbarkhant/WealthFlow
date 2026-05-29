from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class Analytics(Base):
    __tablename__ = "analytics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_type: Mapped[str] = mapped_column(String, index=True, nullable=False) # search, graph_traversal, rec_click, command_palette
    
    # Event payloads
    search_query: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    target_problem_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("problems.id", ondelete="SET NULL"), nullable=True)
    metadata_json: Mapped[Optional[str]] = mapped_column(String, nullable=True) # Catch-all for extra UI click event contexts
    
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)