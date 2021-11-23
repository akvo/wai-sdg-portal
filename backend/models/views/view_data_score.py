from typing_extensions import TypedDict
from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from typing import Optional
from db.connection import Base
from ..administration import Administration
from pydantic import BaseModel


class ViewDataScoreDict(TypedDict):
    data: int
    administration: int
    form: int
    question: Optional[int] = None
    option: Optional[str] = None
    score: Optional[int] = None


class GroupByDict(TypedDict):
    administration: int
    option: str
    count: int
    score: int


class ViewDataScore(Base):
    __tablename__ = "score_view"
    data = Column(Integer, primary_key=True)
    administration = Column(Integer, ForeignKey(Administration.id))
    form = Column(Integer)
    question = Column(Integer, nullable=True, primary_key=True)
    option = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)
    administration_detail = relationship(Administration, backref="score_view")

    def __repr__(self) -> int:
        return f"<ViewDataScore {self.data} {self.question}>"

    @property
    def serialize(self) -> ViewDataScoreDict:
        return {
            "data": self.data,
            "administration": self.administration,
            "form": self.form,
            "question": self.question,
            "option": self.option,
            "score": self.score
        }

    @property
    def serialize_jmp_group_by_parent(self):
        return {
            "data": self.data,
            "administration": self.administration_detail.parent,
            "option": self.option,
            "score": self.score
        }

    @property
    def serialize_jmp_group_no_parent(self):
        return {
            "data": self.data,
            "administration": self.administration,
            "option": self.option,
            "score": self.score
        }

    def group_serialize(data) -> GroupByDict:
        return {
            "administration": data.administration,
            "option": data.option,
            "count": data.count,
        }


class ViewDataScoreBase(BaseModel):
    data: int
    administration: int
    form: int
    question: Optional[int] = None
    option: Optional[str] = None
    score: Optional[int] = None

    class Config:
        orm_mode = True
