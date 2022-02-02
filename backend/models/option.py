# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional
from typing_extensions import TypedDict
from pydantic import BaseModel
from sqlalchemy import Column, ForeignKey
from sqlalchemy import Integer, String
from db.connection import Base


class OptionDict(TypedDict):
    name: str
    order: Optional[int] = None
    color: Optional[str] = None
    score: Optional[int] = None


class OptionDictWithId(TypedDict):
    id: int
    name: str
    order: Optional[int] = None
    color: Optional[str] = None
    score: Optional[int] = None


class Option(Base):
    __tablename__ = "option"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    question = Column(Integer, ForeignKey('question.id'))
    name = Column(String)
    order = Column(Integer, nullable=True)
    color = Column(String, nullable=True)
    score = Column(Integer, nullable=True)

    def __init__(self,
                 name: str,
                 order: Optional[int] = None,
                 color: Optional[str] = None,
                 score: Optional[int] = None):
        self.name = name
        self.order = order
        self.color = color
        self.score = score

    def __repr__(self) -> int:
        return f"<Option {self.id}>"

    @property
    def serialize(self) -> OptionDict:
        return {
            "name": self.name,
            "order": self.order,
            "color": self.color,
            "score": self.score
        }

    @property
    def serializeWithId(self) -> OptionDictWithId:
        return {
            "id": self.id,
            "name": self.name,
            "order": self.order,
            "color": self.color,
            "score": self.score
        }

    @property
    def scores(self):
        return {
            "name": self.name,
            "score": self.score
        }


class OptionBase(BaseModel):
    name: str
    order: Optional[int] = None
    color: Optional[str] = None
    score: Optional[int] = None

    class Config:
        orm_mode = True


class OptionBaseWithId(BaseModel):
    id: int
    name: str
    order: Optional[int] = None
    color: Optional[str] = None
    score: Optional[int] = None

    class Config:
        orm_mode = True
