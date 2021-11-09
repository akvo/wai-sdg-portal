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


def get_parent_administration(
        session: Session,
        access: Optional[List[int]] = False) -> List[Administration]:
    if access:
        return session.query(Administration).filter(
            and_(Administration.parent.is_(None),
                 Administration.id.in_(access))).all()
    return session.query(Administration).filter(
        Administration.parent.is_(None)).all()


def get_administration(session: Session) -> List[Administration]:
    return session.query(Administration).all()


def get_administration_by_id(session: Session, id: int) -> Administration:
    return session.query(Administration).filter(
        Administration.id == id).first()


def get_administration_by_name(session: Session,
                               name: str,
                               parent: Optional[int] = None) -> Administration:
    if parent:
        return session.query(Administration).filter(
            and_(Administration.parent == parent,
                 Administration.name == name.strip())).first()
    return session.query(Administration).filter(
        Administration.name == name.strip()).first()


def get_administration_by_keyword(
        session: Session,
        name: str,
        parent: Optional[int] = None) -> Administration:
    return session.query(Administration).filter(
        and_(Administration.parent == parent,
             Administration.name.match("%{}%".format(name)))).all()


def get_administration_id_by_keyword(
        session: Session,
        name: str,
        parent: Optional[int] = None) -> Administration:
    administration = session.query(Administration.id).filter(
        and_(Administration.parent == parent,
             Administration.name.match("%{}%".format(name)))).first()
    if administration:
        return administration.id
    return False


def get_nested_children_ids(session: Session,
                            current: Optional[List[int]] = [],
                            parents: Optional[List[int]] = None):
    if parents is None:
        current = session.query(Administration.id).all()
        current = [c.id for c in current]
    else:
        for parent in parents:
            childrens = session.query(Administration.id).filter(
                Administration.parent == parent).all()
            if childrens:
                for children in childrens:
                    current.append(children.id)
                current = get_nested_children_ids(
                    session=session,
                    current=current,
                    parents=[c.id for c in childrens])
    return current
