# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional, List
from typing_extensions import TypedDict
from pydantic import BaseModel
from sqlalchemy import Column, ForeignKey
from sqlalchemy import Integer, String
from db.connection import Base
import sqlalchemy.dialects.postgresql as pg


class OptionDict(TypedDict):
    name: str
    order: Optional[int] = None
    color: Optional[str] = None
    score: Optional[int] = None
    code: Optional[str] = None
    translations: Optional[List[dict]] = None


class OptionDictWithId(TypedDict):
    id: int
    name: str
    order: Optional[int] = None
    color: Optional[str] = None
    score: Optional[int] = None
    code: Optional[str] = None
    translations: Optional[List[dict]] = None


class Option(Base):
    __tablename__ = "option"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    question = Column(Integer, ForeignKey("question.id"))
    name = Column(String)
    order = Column(Integer, nullable=True)
    color = Column(String, nullable=True)
    score = Column(Integer, nullable=True)
    code = Column(String, nullable=True)
    translations = Column(pg.ARRAY(pg.JSONB), nullable=True)

    def __init__(
        self,
        name: str,
        id: Optional[int] = None,
        order: Optional[int] = None,
        color: Optional[str] = None,
        score: Optional[int] = None,
        code: Optional[str] = None,
        translations: Optional[List[dict]] = None,
    ):
        self.id = id
        self.name = name
        self.order = order
        self.color = color
        self.score = score
        self.code = code
        self.translations = translations

    def __repr__(self) -> int:
        return f"<Option {self.id}>"

    @property
    def serialize(self) -> OptionDict:
        return {
            "name": self.name,
            "order": self.order,
            "color": self.color,
            "score": self.score,
            "code": self.code,
            "translations": self.translations,
        }

    @property
    def serializeWithId(self) -> OptionDictWithId:
        return {
            "id": self.id,
            "name": self.name,
            "order": self.order,
            "color": self.color,
            "score": self.score,
            "code": self.code,
            "translations": self.translations,
        }

    @property
    def scores(self):
        return {"name": self.name, "score": self.score}


class OptionBase(BaseModel):
    name: str
    order: Optional[int] = None
    color: Optional[str] = None
    score: Optional[int] = None
    code: Optional[str] = None
    translations: Optional[List[dict]] = None

    class Config:
        orm_mode = True


class OptionBaseWithId(BaseModel):
    id: int
    name: str
    order: Optional[int] = None
    color: Optional[str] = None
    score: Optional[int] = None
    code: Optional[str] = None
    translations: Optional[List[dict]] = None

    class Config:
        orm_mode = True
