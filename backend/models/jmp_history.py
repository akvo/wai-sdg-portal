# Please don't use **kwargs
# Keep the code clean and CLEAR

from datetime import datetime
from typing_extensions import TypedDict
from typing import Optional
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.orm import relationship
from db.connection import Base


class JmpHistoryDict(TypedDict):
    id: int
    history: int
    data: int
    name: str
    category: str
    created: datetime
    updated: datetime


class JmpHistory(Base):
    __tablename__ = "jmp_history"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    history = Column(Integer, ForeignKey("history.id"))
    data = Column(Integer, ForeignKey("data.id"))
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    created = Column(DateTime, nullable=True)
    updated = Column(DateTime, nullable=True)
    data_detail = relationship("Data", foreign_keys=[data])

    def __init__(
        self,
        history: int,
        created: datetime,
        data: Optional[int] = None,
        name: Optional[str] = None,
        category: Optional[str] = None,
        updated: Optional[datetime] = None,
    ):
        self.history = history
        self.data = data
        self.name = name
        self.category = category
        self.updated = updated
        self.created = created

    def __repr__(self) -> int:
        return f"<JmpHistory {self.id}>"

    @property
    def serialize(self) -> JmpHistoryDict:
        return {
            "id": self.id,
            "history": self.history,
            "data": self.data,
            "name": self.name,
            "category": self.category,
            "created": self.created,
            "updated": self.updated,
        }

    @property
    def simplified(self) -> TypedDict:
        date = self.updated or self.created
        return {
            "date": date.strftime("%B %d, %Y"),
            "data": self.data,
            "name": self.name,
            "category": self.category,
        }


class JmpHistoryBase(BaseModel):
    id: int
    history: int
    data: int
    name: Optional[str] = None
    category: Optional[str] = None
    created: Optional[datetime] = None
    updated: Optional[datetime] = None

    class Config:
        orm_mode = True
