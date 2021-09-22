from typing import List
from sqlalchemy.orm import Session
from models.form import Form, FormDict, FormBase


def add_form(session: Session, name: str) -> FormDict:
    form = Form(name=name)
    session.add(form)
    session.commit()
    session.flush()
    session.refresh(form)
    return form


def get_form(session: Session) -> List[FormDict]:
    return session.query(Form).all()


def get_form_by_id(session: Session, id: int) -> FormBase:
    return session.query(Form).filter(Form.id == id).first()
