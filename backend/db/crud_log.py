from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.log import Log, LogBase, LogDict


def add(
    session: Session, message: str, user: int, jobs: Optional[int] = None
) -> LogBase:
    log = Log(message=message, user=user, jobs=jobs)
    session.add(log)
    session.commit()
    session.flush()
    session.refresh(log)
    return log.serialize


def get(session: Session, user: int) -> List[LogDict]:
    log = session.query(Log).filter(Log.user == user).order_by(desc(Log.id)).all()
    return [x.response for x in log]


def get_by_id(session: Session, id: int) -> LogDict:
    log = session.query(Log).filter(Log.id == id).first()
    return log.response
