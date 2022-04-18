# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
from typing import Optional, List
from typing_extensions import TypedDict
from pydantic import BaseModel
from sqlalchemy import Column, ForeignKey
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy import Boolean, Integer, String, Enum
from sqlalchemy.orm import relationship
import sqlalchemy.dialects.postgresql as pg
from db.connection import Base
from models.option import OptionBase, OptionBaseWithId


class QuestionType(enum.Enum):
    text = 'text'
    number = 'number'
    option = 'option'
    multiple_option = 'multiple_option'
    photo = 'photo'
    date = 'date'
    geo = 'geo'
    administration = 'administration'
    answer_list = 'answer_list'


class DependencyDict(TypedDict):
    id: int
    options: List[str]


class QuestionDict(TypedDict):
    id: int
    form: int
    question_group: int
    order: Optional[int] = None
    name: str
    meta: bool
    type: QuestionType
    required: bool
    rule: Optional[dict]
    option: Optional[List[OptionBase]] = None
    dependency: Optional[List[DependencyDict]] = None


class Question(Base):
    __tablename__ = "question"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    form = Column(Integer, ForeignKey('form.id'))
    question_group = Column(Integer, ForeignKey('question_group.id'))
    name = Column(String)
    order = Column(Integer, nullable=True)
    meta = Column(Boolean, default=False)
    type = Column(Enum(QuestionType), default=QuestionType.text)
    required = Column(Boolean, nullable=True)
    rule = Column(MutableDict.as_mutable(pg.JSONB), nullable=True)
    dependency = Column(pg.ARRAY(pg.JSONB), nullable=True)
    option = relationship("Option",
                          cascade="all, delete",
                          passive_deletes=True,
                          backref="option")

    def __init__(self, id: Optional[int], name: str, order: int, form: int,
                 question_group: int, meta: bool, type: QuestionType,
                 required: Optional[bool], rule: Optional[dict],
                 dependency: Optional[List[DependencyDict]]):
        self.id = id
        self.form = form
        self.order = order
        self.question_group = question_group
        self.name = name
        self.meta = meta
        self.type = type
        self.required = required
        self.rule = rule
        self.dependency = dependency

    def __repr__(self) -> int:
        return f"<Question {self.id}>"

    @property
    def serialize(self) -> QuestionDict:
        return {
            "id": self.id,
            "form": self.form,
            "question_group": self.question_group,
            "name": self.name,
            "order": self.order,
            "meta": self.meta,
            "type": self.type,
            "required": self.required,
            "rule": self.rule,
            "dependency": self.dependency,
            "option": self.option,
        }

    @property
    def to_excel_header(self):
        return f"{self.id}|{self.name}"

    @property
    def to_definition(self):
        options = [options.name
                   for options in self.option] if self.option else False
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "required": self.required,
            "rule": self.rule,
            "dependency": self.dependency,
            "options": options,
        }


class QuestionBase(BaseModel):
    id: int
    form: int
    question_group: int
    name: str
    order: Optional[int] = None
    meta: bool
    type: QuestionType
    required: bool
    rule: Optional[dict]
    option: List[OptionBaseWithId]
    dependency: Optional[List[DependencyDict]]

    class Config:
        orm_mode = True
