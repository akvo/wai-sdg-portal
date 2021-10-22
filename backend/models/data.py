# Please don't use **kwargs
# Keep the code clean and CLEAR

from datetime import datetime
from typing_extensions import TypedDict
from typing import Optional, List
from pydantic import BaseModel
from pydantic import confloat
from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy.orm import relationship
from db.connection import Base
from models.answer import AnswerDict, AnswerBase


class GeoData(BaseModel):
    long: confloat(ge=-180.0, le=180.0)
    lat: confloat(ge=-90, le=90)


class DataDict(TypedDict):
    id: int
    name: str
    form: int
    administration: int
    geo: Optional[GeoData] = None
    created_by: str
    updated_by: Optional[str] = None
    created: Optional[str] = None
    updated: Optional[str] = None
    answer: List[AnswerDict]


class SubmissionInfo(TypedDict):
    by: str
    at: str


class DataResponse(BaseModel):
    current: int
    data: List[DataDict]
    total: int
    total_page: int


class Data(Base):
    __tablename__ = "data"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    name = Column(String)
    form = Column(Integer, ForeignKey('form.id'))
    administration = Column(Integer, ForeignKey('administration.id'))
    geo = Column(pg.ARRAY(Float), nullable=True)
    created_by = Column(Integer, ForeignKey('user.id'))
    updated_by = Column(Integer, ForeignKey('user.id'), nullable=True)
    created = Column(DateTime, nullable=True)
    updated = Column(DateTime, nullable=True)
    answer = relationship("Answer",
                          cascade="all, delete",
                          passive_deletes=True,
                          backref="answer")
    created_by_user = relationship("User", foreign_keys=[created_by])
    updated_by_user = relationship("User", foreign_keys=[updated_by])
    administration_detail = relationship("Administration", backref="data")

    def __init__(self, name: str, form: int, administration: int,
                 geo: List[float], created_by: int, updated_by: int,
                 updated: datetime, created: datetime):
        self.name = name
        self.form = form
        self.administration = administration
        self.geo = geo
        self.created_by = created_by
        self.updated_by = updated_by
        self.updated = updated
        self.created = created

    def __repr__(self) -> int:
        return f"<Data {self.id}>"

    @property
    def serialize(self) -> DataDict:
        return {
            "id": self.id,
            "name": self.name,
            "form": self.form,
            "administration": self.administration,
            "geo": {
                "lat": self.geo[0],
                "long": self.geo[1]
            } if self.geo else None,
            "created_by": self.created_by_user.name,
            "updated_by": self.updated_by_user.name if self.updated_by else None,
            "created": self.created.strftime("%B %d, %Y"),
            "updated":
            self.updated.strftime("%B %d, %Y") if self.updated else None,
            "answer": [a.formatted for a in self.answer],
        }

    @property
    def submission_info(self):
        return {"by": self.created_by, "at": self.created}

    @property
    def updates_info(self):
        return {"by": self.updated_by, "at": self.updated}

    @property
    def to_maps(self):
        return {
            "id": self.id,
            "loc": self.administration_detail.name,
            "geo": [self.geo[1], self.geo[0]] if self.geo else None,
        }


class DataBase(BaseModel):
    id: int
    name: str
    form: int
    administration: int
    geo: Optional[GeoData] = None
    created_by: str
    updated_by: Optional[str] = None
    created: Optional[str] = None
    updated: Optional[str] = None
    answer: List[AnswerBase]

    class Config:
        orm_mode = True
