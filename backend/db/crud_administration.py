from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.administration import Administration, AdministrationDict


def add_administration(session, data: Administration) -> AdministrationDict:
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


def get_administration_name(session: Session,
                            id: Optional[int] = None,
                            name: Optional[List[str]] = None) -> str:
    if not name:
        name = []
    administration = session.query(Administration).filter(
        Administration.id == id).first()
    name.append(administration.name)
    if administration.parent:
        get_administration_name(session=session,
                                id=administration.parent,
                                name=name)
    return ", ".join(name)


def get_administration_list(session: Session, id: int) -> List[int]:
    administration_ids = [id]
    administration = get_administration_by_id(session, id=id)
    if administration.children:
        for a in administration.cascade["children"]:
            administration_ids.append(a["value"])
    return administration_ids


def get_all_childs(session: Session,
                   parents: Optional[List[int]] = None,
                   current: Optional[List[int]] = []) -> List[int]:
    if parents is None:
        current = session.query(Administration.id).all()
        current = [c[0] for c in current]
    else:
        childrens = session.query(Administration).filter(
            Administration.parent.in_(parents)).all()
        has_childs = False
        current = current + [c.id for c in childrens]
        for c in childrens:
            if not has_childs and len(c.children):
                has_childs = True
        if has_childs:
            current = get_all_childs(session=session,
                                     current=current,
                                     parents=current)
        else:
            current = parents + current
    return current
