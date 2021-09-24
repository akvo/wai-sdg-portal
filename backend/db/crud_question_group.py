from typing import List, Optional
from sqlalchemy.orm import Session
from models.question_group import QuestionGroup, QuestionGroupDict
from models.question_group import QuestionGroupBase


def add_question_group(session: Session,
                       form: int,
                       name: str,
                       order: Optional[int] = None) -> QuestionGroupDict:
    last_question_group = session.query(QuestionGroup).filter(
        QuestionGroup.form == form).order_by(
            QuestionGroup.order.desc()).first()
    if last_question_group:
        last_question_group = last_question_group.order + 1
    else:
        last_question_group = 1
    question_group = QuestionGroup(name=name,
                                   form=form,
                                   order=last_question_group)
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
    result = result.first()
    if not result:
        return None
    return result
