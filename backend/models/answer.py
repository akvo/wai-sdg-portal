# Please don't use **kwargs
# Keep the code clean and CLEAR

from datetime import datetime
from typing_extensions import TypedDict
from typing import Optional, List, Union
from pydantic import BaseModel
from .question import QuestionType
from sqlalchemy import Column, Integer, Float, Text, String
from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.orm import relationship
import sqlalchemy.dialects.postgresql as pg
from db.connection import Base


class AnswerDict(TypedDict):
    question: int
    value: Union[int, float, str, bool, dict, List[str], List[int], List[float], None]


class AnswerDictWithHistory(TypedDict):
    history: bool
    question: int
    value: Union[int, str, bool, dict, List[str], List[int], List[float], float, None]


class Answer(Base):
    __tablename__ = "answer"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    question = Column(
        Integer,
        ForeignKey("question.id", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    data = Column(
        Integer,
        ForeignKey("data.id", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    text = Column(Text, nullable=True)
    value = Column(Float, nullable=True)
    options = Column(pg.ARRAY(String), nullable=True)
    created_by = Column(Integer, ForeignKey("user.id"), nullable=True)
    updated_by = Column(Integer, ForeignKey("user.id"), nullable=True)
    created = Column(DateTime, nullable=True)
    updated = Column(DateTime, nullable=True)
    created_by_user = relationship("User", foreign_keys=[created_by])
    updated_by_user = relationship("User", foreign_keys=[updated_by])
    question_detail = relationship("Question", backref="answer")

    def __init__(
        self,
        question: int,
        created_by: int,
        created: datetime,
        data: Optional[int] = None,
        text: Optional[str] = None,
        value: Optional[float] = None,
        options: Optional[List[str]] = None,
        updated: Optional[datetime] = None,
        updated_by: Optional[int] = None,
    ):
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

    @property
    def formatted(self) -> AnswerDictWithHistory:
        answer = {
            "question": self.question,
            "history": True if self.updated_by else False,
        }
        type = self.question_detail.type
        if type in [
            QuestionType.administration,
            QuestionType.number,
            QuestionType.answer_list,
        ]:
            answer.update({"value": self.value})
        if type in [QuestionType.text, QuestionType.geo, QuestionType.date]:
            answer.update({"value": self.text})
        if type == QuestionType.option:
            answer.update({"value": self.options[0]})
        if type == QuestionType.multiple_option:
            answer.update({"value": self.options})
        if type == QuestionType.photo:
            answer.update({"value": self.value})
        return answer

    @property
    def dicted(self) -> TypedDict:
        return {
            self.question: {
                "value": self.text or self.value or self.options,
                "data": self,
            }
        }

    @property
    def only_value(self) -> List:
        type = self.question_detail.type
        if type in [
            QuestionType.administration,
            QuestionType.number,
            QuestionType.answer_list,
        ]:
            return self.value
        if type in [QuestionType.text, QuestionType.geo, QuestionType.date]:
            return self.text
        if type == QuestionType.number:
            return self.value
        if type == QuestionType.option:
            return self.options[0] if self.options else None
        if type == QuestionType.multiple_option:
            return self.options
        if type == QuestionType.photo:
            return self.text
        return None

    @property
    def simplified(self) -> TypedDict:
        user = self.updated_by_user or self.created_by_user
        date = self.updated or self.created
        type = self.question_detail.type
        answer = None
        if type in [
            QuestionType.administration,
            QuestionType.number,
            QuestionType.answer_list,
        ]:
            answer = self.value
        if type in [QuestionType.text, QuestionType.geo, QuestionType.date]:
            answer = self.text
        if type == QuestionType.option:
            answer = self.options[0] if self.options else None
        if type == QuestionType.multiple_option:
            answer = self.options
        if type == QuestionType.photo:
            answer = self.text
        return {
            "value": answer,
            "date": date.strftime("%B %d, %Y"),
            "user": user.name,
        }

    @property
    def to_maps(self) -> List:
        answer = {"question": self.question, "data": self.data}
        type = self.question_detail.type
        if type in [
            QuestionType.administration,
            QuestionType.number,
            QuestionType.answer_list,
        ]:
            answer.update({"value": self.value})
        if type in [QuestionType.text, QuestionType.geo, QuestionType.date]:
            answer.update({"value": self.text})
        if type == QuestionType.option:
            answer.update({"value": self.options[0] if self.options else None})
        if type == QuestionType.multiple_option:
            answer.update({"value": self.options})
        if type == QuestionType.photo:
            answer.update({"value": self.text})
        return answer

    @property
    def to_data_frame(self) -> dict:
        answer = None
        q = self.question_detail
        qname = f"{self.question_detail.id}|{self.question_detail.name}"
        if q.type in [
            QuestionType.administration,
            QuestionType.number,
            QuestionType.answer_list,
        ]:
            answer = self.value
        if q.type in [QuestionType.text, QuestionType.geo, QuestionType.date]:
            answer = self.text
        if q.type == QuestionType.option:
            answer = self.options[0] if self.options else None
        if q.type == QuestionType.multiple_option:
            answer = "|".join(self.options) if self.options else None
        if q.type == QuestionType.photo:
            answer = self.text
        return {qname: answer}

    @property
    def to_project(self) -> dict:
        return {"id": self.data, "name": int(self.value)}

    @property
    def to_header(self) -> str:
        return f"{self.question_detail.id}|{self.question_detail.name}"


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
