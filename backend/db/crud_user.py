import pandas as pd
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.user import User, UserRole, UserDict
from models.access import Access, AccessDict


def add_user(session: Session,
             email: str,
             organisation: int,
             role: UserRole,
             active: bool = False) -> UserDict:
    user = User(role=role,
                email=email,
                active=active,
                organisation=organisation)
    session.add(user)
    session.commit()
    session.flush()
    session.refresh(user)
    return user


def count(session: Session, active: int = 0) -> int:
    return session.query(User).filter(User.active == bool(active)).count()


def get_user(session: Session,
             skip: int = 0,
             limit: int = 10,
             active: int = 0) -> List[User]:
    return session.query(User).filter(User.active == bool(active)).order_by(
        desc(User.id)).offset(skip).limit(limit).all()


def update_user_by_id(session: Session, id: int, role: UserRole,
                      active: bool) -> UserDict:
    user = session.query(User).filter(User.id == id).first()
    user.role = role
    user.active = active
    session.flush()
    session.commit()
    session.refresh(user)
    return user


def get_user_by_id(session: Session, id: int) -> User:
    return session.query(User).filter(User.id == id).first()


def get_user_by_email(session: Session, email: str) -> User:
    return session.query(User).filter(User.email == email).first()


def add_access(session: Session, user: int,
               access: List[Access]) -> List[AccessDict]:
    curr = session.query(Access).filter(Access.user == user)
    if access:
        curr = curr.all()
        access = [{
            "user": a.user,
            "administration": a.administration,
            "new": True
        } for a in access]
        access = pd.DataFrame(access)
        if len(curr):
            curr = pd.DataFrame([c.serialize for c in curr])
            access = curr.merge(access,
                                on=['user', 'administration'],
                                how='outer')
            access['id'] = access['id'].fillna(0).astype(int)
            to_be_deleted = access[access['new'] != access['new']]
            access = access[access['id'] == 0]
            for d in to_be_deleted.to_dict('records'):
                session.query(Access).filter(Access.id == d['id']).delete()
                session.commit()
                session.flush()
        access = access.to_dict('records')
        for acc in access:
            acc = Access(user=acc["user"],
                         administration=acc["administration"])
            session.add(acc)
            session.commit()
            session.flush()
            session.refresh(acc)
    else:
        curr.delete()
        session.commit()
        session.flush()
    return access


def delete_all_access(session: Session, user: int):
    session.query(Access).filter(Access.user == user).delete()
    session.commit()
    session.flush()
