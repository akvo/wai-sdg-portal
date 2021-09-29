from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from models.data import Data, DataDict
from models.answer import AnswerBase


def add_data(
    session: Session,
    name: str,
    form: int,
    administration: int,
    created_by: int,
    answers: List[AnswerBase],
    geo: Optional[List[float]] = None
) -> DataDict:
    data = Data(name=name,
                form=form,
                administration=administration,
                geo=geo,
                created_by=created_by,
                updated_by=None,
                created=datetime.now(),
                updated=None)
    for answer in answers:
        data.answer.append(answer)
    session.add(data)
    session.commit()
    session.flush()
    session.refresh(data)
    return data


def get_data(session: Session, form: int) -> List[DataDict]:
    return session.query(Data).filter(Data.form == form).all()
