from datetime import datetime
from fastapi import Depends, Request, APIRouter
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
import db.crud_data as crud
from db import crud_question
from models.answer import Answer, AnswerDict
from models.question import QuestionType
from db.connection import get_session
from models.data import DataDict
from middleware import verify_admin

security = HTTPBearer()
data_route = APIRouter()


def transform_data(d):
    answers = []
    for a in d["answer"]:
        answer = {"question": a.question}
        if a.text:
            answer.update({"value": a.text})
        if a.value:
            answer.update({"value": a.value})
        if a.options:
            answer.update({"value": a.options})
        answers.append(answer)
    d.update({"answer": answers})
    if d["geo"]:
        d.update({"geo": {"lat": d["geo"][0], "long": d["geo"][1]}})
    return d


@data_route.get("/data/{form_id:path}",
                response_model=List[DataDict],
                summary="get all datas",
                tags=["Data"])
def get_data(req: Request,
             form_id: int,
             session: Session = Depends(get_session)):
    data = crud.get_data(session=session, form=form_id)
    data = [f.serialize for f in data]
    for d in data:
        d = transform_data(d)
    return data


@data_route.post("/data/{form_id}",
                 response_model=DataDict,
                 summary="add new data",
                 name="data:create",
                 tags=["Data"])
def add_data(req: Request,
             form_id: int,
             answers: List[AnswerDict],
             session: Session = Depends(get_session),
             credentials: credentials = Depends(security)):
    user = verify_admin(req.state.authenticated, session)
    administration = None
    geo = None
    answerlist = []
    for a in answers:
        q = crud_question.get_question_type(session=session, id=a["question"])
        answer = Answer(question=q.id,
                        created_by=user.id,
                        created=datetime.now())
        if q.type == QuestionType.administration:
            administration = a["value"]
            answer.value = a["value"]
        if q.type == QuestionType.geo:
            geo = a["value"]
            answer.text = ("{}|{}").format(a["value"][0], a["value"][1])
        if q.type == QuestionType.text:
            answer.text = a["value"]
        if q.type == QuestionType.option:
            answer.options = a["value"]
        if q.type == QuestionType.multiple_option:
            answer.options = a["value"]
        answerlist.append(answer)
    name = "Testing Mantap"
    data = crud.add_data(session=session,
                         form=form_id,
                         name=name,
                         geo=geo,
                         administration=administration,
                         created_by=user.id,
                         answers=answerlist)
    data = transform_data(data.serialize)
    return data
