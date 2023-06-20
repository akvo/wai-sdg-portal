from datetime import datetime
from typing import List, Union, Optional
from sqlalchemy.orm import Session, load_only
from sqlalchemy import Integer, and_, desc
from sqlalchemy.sql.expression import cast
from models.answer import Answer, AnswerDict, AnswerBase
from models.history import History
from models.data import Data
from models.question import QuestionType


def append_value(
    answer: Answer,
    value: Union[int, float, str, bool, List[str], List[int], List[float]],
    type: QuestionType,
) -> Answer:
    if type == QuestionType.administration:
        answer.value = value
    if type == QuestionType.number:
        answer.value = value
    if type == QuestionType.text:
        answer.text = value
    if type == QuestionType.date:
        answer.text = value
    if type == QuestionType.geo:
        answer.text = ("{}|{}").format(value[0], value[1])
    if type == QuestionType.option:
        answer.options = value
    if type == QuestionType.multiple_option:
        answer.options = value
    return answer


def add_answer(
    session: Session,
    answer: Answer,
    type: QuestionType,
    value: Union[int, float, str, bool, List[str], List[int], List[float]],
) -> AnswerDict:
    answer = append_value(answer, value, type)
    session.add(answer)
    session.commit()
    session.flush()
    # session.refresh(answer)
    return answer


def update_answer(
    session: Session,
    answer: Answer,
    history: History,
    user: int,
    type: QuestionType,
    value: Union[int, float, str, bool, List[str], List[int], List[float]],
) -> AnswerDict:
    answer.updated_by = user
    answer.updated = datetime.now()
    answer = append_value(answer, value, type)
    session.add(history)
    session.commit()
    session.flush()
    session.refresh(answer)
    return answer


def get_answer_by_question(
    session: Session, question: int, administrations: Optional[List[int]] = []
) -> List[AnswerDict]:
    if len(administrations):
        data = (
            session.query(Data)
            .filter(Data.administration.in_(administrations))
            .options(load_only("id"))
            .all()
        )
        return (
            session.query(Answer)
            .filter(
                and_(
                    Answer.question == question,
                    Answer.data.in_([d.id for d in data]),
                )
            )
            .all()
        )
    return session.query(Answer).filter(Answer.question == question).all()


def get_answer_by_data_and_question(
    session: Session, data: int, questions: List[int]
) -> List[AnswerBase]:
    return (
        session.query(Answer)
        .filter(and_(Answer.question.in_(questions), Answer.data == data))
        .all()
    )


def get_history(session: Session, data: int, question: int):
    answer = (
        session.query(Answer)
        .filter(and_(Answer.data == data, Answer.question == question))
        .first()
    )
    answer = answer.simplified
    history = (
        session.query(History)
        .filter(and_(History.data == data, History.question == question))
        .order_by(desc(History.id))
        .all()
    )
    history = [h.simplified for h in history]
    for h in history:
        if not h["user"]:
            data_detail = session.query(Data).filter(Data.id == data).first()
            h.update({"user": data_detail.submitter})
    return [answer] + history


def get_project_count(session: Session, question: int, value: int) -> int:
    return (
        session.query(Answer)
        .filter(
            and_(
                Answer.question == question,
                cast(Answer.value, Integer) == value,
            )
        )
        .count()
    )


def count_answer_by_question(session: Session, question: int) -> int:
    return session.query(Answer).filter(Answer.question == question).count()
