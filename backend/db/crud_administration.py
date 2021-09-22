from typing import List
from sqlalchemy.orm import Session
from models.administration import Administration, AdministrationDict


def add_administration(session, data) -> AdministrationDict:
    session.add(data)
    session.commit()
    session.flush()
    session.refresh(data)
    return data


def get_administration(session: Session) -> List[Administration]:
    return session.query(Administration).all()


def get_administration_by_id(session: Session, id: int) -> Administration:
    return session.query(Administration).filter(
        Administration.id == id).first()
