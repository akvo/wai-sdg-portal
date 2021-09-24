from typing import List, Optional
from sqlalchemy.orm import Session
from models.question_group import QuestionGroup, QuestionGroupDict
from models.question_group import QuestionGroupBase


def add_question_group(session: Session,
                       form: int,
                       name: str,
                       order: Optional[int] = None) -> QuestionGroupDict:
    question_group = QuestionGroup(name=name, form=form)
    session.add(question_group)
    session.commit()
    session.flush()
    session.refresh(question_group)
    return question_group


def search_question_group(session: Session, form: int,
                          name: str) -> List[QuestionGroupBase]:
    result = session.query(QuestionGroup).filter(QuestionGroup.form == form)
    if name:
        result = result.filter(QuestionGroup.name == name)
    return result.first()
