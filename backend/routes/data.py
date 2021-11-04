from http import HTTPStatus
from datetime import datetime
from math import ceil
from fastapi import Depends, Request, Response, APIRouter, HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List, Optional
from sqlalchemy.orm import Session
import db.crud_data as crud
from db import crud_question
from db import crud_administration
from db import crud_answer
from db import crud_form
from db import crud_user
from models.answer import Answer, AnswerDict
from models.question import QuestionType
from models.history import History
from db.connection import get_session
from models.data import DataResponse, DataDict, SubmissionInfo
from middleware import verify_admin

security = HTTPBearer()
data_route = APIRouter()


def get_administration_list(session: Session, id: int) -> List[int]:
    administration_ids = [id]
    administration = crud_administration.get_administration_by_id(session,
                                                                  id=id)
    if administration.children:
        for a in administration.cascade["children"]:
            administration_ids.append(a["value"])
    return administration_ids


@data_route.get("/data/form/{form_id:path}",
                response_model=DataResponse,
                name="data:get",
                summary="get all datas",
                tags=["Data"])
def get(req: Request,
        form_id: int,
        page: int = 1,
        perpage: int = 10,
        administration: Optional[int] = None,
        session: Session = Depends(get_session)):
    administration_ids = False
    if administration:
        administration_ids = get_administration_list(session=session,
                                                     id=administration)
    data = crud.get_data(session=session,
                         form=form_id,
                         administration=administration_ids,
                         skip=(perpage * (page - 1)),
                         perpage=perpage)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    data = [f.serialize for f in data]
    total = crud.count(session=session,
                       form=form_id,
                       administration=administration_ids)
    total_page = ceil(total / 10) if total > 0 else 0
    if total_page < page:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        'current': page,
        'data': data,
        'total': total,
        'total_page': total_page,
    }


@data_route.post("/data/form/{form_id:path}",
                 response_model=DataDict,
                 summary="add new data",
                 name="data:create",
                 tags=["Data"])
def add(req: Request,
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
            if len(a["value"]) == 2:
                administration = int(a["value"][1])
                answer.value = administration
                if q.meta:
                    adm_name = crud_administration.get_administration_by_id(
                        session, id=administration)
                    names.append(adm_name.name)
        if q.type == QuestionType.geo:
            if "lat" in a["value"] and "lng" in a["value"]:
                geo = [a["value"]["lat"], a["value"]["lng"]]
                answer.text = ("{}|{}").format(geo[0], geo[1])
        if q.type in [QuestionType.text, QuestionType.date]:
            answer.text = a["value"]
            if q.meta:
                names.append(a["value"])
        if q.type == QuestionType.number:
            answer.value = a["value"]
            if q.meta:
                names.append(str(a["value"]))
        if q.type == QuestionType.option:
            answer.options = [a["value"]]
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
    return data.serialize


@data_route.get("/data/{id:path}",
                response_model=DataDict,
                summary="get data by id",
                name="data:get_by_id",
                tags=["Data"])
def get_by_id(req: Request,
              id: int,
              session: Session = Depends(get_session),
              credentials: credentials = Depends(security)):
    data = crud.get_data_by_id(session=session, id=id)
    if not data:
        raise HTTPException(status_code=404,
                            detail="data {} is not found".format(id))
    return data.serialize


@data_route.delete("/data/{id:path}",
                   responses={204: {
                       "model": None
                   }},
                   status_code=HTTPStatus.NO_CONTENT,
                   summary="delete data",
                   name="data:delete",
                   tags=["Data"])
def delete(req: Request,
           id: int,
           session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    verify_admin(req.state.authenticated, session)
    crud.delete_by_id(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


@data_route.put("/data/{id:path}",
                response_model=DataDict,
                summary="update data",
                name="data:update",
                tags=["Data"])
def update_by_id(req: Request,
                 id: int,
                 answers: List[AnswerDict],
                 session: Session = Depends(get_session),
                 credentials: credentials = Depends(security)):
    user = verify_admin(req.state.authenticated, session)
    data = crud.get_data_by_id(session=session, id=id)
    form = crud_form.get_form_by_id(session=session, id=data.form)
    questions = form.list_of_questions
    current_answers = crud_answer.get_answer_by_data_and_question(
        session=session, data=id, questions=[a["question"] for a in answers])
    checked = {}
    [checked.update(a.dicted) for a in current_answers]
    for a in answers:
        execute = "update"
        if a["question"] not in list(questions):
            raise HTTPException(
                status_code=401,
                detail="question {} is not part of this form".format(
                    a["question"]))
        a.update({"type": questions[a["question"]]})
        if a["type"] == QuestionType.option:
            a.update({"value": [a["value"]]})
        if a['question'] in list(checked):
            execute = "update"
        else:
            execute = "new"
        if execute == "update" and a["value"] != checked[
                a["question"]]["value"]:
            answer = checked[a["question"]]["data"]
            history = answer.serialize
            del history['id']
            history = History(**history)
            a = crud_answer.update_answer(session=session,
                                          answer=answer,
                                          history=history,
                                          user=user.id,
                                          type=questions[a["question"]],
                                          value=a["value"])
        if execute == "new":
            answer = Answer(question=a["question"],
                            data=data.id,
                            created_by=user.id,
                            created=datetime.now())
            a = crud_answer.add_answer(session=session,
                                       answer=answer,
                                       type=questions[a["question"]],
                                       value=a["value"])
        if execute:
            data.updated_by = user.id
            data.updated = datetime.now()
            data = crud.update_data(session=session, data=data)
    return data.serialize


@data_route.get("/last-submitted",
                response_model=SubmissionInfo,
                summary="get last submission",
                name="data:last-submitted",
                tags=["Data"])
def get_last_submission(req: Request,
                        form_id: int,
                        administration: Optional[int] = None,
                        session: Session = Depends(get_session)):
    administration_ids = False
    if administration:
        administration_ids = get_administration_list(session=session,
                                                     id=administration)
    last_submitted = crud.get_last_submitted(session=session,
                                             form=form_id,
                                             administration=administration_ids)
    if not last_submitted:
        raise HTTPException(status_code=404, detail="Not found")
    last_submitted = last_submitted.submission_info
    last_submitted_user = crud_user.get_user_by_id(session=session,
                                                   id=last_submitted["by"])
    last_submitted.update({
        'by': last_submitted_user.name,
        'at': last_submitted["at"].strftime("%B %d, %Y")
    })
    return last_submitted


@data_route.get("/history/{data_id:path}/{question_id:path}",
                summary="get answer with it's history",
                name="data:history",
                tags=["Data"])
def get_history(req: Request,
                data_id: int,
                question_id: int,
                session: Session = Depends(get_session)):
    answer = crud_answer.get_history(session=session,
                                     data=data_id,
                                     question=question_id)
    return answer
