from typing import List
from sqlalchemy.orm import Session
from models.data import Data
from models.views.view_data import ViewData
from models.answer import Answer


def get_data(session: Session,
             form: int,
             question: List[int],
             options: List[str] = None):
    data = session.query(Data).filter(Data.form == form)
    if options:
        data_id = session.query(ViewData.data).filter(
            ViewData.options.contains(options)).all()
        data = data.filter(Data.id.in_([d.data for d in data_id]))
    data = data.all()
    answer = session.query(Answer).filter(Answer.question.in_(question)).all()
    answer = [a.to_maps for a in answer]
    data = [d.to_maps for d in data]
    for d in data:
        values = filter(lambda x: x["data"] == d["id"], answer)
        d.update({"values": list(values)})
    return data
