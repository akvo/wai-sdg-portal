from datetime import datetime
from typing import List, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from models.answer import Answer, AnswerDict, AnswerBase
from models.history import History
from models.question import QuestionType


def append_value(answer: Answer, value: Union[int, float, str, bool, List[str],
                                              List[int], List[float]],
                 type: QuestionType) -> Answer:
    if type == QuestionType.administration:
        answer.value = value
    if type == QuestionType.number:
        answer.value = value
    if type == QuestionType.text:
        answer.text = value
    if type == QuestionType.geo:
        answer.text = ("{}|{}").format(value[0], value[1])
    if type == QuestionType.option:
        answer.options = value
    if type == QuestionType.multiple_option:
        answer.options = value
    return answer


def add_answer(
    session: Session, answer: Answer, type: QuestionType,
    value: Union[int, float, str, bool, List[str], List[int], List[float]]
) -> AnswerDict:
    answer = append_value(answer, value, type)
    session.add(answer)
    session.commit()
    session.flush()
    session.refresh(answer)
    return answer


def update_answer(
    session: Session, answer: Answer, history: History, user: int,
    type: QuestionType, value: Union[int, float, str, bool, List[str],
                                     List[int], List[float]]
) -> AnswerDict:
    answer.updated_by = user
    answer.updated = datetime.now()
    answer = append_value(answer, value, type)
    session.add(history)
    session.commit()
    session.flush()
    session.refresh(answer)
    return answer


def get_answer(session: Session) -> List[AnswerDict]:
    return session.query(Answer).all()


def get_answer_by_data_and_question(session: Session, data: int,
                                    questions: List[int]) -> List[AnswerBase]:
    return session.query(Answer).filter(
        and_(Answer.question.in_(questions), Answer.data == data)).all()


def get_history(session: Session, data: int, question: int):
    answer = session.query(Answer).filter(
        and_(Answer.data == data, Answer.question == question)).first()
    answer = answer.simplified
    history = session.query(History).filter(
        and_(History.data == data,
             History.question == question)).order_by(desc(History.id)).all()
    answer.update({"history": [h.simplified for h in history]})
    return answer
