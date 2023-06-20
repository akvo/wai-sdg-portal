from typing import List, Optional
from db.connection import engine
from sqlalchemy.orm import Session
from models.form import Form, FormDict, FormBase


def add_form(
    session: Session,
    name: str,
    id: Optional[int] = None,
    version: Optional[float] = None,
    description: Optional[str] = None,
    default_language: Optional[str] = None,
    languages: Optional[List[str]] = None,
    translations: Optional[List[dict]] = None,
) -> FormDict:
    form = Form(
        id=id,
        name=name,
        version=version if version else 1.0,
        description=description,
        default_language=default_language,
        languages=languages,
        translations=translations,
    )
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


def update_form(
    session: Session,
    id: int,
    name: str,
    version: Optional[float] = None,
    description: Optional[str] = None,
    default_language: Optional[str] = None,
    languages: Optional[List[str]] = None,
    translations: Optional[List[dict]] = None,
    passcode: Optional[str] = None,
) -> FormDict:
    form = session.query(Form).filter(Form.id == id).first()
    form.name = name
    if not form.version:
        form.version = 1.0
    if form.version:
        form.version = form.version + 1
    if version:
        form.version = version
    form.description = description
    form.default_language = default_language
    form.languages = languages
    form.translations = translations
    form.passcode = passcode
    session.commit()
    session.flush()
    session.refresh(form)
    return form


def delete_by_id(session: Session, id: int) -> None:
    session.query(Form).filter(Form.id == id).delete()
    session.commit()
