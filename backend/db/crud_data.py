from datetime import datetime
from typing import List, Optional
from typing_extensions import TypedDict
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from models.data import Data, DataDict
from models.answer import Answer
from models.history import History
from models.views.view_data import ViewData
from models.answer import AnswerBase
# from models.views.view_data_score import ViewDataScore


class PaginatedData(TypedDict):
    data: List[DataDict]
    count: int


def bulk_add_data(session: Session,
                  name: str,
                  form: int,
                  administration: int,
                  created_by: int,
                  answers: List[AnswerBase],
                  geo: Optional[List[float]] = None) -> None:
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
    session.query(History).filter(History.data == id).delete()
    session.query(Answer).filter(Answer.data == id).delete()
    session.query(Data).filter(Data.id == id).delete()
    session.commit()


def delete_bulk(session: Session, ids: List[int]) -> None:
    session.query(History).filter(
        History.data.in_(ids)).delete(synchronize_session='fetch')
    session.query(Answer).filter(
        Answer.data.in_(ids)).delete(synchronize_session='fetch')
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
    data_id = False
    if options:
        # support multiple select options filter
        # change query to filter data by or_ condition
        or_query = or_(ViewData.options.contains([opt]) for opt in options)
        data_id = session.query(ViewData.data).filter(or_query).all()
        data = data.filter(Data.id.in_([d.data for d in data_id]))
    if administration:
        data = data.filter(Data.administration.in_(administration))
    count = data.count()
    # TODO: getting the score
    # if no question order data by id desc
    data = data.order_by(desc(Data.id))

    data = data.offset(skip).limit(perpage).all()
    return PaginatedData(data=data, count=count)


def get_data_by_id(session: Session, id: int) -> DataDict:
    return session.query(Data).filter(Data.id == id).first()


def get_data_by_name(session: Session, name: str) -> DataDict:
    return session.query(Data).filter(Data.name == name).first()


def get_data_name_by_id(session: Session, id: int) -> str:
    return session.query(Data).filter(Data.id == id).first().name


def count(session: Session,
          form: int,
          options: List[str] = None,
          administration: List[int] = None) -> int:
    data = session.query(Data).filter(Data.form == form)
    if options:
        data_id = session.query(ViewData.data).filter(
            ViewData.options.contains(options)).all()
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
        # support multiple select options filter
        # change query to filter data by or_ condition
        or_query = or_(ViewData.options.contains([opt]) for opt in options)
        data_id = session.query(ViewData.data).filter(or_query).all()
        data = data.filter(Data.id.in_([d.data for d in data_id]))
    if administration:
        data = data.filter(Data.administration.in_(administration))
    return data.order_by(Data.id.desc()).first()


def download(session: Session,
             form: int,
             options: List[str] = None,
             administration: List[int] = None):
    data = session.query(Data).filter(Data.form == form)
    if options:
        data_id = session.query(ViewData.data).filter(
            ViewData.options.contains(options)).all()
        data = data.filter(Data.id.in_([d.data for d in data_id]))
    if administration:
        data = data.filter(Data.administration.in_(administration))
    data = data.order_by(desc(Data.id)).all()
    return [d.to_data_frame for d in data]
