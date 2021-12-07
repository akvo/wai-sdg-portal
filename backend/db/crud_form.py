from typing import List, Optional
from db.connection import engine
from sqlalchemy.orm import Session
from models.form import Form, FormDict, FormBase


def add_form(
    session: Session,
    name: str,
    id: Optional[int] = None,
) -> FormDict:
    form = Form(name=name, id=id)
    session.add(form)
    session.commit()
    session.flush()
    session.refresh(form)
    return form


def get_form(session: Session) -> List[FormDict]:
    return session.query(Form).all()


def get_form_by_id(session: Session, id: int) -> FormBase:
    return session.query(Form).filter(Form.id == id).first()


def get_form_by_name(session: Session, name: str) -> FormBase:
    return session.query(Form).filter(Form.name == name.upper()).first()


def search_form_by_name(session: Session, name: str) -> FormBase:
    return session.query(Form).filter(Form.name.ilike(f"{name}%")).first()


def get_form_name(session: Session, id: int) -> str:
    form = session.query(Form.name).filter(Form.id == id).first()
    return form.name


# UTIL
def get_form_list():
    session = Session(engine)
    form = session.query(Form).all()
    return [f"{f.id} - {f.name}" for f in form]
