from datetime import datetime
from typing_extensions import TypedDict
from typing import Optional, List, Union
from pydantic import BaseModel
from sqlalchemy import Column, Integer, Float, Text
from sqlalchemy import ForeignKey, DateTime
import sqlalchemy.dialects.postgresql as pg
from db.connection import Base


class AnswerDict(TypedDict):
    question: int
    value: Union[int, float, str, bool, List[str], List[int], List[float]]


class Answer(Base):
    __tablename__ = "answer"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    question = Column(Integer, ForeignKey('question.id'))
    data = Column(Integer, ForeignKey('data.id'))
    text = Column(Text, nullable=True)
    value = Column(Float, nullable=True)
    options = Column(pg.ARRAY(Float), nullable=True)
    created_by = Column(Integer, ForeignKey('user.id'))
    updated_by = Column(Integer, ForeignKey('user.id'), nullable=True)
    created = Column(DateTime, nullable=True)
    updated = Column(DateTime, nullable=True)

    def __init__(self, question: int, data: int, text: str, value: float,
                 options: List[str], created_by: int, updated_by: int,
                 updated: datetime, created: datetime):
        self.question = question
        self.data = data
        self.text = text
        self.value = value
        self.options = options
        self.created_by = created_by
        self.updated_by = updated_by
        self.updated = updated
        self.created = created

    def __repr__(self) -> int:
        return f"<Answer {self.id}>"

    @property
    def serialize(self) -> AnswerDict:
        return {
            "id": self.id,
            "question": self.question,
            "data": self.data,
            "text": self.text,
            "value": self.value,
            "options": self.options,
            "created_by": self.created_by,
            "updated_by": self.updated_by,
            "created": self.created,
            "updated": self.updated,
        }


class AnswerBase(BaseModel):
    id: int
    question: int
    data: int
    text: Optional[str] = None
    value: Optional[float] = None
    options: Optional[List[str]] = None
    created_by: int
    updated_by: Optional[int] = None
    created: Optional[datetime] = None
    updated: Optional[datetime] = None

    class Config:
        orm_mode = True
