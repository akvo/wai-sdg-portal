# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional, List
from typing_extensions import TypedDict
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from db.connection import Base
from models.question import QuestionBase
import sqlalchemy.dialects.postgresql as pg


class QuestionGroupDict(TypedDict):
    id: int
    form: int
    name: str
    order: Optional[int] = None
    description: Optional[str] = None
    repeatable: Optional[bool] = False
    repeat_text: Optional[str] = None
    translations: Optional[List[dict]] = None


class QuestionGroup(Base):
    __tablename__ = "question_group"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    form = Column(Integer, ForeignKey("form.id"))
    name = Column(String)
    order = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    repeatable = Column(Boolean, nullable=True)
    repeat_text = Column(String, nullable=True)
    translations = Column(pg.ARRAY(pg.JSONB), nullable=True)
    question = relationship(
        "Question",
        cascade="all, delete",
        passive_deletes=True,
        backref="question",
    )

    def __init__(
        self,
        id: Optional[int],
        name: str,
        form: form,
        order: order,
        description: Optional[str] = None,
        repeatable: Optional[bool] = False,
        repeat_text: Optional[str] = None,
        translations: Optional[List[dict]] = None,
    ):
        self.id = id
        self.name = name
        self.form = form
        self.order = order
        self.description = description
        self.repeatable = repeatable
        self.repeat_text = repeat_text
        self.translations = translations

    def __repr__(self) -> int:
        return f"<QuestionGroup {self.id}>"

    @property
    def serialize(self) -> QuestionGroupDict:
        return {
            "id": self.id,
            "form": self.form,
            "question": self.question,
            "name": self.name,
            "order": self.order,
            "description": self.description,
            "repeatable": self.repeatable,
            "repeat_text": self.repeat_text,
            "translations": self.translations,
        }


class QuestionGroupBase(BaseModel):
    id: int
    form: int
    name: str
    order: Optional[int] = None
    description: Optional[str] = None
    repeatable: Optional[bool] = False
    repeat_text: Optional[str] = None
    translations: Optional[List[dict]] = None
    question: List[QuestionBase]

    class Config:
        orm_mode = True
