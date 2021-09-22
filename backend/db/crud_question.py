from typing import List
from sqlalchemy.orm import Session
from models.question import Question, QuestionDict, QuestionBase


def add_question(session: Session, name: str) -> QuestionDict:
    question = Question(name=name)
    session.add(question)
    session.commit()
    session.flush()
    session.refresh(question)
    return question


def get_question(session: Session) -> List[QuestionDict]:
    return session.query(Question).all()
