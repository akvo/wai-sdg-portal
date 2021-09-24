from typing import Optional
from typing_extensions import TypedDict
from pydantic import BaseModel
from sqlalchemy import Column, ForeignKey
from sqlalchemy import Integer, String
from db.connection import Base


class OptionDict(TypedDict):
    id: int
    name: str
    order: Optional[int] = None


class Option(Base):
    __tablename__ = "option"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    question = Column(Integer, ForeignKey('question.id'))
    name = Column(String)
    order = Column(Integer, nullable=True)

    def __init__(self, name: str):
        self.name = name

    def __repr__(self) -> int:
        return f"<Option {self.id}>"

    @property
    def serialize(self) -> OptionDict:
        return {
            "id": self.id,
            "question": self.question,
            "name": self.name,
            "order": self.order
        }


class OptionBase(BaseModel):
    id: int
    question: int
    name: str
    order: Optional[int] = None

    class Config:
        orm_mode = True
