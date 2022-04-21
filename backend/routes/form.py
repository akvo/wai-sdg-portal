import os
from fastapi import Depends, Request, APIRouter
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
import db.crud_form as crud
import db.crud_data as crud_data
import db.crud_question as crud_question
import db.crud_answer as crud_answer
import db.crud_administration as crud_administration
from db.connection import get_session
from models.form import FormDict, FormBase
from models.user import UserRole
from models.question import QuestionType, QuestionDict
from middleware import verify_admin, verify_editor
from source.geoconfig import GeoCenter

INSTANCE_NAME = os.environ["INSTANCE_NAME"]
class_path = INSTANCE_NAME.replace("-", "_")
security = HTTPBearer()
form_route = APIRouter()

geo_center = GeoCenter[class_path].value
geo_center = {"lat": geo_center[1], "lng": geo_center[0]}


# PROJECT BASE
def get_project_form(session: Session, form: FormBase,
                     project: QuestionDict) -> FormBase:
    question_group = []
    for qg in form["question_group"]:
        qg = qg.serialize
        questions = []
        for q in qg["question"]:
            q = q.serialize
            if q["id"] == project.id:
                projects = crud_answer.get_answer_by_question(
                    session=session, question=project.option[0].name)
                option = [p.to_project for p in projects]
                for o in option:
                    data_id = o["id"]
                    data_name = crud_data.get_data_name_by_id(session=session,
                                                              id=data_id)
                    o.update({"name": f"{data_id} - {data_name}"})
                q.update({"option": option})
            questions.append(q)
        qg.update({"question": questions})
        question_group.append(qg)
    form.update({"question_group": question_group})
    return form
# END PROJECT BASE


@form_route.get("/form/",
                response_model=List[FormDict],
                summary="get all forms",
                tags=["Form"])
def get(req: Request, session: Session = Depends(get_session)):
    form = crud.get_form(session=session)
    return [f.serialize for f in form]


@form_route.get("/form/{id:path}",
                response_model=FormBase,
                summary="get form by id",
                name="form:get_by_id",
                tags=["Form"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    form = crud.get_form_by_id(session=session, id=id)
    project = crud_question.get_project_question(session=session, form=id)
    form = form.serialize
    if project:
        form = get_project_form(session=session, form=form, project=project)
    return form


@form_route.get("/webform/{id:path}",
                summary="get form by id",
                name="form:get_by_id",
                tags=["Form"])
def get_webform_by_id(req: Request,
                      id: int,
                      session: Session = Depends(get_session)):
    user = verify_editor(req.state.authenticated, session)
    access = [a.administration for a in user.access]
    form = crud.get_form_by_id(session=session, id=id)
    form = form.serialize
    form["question_group"] = [qg.serialize for qg in form["question_group"]]
    for qg in form["question_group"]:
        qg["question"] = [q.serialize for q in qg["question"]]
        for q in qg["question"]:
            if q["type"] == QuestionType.administration:
                q.update({"option": "administration"})
                q.update({"type": "cascade"})
            if q["type"] == QuestionType.geo:
                q.update({"center": geo_center})
    administration = crud_administration.get_parent_administration(
        session=session,
        access=None if user.role == UserRole.admin else access)
    form.update(
        {"cascade": {
            "administration": [a.cascade for a in administration]
        }})
    return form


@form_route.post("/form/",
                 response_model=FormDict,
                 summary="add new form",
                 name="form:create",
                 tags=["Form"])
def add(req: Request,
        name: str,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    verify_admin(req.state.authenticated, session)
    form = crud.add_form(session=session, name=name)
    return form.serialize
