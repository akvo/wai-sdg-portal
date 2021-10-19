from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from models.data import Data, DataDict
from models.answer import AnswerBase


def add_data(session: Session,
             name: str,
             form: int,
             administration: int,
             created_by: int,
             answers: List[AnswerBase],
             geo: Optional[List[float]] = None) -> DataDict:
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


def update_data(session: Session, data: Data) -> DataDict:
    session.commit()
    session.flush()
    session.refresh(data)
    return data


def get_data(session: Session,
             form: int,
             skip: int,
             perpage: int,
             administration: List[int] = None) -> List[DataDict]:
    data = session.query(Data)
    if administration:
        data = data.filter(
            and_(Data.form == form, Data.administration.in_(administration)))
    else:
        data = data.filter(Data.form == form)
    return data.order_by(desc(Data.id)).offset(skip).limit(perpage).all()


def get_data_by_id(session: Session, id: int) -> DataDict:
    return session.query(Data).filter(Data.id == id).first()


def count(session: Session,
          form: int,
          administration: List[int] = None) -> int:
    data = session.query(Data)
    if administration:
        data = session.query(Data).filter(
            and_(Data.form == form, Data.administration.in_(administration)))
    else:
        data = data.filter(Data.form == form)
    return data.count()
