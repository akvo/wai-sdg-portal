from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.jobs import Jobs, JobsBase
from models.jobs import JobType, JobStatus


def add(session: Session, payload: str, type: JobType,
        created_by: int) -> JobsBase:
    jobs = Jobs(payload=payload, type=type, created_by=created_by)
    session.add(jobs)
    session.commit()
    session.flush()
    session.refresh(jobs)
    return jobs


def update(session: Session, id: int, status: JobStatus) -> JobsBase:
    jobs = Jobs.query(Jobs).filter(Jobs.id == id).first()
    jobs.status = status
    if status == JobStatus.done:
        jobs.available = datetime.now()
    session.flush()
    session.commit()
    session.refresh(jobs)
    return jobs


def status(session: Session, id: int) -> JobStatus:
    jobs = session.query(Jobs.status).filter(Jobs.id == id).first()
    return jobs.status


def pending(session: Session) -> JobsBase:
    return session.query(Jobs).filter(
        Jobs.status == JobStatus.pending).order_by(desc(Jobs.created)).first()


def is_not_busy(session: Session) -> bool:
    session.query(
        Jobs.id).filter(Jobs.status == JobStatus.on_progress).first() is None
