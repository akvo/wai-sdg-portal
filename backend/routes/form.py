import os
from fastapi import Depends, Request, APIRouter
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
import db.crud_form as crud
import db.crud_administration as crud_administration
from db.connection import get_session
from models.form import FormDict, FormBase
from models.user import UserRole
from models.question import QuestionType
from middleware import verify_admin, verify_editor
from source.geoconfig import GeoCenter

INSTANCE_NAME = os.environ["INSTANCE_NAME"]
class_path = INSTANCE_NAME.replace("-", "_")
security = HTTPBearer()
form_route = APIRouter()

geo_center = GeoCenter[class_path].value
geo_center = {"lat": geo_center[1], "lng": geo_center[0]}


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
    return form.serialize


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
