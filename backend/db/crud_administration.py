from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.administration import Administration, AdministrationDict


def add_administration(session, data) -> AdministrationDict:
    session.add(data)
    session.commit()
    session.flush()
    session.refresh(data)
    return data


def get_parent_administration(session: Session) -> List[Administration]:
    return session.query(Administration).filter(
        Administration.parent == None).all()


def get_administration(session: Session) -> List[Administration]:
    return session.query(Administration).all()


def get_administration_by_id(session: Session, id: int) -> Administration:
    return session.query(Administration).filter(
        Administration.id == id).first()


def get_administration_by_name(session: Session,
                               name: str,
                               parent: Optional[int] = None) -> Administration:
    return session.query(Administration).filter(
        and_(Administration.parent == parent,
             Administration.name == name.strip())).first()


def get_administration_by_keyword(
        session: Session,
        name: str,
        parent: Optional[int] = None) -> Administration:
    return session.query(Administration).filter(
        and_(Administration.parent == parent,
             Administration.name.match("%{}%".format(name)))).all()
