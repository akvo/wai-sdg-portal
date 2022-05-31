from typing import List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from models.option import Option, OptionDictWithId
from models.question import Question


def get_option(session: Session) -> List[OptionDictWithId]:
    return session.query(Option).all()


def add_option(session: Session,
               question=int,
               name=str,
               order=Optional[str],
               score=Optional[str],
               color=Optional[str]) -> OptionDictWithId:
    question = session.query(Question).filter(Question.id == question).first()
    option = Option(name=name, order=order, color=color, score=score)
    question.option.append(option)
    session.flush()
    session.commit()
    session.refresh(option)
    return option


def update_option(session: Session,
                  id: int,
                  name: Optional[str] = None,
                  order: Optional[str] = None,
                  color: Optional[str] = None,
                  score: Optional[str] = None) -> OptionDictWithId:
    option = session.query(Option).filter(Option.id == id).first()
    option.order = order
    option.color = color
    option.score = score
    if name:
        option.name = name
    session.flush()
    session.commit()
    session.refresh(option)
    return option


def get_option_by_question_and_name(session: Session,
                                    name: str,
                                    question: int) -> Option:
    if not question:
        return None
    return session.query(Option).filter(
        Option.question == question,
        func.lower(Option.name) == name.lower().strip()).first()
