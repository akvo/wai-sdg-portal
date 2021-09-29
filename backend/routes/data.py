from fastapi import Depends, Request, APIRouter
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
import db.crud_data as crud
from db import crud_question
from models.answer import AnswerDict
from models.question import QuestionType
from db.connection import get_session
from models.data import DataDict
from middleware import verify_admin

security = HTTPBearer()
data_route = APIRouter()


@data_route.get("/data/{form_id:path}",
                response_model=List[DataDict],
                summary="get all datas",
                tags=["Data"])
def get_data(req: Request,
             form_id: int,
             session: Session = Depends(get_session)):
    data = crud.get_data(session=session, form=form_id)
    return [f.serialize for f in data]


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
    for answer in answers:
        qtype = crud_question.get_question_type(session=session,
                                                id=answer["question"])
        answer.update({"type": qtype})
        if qtype == QuestionType.administration:
            administration = answer["value"]
        if qtype == QuestionType.geo:
            geo = answer["value"]
    name = "Testing OK"
    data = crud.add_data(session=session,
                         form=form_id,
                         name=name,
                         geo=geo,
                         administration=administration,
                         created_by=user.id,
                         answer=answers)
    data = data.serialize
    if data["geo"]:
        data.update({"geo": {"lat": data["geo"][0], "long": data["geo"][1]}})
    return data
