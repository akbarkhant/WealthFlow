from sqlalchemy import Integer, String, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Relationship(Base):
    __tablename__ = "relationships"

    # Self-referential Adjacency List for the Graph Engine
    source_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("problems.id", ondelete="CASCADE"), primary_key=True
    )
    target_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("problems.id", ondelete="CASCADE"), primary_key=True
    )
    relationship_type: Mapped[str] = mapped_column(String, nullable=False)  # depends_on, solves, prevents, etc.
    strength: Mapped[float] = mapped_column(Float, default=1.0)

    # Explicit ORM mapping back to the Problem instances
    source_node: Mapped["Problem"] = relationship(
        "Problem", foreign_keys=[source_id], back_populates="outgoing_relationships"
    )
    target_node: Mapped["Problem"] = relationship(
        "Problem", foreign_keys=[target_id], back_populates="incoming_relationships"
    )