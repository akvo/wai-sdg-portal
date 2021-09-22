from typing import List
from sqlalchemy.orm import Session
from models.administration import Administration, AdministrationDict


def AddAdministration(session, data) -> AdministrationDict:
    session.add(data)
    session.commit()
    session.flush()
    session.refresh(data)
    return data


def GetAdministration(session: Session) -> List[Administration]:
    return session.query(Administration).all()


def GetAdministrationById(session: Session, id: int) -> Administration:
    return session.query(Administration).filter(
        Administration.id == id).first()
