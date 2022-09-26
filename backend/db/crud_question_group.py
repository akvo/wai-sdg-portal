from typing import List, Optional
from sqlalchemy.orm import Session
from models.question_group import QuestionGroup, QuestionGroupDict
from models.question_group import QuestionGroupBase
from sqlalchemy import and_


def get_last_question_group(session: Session, form: int):
    last_question_group = session.query(QuestionGroup).filter(
        QuestionGroup.form == form).order_by(
            QuestionGroup.order.desc()).first()
    if last_question_group:
        last_question_group = last_question_group.order + 1
    else:
        last_question_group = 1
    return last_question_group


def add_question_group(
    session: Session,
    form: int,
    name: str,
    id: Optional[int] = None,
    order: Optional[int] = None,
    description: Optional[str] = None,
    repeatable: Optional[bool] = False,
    repeat_text: Optional[str] = None,
    translations: Optional[List[dict]] = None
) -> QuestionGroupDict:
    last_question_group = get_last_question_group(
        session=session, form=form)
    question_group = QuestionGroup(
        id=id,
        name=name,
        form=form,
        order=order if order else last_question_group,
        description=description,
        repeatable=repeatable,
        repeat_text=repeat_text,
        translations=translations)
    session.add(question_group)
    session.commit()
    session.flush()
    session.refresh(question_group)
    return question_group


def update_question_group(
    session: Session,
    form: int,
    name: str,
    id: int,
    order: Optional[int] = None,
    description: Optional[str] = None,
    repeatable: Optional[bool] = False,
    repeat_text: Optional[str] = None,
    translations: Optional[List[dict]] = None
) -> QuestionGroupDict:
    last_question_group = get_last_question_group(
        session=session, form=form)
    question_group = session.query(QuestionGroup).filter(and_(
        QuestionGroup.form == form,
        QuestionGroup.id == id)).first()
    question_group.name = name,
    question_group.order = order if order else last_question_group
    question_group.description = description
    question_group.repeatable = repeatable
    question_group.repeat_text = repeat_text
    question_group.translations = translations
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
