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
from models.answer import AnswerDict, AnswerDictWithHistory, AnswerBase
from .form import Form
from .user import User
from .answer import Answer
from .administration import Administration
from .views.view_data import ViewData
from .jmp_history import JmpHistory
from AkvoResponseGrouper.models import CategoryDict


class GeoData(BaseModel):
    long: confloat(ge=-180.0, le=180.0)
    lat: confloat(ge=-90, le=90)


class DataDict(TypedDict):
    id: int
    name: str
    form: int
    created_by: str
    administration: Optional[int] = None
    geo: Optional[GeoData] = None
    updated_by: Optional[str] = None
    created: Optional[str] = None
    updated: Optional[str] = None
    answer: List[AnswerDict]


class DataDictWithHistory(DataDict):
    answer: List[AnswerDictWithHistory]


class SubmissionInfo(TypedDict):
    by: str
    at: str


class DataResponse(BaseModel):
    categories: List[CategoryDict]
    current: int
    data: List[DataDictWithHistory]
    total: int
    total_page: int


class Data(Base):
    __tablename__ = "data"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    name = Column(String)
    form = Column(Integer, ForeignKey(Form.id))
    administration = Column(Integer, ForeignKey(Administration.id))
    geo = Column(pg.ARRAY(Float), nullable=True)
    created_by = Column(Integer, ForeignKey(User.id), nullable=True)
    updated_by = Column(Integer, ForeignKey(User.id), nullable=True)
    created = Column(DateTime, nullable=True)
    updated = Column(DateTime, nullable=True)
    submitter = Column(String, nullable=True)
    answer = relationship(Answer,
                          cascade="all, delete",
                          passive_deletes=True,
                          backref="answer",
                          order_by=Answer.id.asc())
    created_by_user = relationship(User, foreign_keys=[created_by])
    updated_by_user = relationship(User, foreign_keys=[updated_by])
    administration_detail = relationship(Administration, backref="data")
    views = relationship(ViewData,
                         primaryjoin=ViewData.data == id,
                         foreign_keys=id,
                         viewonly=True)

    def __init__(
        self, name: str, form: int, administration: int,
        geo: List[float], created_by: int, updated_by: int,
        updated: datetime, created: datetime,
        submitter: Optional[str] = None
    ):
        self.name = name
        self.form = form
        self.administration = administration
        self.geo = geo
        self.created_by = created_by
        self.updated_by = updated_by
        self.updated = updated
        self.created = created
        self.submitter = submitter

    def __repr__(self) -> int:
        return f"<Data {self.id}>"

    @property
    def serialize(self) -> DataDict:
        created_by = None
        if self.created_by:
            created_by = self.created_by_user.name
        if not self.created_by and self.submitter:
            created_by = self.submitter
        return {
            "id": self.id,
            "name": self.name,
            "form": self.form,
            "administration": self.administration,
            "geo": {
                "lat": self.geo[0],
                "long": self.geo[1]
            } if self.geo else None,
            "created_by": created_by,
            "updated_by":
            self.updated_by_user.name if self.updated_by else None,
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
            "name": self.name,
            "loc": self.administration_detail.name,
            "geo": self.geo if self.geo else None,
        }

    @property
    def to_data_frame(self):
        created_by = None
        if self.created_by:
            created_by = self.created_by_user.name
        if not self.created_by and self.submitter:
            created_by = self.submitter
        data = {
            "id":
            self.id,
            "datapoint_name": self.name,
            "administration":
            self.administration_detail.name,
            "geolocation":
            f"{self.geo[0], self.geo[1]}" if self.geo else None,
            "created_by": created_by,
            "updated_by":
            self.updated_by_user.name if self.updated_by else None,
            "created_at":
            self.created.strftime("%B %d, %Y"),
            "updated_at":
            self.updated.strftime("%B %d, %Y") if self.updated else None,
        }
        for a in self.answer:
            data.update(a.to_data_frame)
        return data


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
