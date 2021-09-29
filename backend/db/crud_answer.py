from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from models.answer import Answer, AnswerDict, AnswerBase


def add_or_update_answer(
    session: Session,
    question: int,
    data: int,
    updated_by: int,
    text: Optional[str] = None,
    value: Optional[float] = None,
    option: Optional[List] = None,
) -> AnswerDict:
    answer = Answer(question=question,
                    data=int,
                    text=text,
                    value=value,
                    updated_by=updated_by,
                    created=datetime.now())
    session.add(answer)
    session.commit()
    session.flush()
    session.refresh(answer)
    return answer


def get_answer(session: Session) -> List[AnswerDict]:
    return session.query(Answer).all()


def get_answer_by_id(session: Session, id: int) -> AnswerBase:
    return session.query(Answer).filter(Answer.id == id).first()
