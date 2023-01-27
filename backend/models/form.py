# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing_extensions import TypedDict
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Text, Float
from sqlalchemy.orm import relationship
from db.connection import Base
from models.question_group import QuestionGroupBase
from models.question import QuestionBase
import sqlalchemy.dialects.postgresql as pg


class FormDict(TypedDict):
    id: int
    name: str
    version: Optional[float]
    description: Optional[str]
    default_language: Optional[str]
    languages: Optional[List[str]]
    translations: Optional[List[dict]]
    passcode: Optional[bool] = None


class FormDictWithFlag(TypedDict):
    id: int
    name: str
    disableDelete: bool
    version: Optional[float]
    description: Optional[str]
    default_language: Optional[str]
    languages: Optional[List[str]]
    translations: Optional[List[dict]]
    url: Optional[str] = None
    passcode: Optional[str] = None


class FormLoginResponse(TypedDict):
    uuid: str
    passcode: str


class Form(Base):
    __tablename__ = "form"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    default_language = Column(String, nullable=True)
    languages = Column(pg.ARRAY(String), nullable=True)
    translations = Column(pg.ARRAY(pg.JSONB), nullable=True)
    version = Column(Float, nullable=True, default=0.0)
    passcode = Column(String, nullable=True)

    question_group = relationship(
        "QuestionGroup", cascade="all, delete",
        passive_deletes=True, backref="question_group")

    def __init__(
        self,
        id: Optional[int],
        name: str,
        version: Optional[float] = 0.0,
        description: Optional[str] = None,
        default_language: Optional[str] = None,
        languages: Optional[List[str]] = None,
        translations: Optional[List[dict]] = None,
        passcode: Optional[str] = None
    ):
        self.id = id
        self.name = name
        self.version = version
        self.description = description
        self.default_language = default_language
        self.languages = languages
        self.translations = translations
        self.passcode = passcode

    def __repr__(self) -> int:
        return f"<Form {self.id}>"

    @property
    def serialize(self) -> FormDict:
        return {
            "id": self.id,
            "name": self.name,
            "version": self.version,
            "description": self.description,
            "default_language": self.default_language,
            "languages": self.languages,
            "translations": self.translations,
            "question_group": self.question_group,
            "passcode": self.passcode,
        }

    @property
    def to_form_detail(self) -> FormDict:
        return {
            "id": self.id,
            "name": self.name,
            "version": self.version,
            "description": self.description,
            "default_language": self.default_language,
            "languages": self.languages,
            "translations": self.translations,
            "passcode": True if self.passcode else False
        }

    @property
    def list_of_questions(self) -> TypedDict:
        question_list = {}
        for qg in self.question_group:
            for q in qg.question:
                question_list.update({q.id: q.type})
        return question_list

    @property
    def questions(self) -> List[QuestionBase]:
        question_list = []
        for qg in self.question_group:
            for q in qg.question:
                question_list.append(q.serialize)
        return question_list


class FormBase(BaseModel):
    id: int
    name: str
    version: Optional[float]
    description: Optional[str]
    default_language: Optional[str]
    languages: Optional[List[str]]
    translations: Optional[List[dict]]
    question_group: List[QuestionGroupBase]

    class Config:
        orm_mode = True
