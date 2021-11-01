from fastapi import HTTPException
from typing import Optional, List
from typing_extensions import TypedDict
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.jobs import Jobs, JobsBase
from models.jobs import JobType, JobStatus


def add(session: Session,
        payload: str,
        type: JobType,
        created_by: int,
        info: Optional[TypedDict] = None) -> JobsBase:
    jobs = Jobs(payload=payload, type=type, info=info, created_by=created_by)
    session.add(jobs)
    session.commit()
    session.flush()
    session.refresh(jobs)
    return jobs.serialize


def get(session: Session, user: int) -> List[JobsBase]:
    jobs = session.query(Jobs).filter(Jobs.created_by == user).all()
    return [j.serialize for j in jobs]


def update(session: Session, id: int, status: JobStatus) -> JobsBase:
    jobs = session.query(Jobs).filter(Jobs.id == id).first()
    jobs.status = status
    if status == JobStatus.done:
        jobs.available = datetime.now()
    session.flush()
    session.commit()
    session.refresh(jobs)
    return jobs.serialize


def status(session: Session, id: int) -> str:
    jobs = session.query(Jobs.status).filter(Jobs.id == id).first()
    if not jobs:
        raise HTTPException(status_code=404, detail="Not Found")
    return jobs.status


def pending(session: Session) -> JobsBase:
    jobs = session.query(Jobs).filter(
        Jobs.status == JobStatus.pending).order_by(desc(Jobs.created)).first()
    if not jobs:
        raise HTTPException(status_code=404, detail="Not Found")
    return jobs.serialize


def is_not_busy(session: Session) -> bool:
    return session.query(
        Jobs.id).filter(Jobs.status == JobStatus.on_progress).first() is None
