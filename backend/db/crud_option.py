from typing import List, Optional
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from models.option import Option, OptionDictWithId
from models.question import Question


def get_option(session: Session) -> List[OptionDictWithId]:
    return session.query(Option).all()


def add_option(
    session: Session,
    question=int,
    name=str,
    id=Optional[int],
    order=Optional[str],
    score=Optional[str],
    color=Optional[str],
    code: Optional[str] = None,
    translations: Optional[List[dict]] = None,
) -> OptionDictWithId:
    question = session.query(Question).filter(Question.id == question).first()
    option = Option(
        name=name,
        order=order,
        color=color,
        score=score,
        code=code,
        translations=translations,
    )
    question.option.append(option)
    session.flush()
    session.commit()
    session.refresh(option)
    return option


def update_option(
    session: Session,
    id: int,
    name: Optional[str] = None,
    order: Optional[str] = None,
    color: Optional[str] = None,
    score: Optional[str] = None,
    code: Optional[str] = None,
    translations: Optional[List[dict]] = None,
) -> OptionDictWithId:
    option = session.query(Option).filter(Option.id == id).first()
    option.order = order
    option.color = color
    option.score = score
    option.code = code
    option.translations = translations
    if name:
        option.name = name
    session.flush()
    session.commit()
    session.refresh(option)
    return option


def get_option_by_question_and_name(
    session: Session, name: str, question: int
) -> Option:
    if not question:
        return None
    return (
        session.query(Option)
        .filter(
            Option.question == question, func.lower(Option.name) == name.lower().strip()
        )
        .first()
    )


def get_options_if_exists(session: Session, names: List[str], question: int):
    return (
        session.query(Option.name, func.count(Option.name))
        .filter(
            Option.question == question,
            or_(*[Option.name.ilike(name) for name in names]),
        )
        .group_by(Option.name)
        .all()
    )
