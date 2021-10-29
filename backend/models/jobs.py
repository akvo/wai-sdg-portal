# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
from typing import Optional
from datetime import datetime
from typing_extensions import TypedDict
from pydantic import BaseModel
from sqlalchemy import Column, ForeignKey
from sqlalchemy import Integer, Text, Enum, DateTime
from db.connection import Base


class JobStatus(enum.Enum):
    pending = 'pending'
    on_progress = 'on_progress'
    failed = 'failed'
    done = 'done'


class JobType(enum.Enum):
    send_email = 'send_email'
    validate_data = 'validate_data'
    seed_data = 'seed_data'


class JobsDict(TypedDict):
    type: JobType
    status: Optional[JobStatus] = None
    attempt: Optional[int] = None
    payload: str
    created_by: int
    created: Optional[datetime] = None
    available: Optional[datetime] = None


class Jobs(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    type = Column(Enum(JobType))
    status = Column(Enum(JobStatus), default=JobStatus.pending)
    attempt = Column(Integer, default=0)
    payload = Column(Text)
    created_by = Column(Integer, ForeignKey('user.id'))
    created = Column(DateTime, default=datetime.utcnow)
    available = Column(DateTime, nullable=True, default=None)

    def __init__(self,
                 created_by: int,
                 payload: str,
                 type: Optional[JobType] = None,
                 status: Optional[JobStatus] = None,
                 attempt: Optional[int] = None,
                 available: Optional[datetime] = None):
        self.type = type
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
            "attempt": self.attempt,
            "created_by": self.created_by,
            "created": self.created,
        }


class JobsBase(BaseModel):
    id: int
    type: JobType
    status: JobStatus
    payload: str
    attempt: int
    created_by: int
    created: datetime
    available: Optional[datetime] = None

    class Config:
        orm_mode = True
