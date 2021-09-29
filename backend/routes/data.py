from datetime import datetime
from math import ceil
from fastapi import Depends, Request, APIRouter, HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List, Optional
from sqlalchemy.orm import Session
import db.crud_data as crud
from db import crud_question
from db import crud_administration
from models.answer import Answer, AnswerDict
from models.question import QuestionType
from db.connection import get_session
from models.data import DataResponse, DataDict
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
                response_model=DataResponse,
                summary="get all datas",
                tags=["Data"])
def get_data(req: Request,
             form_id: int,
             page: int = 1,
             perpage: int = 10,
             administration: Optional[int] = None,
             session: Session = Depends(get_session)):
    data = crud.get_data(session=session,
                         form=form_id,
                         administration=administration,
                         skip=(perpage * (page - 1)),
                         perpage=perpage)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    data = [f.serialize for f in data]
    for d in data:
        d = transform_data(d)
    total = crud.count(session=session,
                       form=form_id,
                       administration=administration)
    total_page = ceil(total / 10) if total > 0 else 0
    if total_page < page:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        'current': page,
        'data': data,
        'total': total,
        'total_page': total_page
    }


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
    names = []
    for a in answers:
        q = crud_question.get_question_type(session=session, id=a["question"])
        answer = Answer(question=q.id,
                        created_by=user.id,
                        created=datetime.now())
        if q.type == QuestionType.administration:
            administration = a["value"]
            answer.value = a["value"]
            if q.meta:
                adm_name = crud_administration.get_administration_by_id(
                    session, id=administration)
                names.append(adm_name.name)
        if q.type == QuestionType.geo:
            geo = a["value"]
            answer.text = ("{}|{}").format(a["value"][0], a["value"][1])
        if q.type == QuestionType.text:
            answer.text = a["value"]
            if q.meta:
                names.append(a["value"])
        if q.type == QuestionType.number:
            answer.value = a["value"]
            if q.meta:
                names.append(str(a["value"]))
        if q.type == QuestionType.option:
            answer.options = a["value"]
        if q.type == QuestionType.multiple_option:
            answer.options = a["value"]
        answerlist.append(answer)
    name = " - ".join(names)
    data = crud.add_data(session=session,
                         form=form_id,
                         name=name,
                         geo=geo,
                         administration=administration,
                         created_by=user.id,
                         answers=answerlist)
    data = transform_data(data.serialize)
    return data
