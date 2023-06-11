# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional
from datetime import datetime
from typing_extensions import TypedDict
from pydantic import BaseModel
from sqlalchemy import Column, ForeignKey
from sqlalchemy import Integer, Text, DateTime
from .user import User, UserBase
from .jobs import Jobs, JobsBase
from .jobs import JobType, JobStatus
from db.connection import Base
from sqlalchemy.orm import relationship


class LogDict(TypedDict):
    id: int
    user: int
    message: str
    attachment: Optional[str] = None
    status: Optional[JobStatus] = None
    at: datetime


class LogBase(BaseModel):
    id: int
    user: UserBase
    message: str
    jobs: Optional[JobsBase] = None
    at: datetime

    class Config:
        orm_mode = True


class Log(Base):
    __tablename__ = "log"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    message = Column(Text, nullable=False)
    user = Column(Integer, ForeignKey(User.id))
    jobs = Column(Integer, ForeignKey(Jobs.id), nullable=True)
    at = Column(DateTime, default=datetime.utcnow)
    jobs_detail = relationship(Jobs, backref="jobs")

    def __init__(
        self,
        message: str,
        user: int,
        jobs: Optional[int] = None,
        at: Optional[datetime] = None,
    ):
        self.message = message
        self.user = user
        self.jobs = jobs
        self.at = at

    def __repr__(self) -> int:
        return f"<Log {self.id}>"

    @property
    def serialize(self) -> LogBase:
        return {
            "id": self.id,
            "message": self.message,
            "user": self.user,
            "jobs": self.jobs,
            "at": self.at,
        }

    @property
    def response(self) -> LogDict:
        status = None
        attachment = None
        if self.jobs:
            status = self.jobs_detail.status
            if self.jobs_detail.type in [
                JobType.validate_data,
                JobType.download,
            ]:
                attachment = self.jobs_detail.payload
        return {
            "id": self.id,
            "message": self.message,
            "user": self.user,
            "jobs": self.jobs,
            "status": status,
            "attachment": attachment,
            "at": self.at,
        }
