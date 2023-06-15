# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
from typing import Optional
from datetime import datetime
from typing_extensions import TypedDict
from pydantic import BaseModel
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy import Column, ForeignKey
from sqlalchemy import Integer, Text, Enum, DateTime
import sqlalchemy.dialects.postgresql as pg
from .user import User
from db.connection import Base


class JobStatus(enum.Enum):
    pending = "pending"
    on_progress = "on_progress"
    failed = "failed"
    done = "done"


class JobType(enum.Enum):
    send_email = "send_email"
    validate_data = "validate_data"
    seed_data = "seed_data"
    download = "download"


class JobsDict(TypedDict):
    id: int
    type: JobType
    status: Optional[JobStatus] = JobStatus.pending
    info: Optional[dict] = None
    attempt: Optional[int] = None
    payload: str
    created_by: int
    created: Optional[str] = None
    available: Optional[datetime] = None


class JobStatusResponse(TypedDict):
    status: JobStatus
    attachment: Optional[str] = None


class Jobs(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    type = Column(Enum(JobType))
    status = Column(Enum(JobStatus), nullable=True, default="pending")
    attempt = Column(Integer, default=0)
    payload = Column(Text)
    info = Column(MutableDict.as_mutable(pg.JSONB), nullable=True)
    created_by = Column(Integer, ForeignKey(User.id))
    created = Column(DateTime, default=datetime.utcnow)
    available = Column(DateTime, nullable=True)

    def __init__(
        self,
        created_by: int,
        payload: str,
        type: JobType,
        info: Optional[dict] = None,
        status: Optional[JobStatus] = None,
        attempt: Optional[int] = None,
        available: Optional[datetime] = None,
    ):
        self.type = type
        self.info = info
        self.status = status
        self.payload = payload
        self.attempt = attempt
        self.created_by = created_by
        self.available = available

    def __repr__(self) -> int:
        return f"<Jobs {self.id}>"

    @property
    def serialize(self) -> JobsDict:
        return {
            "id": self.id,
            "type": self.type,
            "status": self.status,
            "payload": self.payload,
            "info": self.info,
            "attempt": self.attempt,
            "created_by": self.created_by,
            "created": self.created.strftime("%B %d, %Y at %I:%M %p"),
            "available": self.available,
        }

    @property
    def status_response(self) -> JobStatusResponse:
        return {"status": self.status, "attachment": self.payload}


class JobsBase(BaseModel):
    id: int
    type: JobType
    status: Optional[JobStatus] = JobStatus.pending
    payload: str
    info: Optional[dict] = None
    attempt: Optional[int] = 1
    created_by: int
    created: Optional[str] = None
    available: Optional[datetime] = None

    class Config:
        orm_mode = True
