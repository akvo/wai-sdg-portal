from sqlalchemy.orm import Session
from models.question_group import QuestionGroup, QuestionGroupDict
from models.question_group import QuestionGroupBase


def add_question_group(session: Session, form: int,
                       name: str) -> QuestionGroupDict:
    question_group = QuestionGroup(name=name, form=form)
    session.add(question_group)
    session.commit()
    session.flush()
    session.refresh(question_group)
    return question_group


def get_question_group_by_form_id(session: Session,
                                  form_id: int) -> QuestionGroupBase:
    return session.query(QuestionGroup).filter(
        QuestionGroup.form == form_id).all()
