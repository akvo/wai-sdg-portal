from datetime import datetime
from typing import List, Optional
from typing_extensions import TypedDict
from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.data import Data, DataDict
from models.views.view_data import ViewData
from models.answer import AnswerBase


class PaginatedData(TypedDict):
    data: List[DataDict]
    count: int


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


def delete_by_id(session: Session, id: int) -> None:
    data = session.query(Data).filter(Data.id == id).one()
    session.delete(data)
    session.commit()


def delete_bulk(session: Session, ids: List[int]) -> None:
    session.query(Data).filter(
        Data.id.in_(ids)).delete(synchronize_session='fetch')
    session.commit()


def get_data(session: Session,
             form: int,
             skip: int,
             perpage: int,
             options: List[str] = None,
             administration: List[int] = None) -> PaginatedData:
    data = session.query(Data).filter(Data.form == form)
    if options:
        data_id = session.query(ViewData.data).filter(
            ViewData.options.overlap(options)).all()
        data = data.filter(Data.id.in_([d.data for d in data_id]))
    if administration:
        data = data.filter(Data.administration.in_(administration))
    count = data.count()
    data = data.order_by(desc(Data.id)).offset(skip).limit(perpage).all()
    return PaginatedData(data=data, count=count)


def get_data_by_id(session: Session, id: int) -> DataDict:
    return session.query(Data).filter(Data.id == id).first()


def count(session: Session,
          form: int,
          options: List[str] = None,
          administration: List[int] = None) -> int:
    data = session.query(Data).filter(Data.form == form)
    if options:
        data_id = session.query(ViewData.data).filter(
            ViewData.options.overlap(options)).all()
        data = data.filter(Data.id.in_([d.data for d in data_id]))
    if administration:
        data = data.filter(Data.administration.in_(administration))
    return data.group_by(Data.id).count()


def get_last_submitted(session: Session,
                       form: int,
                       options: List[str] = None,
                       administration: List[int] = None) -> DataDict:
    data = session.query(Data).filter(Data.form == form)
    if options:
        data_id = session.query(ViewData.data).filter(
            ViewData.options.overlap(options)).all()
        data = data.filter(Data.id.in_([d.data for d in data_id]))
    if administration:
        data = data.filter(Data.administration.in_(administration))
    return data.order_by(Data.id.desc()).first()
