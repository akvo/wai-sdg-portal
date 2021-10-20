from typing import List
from sqlalchemy.orm import Session
from models.data import Data
from models.answer import Answer


def get_data(session: Session,
             form: int,
             question: List[int]):
    data = session.query(Data).filter(Data.form == form).all()
    answer = session.query(Answer).filter(Answer.question.in_(question)).all()
    answer = [a.to_maps for a in answer]
    data = [d.to_maps for d in data]
    for d in data:
        values = filter(lambda x: x["data"] == d["id"], answer)
        d.update({"values": list(values)})
    return data
