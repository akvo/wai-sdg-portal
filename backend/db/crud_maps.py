from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models.data import Data
from models.views.view_data import ViewData
from models.answer import Answer


def get_data(
    session: Session,
    form: int,
    skip: int,
    perpage: int,
    question: List[int],
    options: List[str] = None,
):
    data = session.query(Data).filter(Data.form == form)
    if options:
        # support multiple select options filter
        # change query to filter data by or_ condition
        or_query = or_(ViewData.options.contains([opt]) for opt in options)
        data_id = session.query(ViewData.data).filter(or_query).all()
        data = data.filter(Data.id.in_([d.data for d in data_id]))
    count = data.count()
    data = data.offset(skip).limit(perpage).all()
    answer = session.query(Answer).filter(Answer.question.in_(question)).all()
    answer = [a.to_maps for a in answer]
    data = [d.to_maps for d in data]
    for d in data:
        values = filter(lambda x: x["data"] == d["id"], answer)
        d.update({"values": list(values)})
    return data, count
