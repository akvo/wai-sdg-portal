from fastapi import HTTPException
from typing import Optional, List, Union
from typing_extensions import TypedDict
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import asc
from models.jobs import Jobs, JobsBase
from models.jobs import JobType, JobStatus, JobStatusResponse


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


def get_by_id(session: Session, id: int) -> JobsBase:
    jobs = session.query(Jobs).filter(Jobs.id == id).first()
    return jobs.serialize


def update(session: Session,
           id: int,
           payload: Optional[str] = None,
           status: Union[JobStatus] = None,
           type: Optional[Union[JobType]] = None,
           info: Optional[TypedDict] = None) -> JobsBase:
    jobs = session.query(Jobs).filter(Jobs.id == id).first()
    if payload:
        jobs.payload = payload
    if status:
        jobs.status = status
    if status == JobStatus.pending:
        jobs.attempt = jobs.attempt + 1
    if status == JobStatus.done:
        jobs.available = datetime.now()
    if info:
        jobs.info = info
    if type:
        jobs.type = type
    session.flush()
    session.commit()
    session.refresh(jobs)
    return jobs.serialize


def status(session: Session, id: int) -> JobStatusResponse:
    jobs = session.query(Jobs).filter(Jobs.id == id).first()
    if not jobs:
        raise HTTPException(status_code=404, detail="Not Found")
    return jobs.status_response


def pending(session: Session) -> Union[int, bool]:
    jobs = session.query(Jobs.id).filter(
        Jobs.status == JobStatus.pending).order_by(asc(Jobs.created)).first()
    return jobs.id if jobs else False


def is_not_busy(session: Session) -> bool:
    return session.query(
        Jobs.id).filter(Jobs.status == JobStatus.on_progress).first() is None
