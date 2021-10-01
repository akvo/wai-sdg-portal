from datetime import datetime
from typing import List, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.answer import Answer, AnswerDict, AnswerBase
from models.history import History
from models.question import QuestionType


def update_answer(
    session: Session, answer: Answer, history: History, user: int,
    type: QuestionType, value: Union[int, float, str, bool, List[str],
                                     List[int], List[float]]
) -> AnswerDict:
    answer.updated_by = user
    answer.updated = datetime.now()
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
