import os
from fastapi import Depends, Request, APIRouter, BackgroundTasks
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
import db.crud_form as crud
import db.crud_data as crud_data
import db.crud_question as crud_question
import db.crud_answer as crud_answer
import db.crud_administration as crud_administration
import db.crud_question_group as crud_question_group
from db.connection import get_session
from models.form import FormDict, FormBase
from models.user import UserRole
from models.question import QuestionType, QuestionDict
from middleware import verify_user, verify_admin, verify_editor
from source.geoconfig import GeoCenter

INSTANCE_NAME = os.environ["INSTANCE_NAME"]
class_path = INSTANCE_NAME.replace("-", "_")
security = HTTPBearer()
form_route = APIRouter()

geo_center = GeoCenter[class_path].value
geo_center = {"lat": geo_center[1], "lng": geo_center[0]}


# PROJECT BASE
def get_project_form(session: Session, form: FormBase, project: QuestionDict,
                     administrations: List[int]) -> FormBase:
    question_group = []
    for qg in form["question_group"]:
        qg = qg.serialize
        questions = []
        for q in qg["question"]:
            q = q.serialize
            if q["id"] == project.id:
                projects = crud_answer.get_answer_by_question(
                    session=session,
                    question=project.option[0].name,
                    administrations=administrations)
                option = [p.to_project for p in projects]
                option.reverse()
                for o in option:
                    data_id = o["id"]
                    data_name = crud_data.get_data_name_by_id(session=session,
                                                              id=data_id)
                    o.update({"id": data_id, "name": data_name})
                q.update({"option": option})
            questions.append(q)
        qg.update({"question": questions})
        question_group.append(qg)
    form.update({"question_group": question_group})
    return form
# END PROJECT BASE


def get_form_definition(req: Request, id: int, session: Session,
                        credentials: credentials, answer_check=False):
    user = verify_editor(req.state.authenticated, session)
    access = [a.administration for a in user.access]
    form = crud.get_form_by_id(session=session, id=id)
    project = crud_question.get_project_question(session=session, form=id)
    form = form.serialize
    form["question_group"] = [qg.serialize for qg in form["question_group"]]
    for qg in form["question_group"]:
        qg["question"] = [q.serialize for q in qg["question"]]
        for q in qg["question"]:
            # check if has answer here
            if answer_check:
                answer = crud_answer.count_answer_by_question(
                    session=session, question=q.get('id'))
                if answer:
                    q.update({"disableDelete": True})
            if q["type"] == QuestionType.administration:
                q.update({"option": "administration"})
                q.update({"type": "cascade"})
            if q["type"] == QuestionType.geo:
                q.update({"center": geo_center})
            if q["type"] == QuestionType.answer_list:
                if q["id"] == project.id:
                    administration_ids = crud_administration.get_all_childs(
                        session=session,
                        parents=[a.administration for a in user.access],
                        current=[])
                    projects = crud_answer.get_answer_by_question(
                        session=session,
                        question=project.option[0].name,
                        administrations=administration_ids)
                    option = [p.to_project for p in projects]
                    option.reverse()
                    for o in option:
                        data_id = o["id"]
                        data_name = crud_data.get_data_name_by_id(
                            session=session, id=data_id)
                        o.update({"id": data_id, "name": data_name})
                q.update({"option": option, "type": "option"})
    administration = crud_administration.get_parent_administration(
        session=session,
        access=None if user.role == UserRole.admin else access)
    form.update(
        {"cascade": {
            "administration": [a.cascade for a in administration]
        }})
    return form


def save_webform(session: Session, json_form: dict, form_id: int = None):
    # if form_id ==> update
    # add form
    form = crud.add_form(session=session, name=json_form.get('name'))
    for qg in json_form.get('question_group'):
        # add group, repeatable? translations?
        question_group = crud_question_group.add_question_group(
            session=session,
            form=form.id,
            name=qg.get('name'),
            order=qg.get('order'))
        for q in qg.get('question'):
            # add question, meta?
            crud_question.add_question(
                session=session,
                name=q.get('name'),
                form=form.id,
                question_group=question_group.id,
                type=q.get('type'),
                meta=False,
                order=q.get('order'),
                required=q.get('required'),
                rule=q.get('rule') if "rule" in q else None,
                dependency=q.get('dependency') if "dependency" in q else None,
                option=q.get('option') if "option" in q else [])
    return json_form


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
    form = form.serialize
    if req.headers.get("Authorization"):
        user = verify_user(req.state.authenticated, session)
        project = crud_question.get_project_question(session=session, form=id)
        if project:
            administration_ids = crud_administration.get_all_childs(
                session=session,
                parents=[a.administration for a in user.access],
                current=[])
            form = get_project_form(session=session,
                                    form=form,
                                    project=project,
                                    administrations=administration_ids)
    return form


@form_route.get("/webform/{id:path}",
                summary="get form by id",
                name="webform:get_by_id",
                tags=["Form"])
def get_webform_by_id(req: Request,
                      id: int,
                      edit: bool = False,
                      session: Session = Depends(get_session),
                      credentials: credentials = Depends(security)):
    res = get_form_definition(req=req, id=id, session=session,
                              credentials=credentials, answer_check=edit)
    return res


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


@form_route.post("/webform/",
                 summary="post webform editor JSON value",
                 name="webform:post",
                 tags=["Form"])
async def add_webform(req: Request,
                      payload: dict,
                      background_tasks: BackgroundTasks,
                      session: Session = Depends(get_session),
                      # credentials: credentials = Depends(security)
                      ):
    background_tasks.add_task(save_webform, session=session, json_form=payload)
    return payload
