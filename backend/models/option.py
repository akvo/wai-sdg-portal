# Please don't use **kwargs
# Keep the code clean and CLEAR

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
    color: Optional[str] = None


class Option(Base):
    __tablename__ = "option"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    question = Column(Integer, ForeignKey('question.id'))
    name = Column(String)
    order = Column(Integer, nullable=True)
    color = Column(String)

    def __init__(self,
                 name: str,
                 order: Optional[int] = None,
                 color: Optional[str] = None):
        self.name = name
        self.order = order
        self.color = color

    def __repr__(self) -> int:
        return f"<Option {self.id}>"

    @property
    def serialize(self) -> OptionDict:
        return {
            "id": self.id,
            "question": self.question,
            "name": self.name,
            "order": self.order,
            "color": self.color
        }


class OptionBase(BaseModel):
    id: int
    question: int
    name: str
    order: Optional[int] = None
    color: Optional[str] = None

    class Config:
        orm_mode = True
