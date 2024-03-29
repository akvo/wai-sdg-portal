import os
import json
from http import HTTPStatus
from pydantic import Required
from fastapi import Depends, Request, APIRouter, BackgroundTasks
from fastapi import Response, HTTPException, Form
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List, Optional
from sqlalchemy.orm import Session
import db.crud_form as crud
import db.crud_data as crud_data
import db.crud_question as crud_question
import db.crud_answer as crud_answer
import db.crud_administration as crud_administration
import db.crud_question_group as crud_question_group
from db.connection import get_session
from models.form import FormDict, FormBase, FormDictWithFlag
from models.form import FormLoginResponse
from models.user import UserRole
from models.question_group import QuestionGroup
from models.question import QuestionType, QuestionDict, Question
from middleware import verify_user, verify_admin, verify_editor
from source.geoconfig import GeoCenter
from datetime import datetime
from util.helper import hash_cipher

INSTANCE_NAME = os.environ["INSTANCE_NAME"]
SANDBOX_DATA_SOURCE = os.environ.get("SANDBOX_DATA_SOURCE")
if SANDBOX_DATA_SOURCE:
    INSTANCE_NAME = SANDBOX_DATA_SOURCE
SOURCE_PATH = f"./source/{INSTANCE_NAME}"
URL_FORM_CONFIG = f"{SOURCE_PATH}/form_url_dump.json"

class_path = INSTANCE_NAME.replace("-", "_")
security = HTTPBearer()
form_route = APIRouter()

geo_center = GeoCenter[class_path].value
geo_center = {"lat": geo_center[1], "lng": geo_center[0]}


# PROJECT BASE
def get_project_form(
    session: Session,
    form: FormBase,
    project: QuestionDict,
    administrations: List[int],
) -> FormBase:
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
                    administrations=administrations,
                )
                option = [p.to_project for p in projects]
                option.reverse()
                for o in option:
                    data_id = o["id"]
                    data_name = crud_data.get_data_name_by_id(
                        session=session, id=data_id
                    )
                    o.update({"id": data_id, "name": data_name})
                q.update({"option": option})
            questions.append(q)
        qg.update({"question": questions})
        question_group.append(qg)
    form.update({"question_group": question_group})
    return form


# END PROJECT BASE


def get_form_definition(
    req: Request,
    id: int,
    session: Session,
    answer_check=False,
    credentials: Optional[credentials] = False,
):
    user = None
    if credentials:
        user = verify_editor(req.state.authenticated, session)
    access = None
    if user and user.role != UserRole.admin:
        access = [a.administration for a in user.access]
    form = crud.get_form_by_id(session=session, id=id)
    project = crud_question.get_project_question(session=session, form=id)
    form = form.serialize
    # transform default language
    if "default_language" in form:
        form.update({"defaultLanguage": form["default_language"]})
        del form["default_language"]
    form["question_group"] = [qg.serialize for qg in form["question_group"]]
    for qg in form["question_group"]:
        # transform repeat text
        if "repeat_text" in qg:
            qg.update({"repeatText": qg["repeat_text"]})
            del qg["repeat_text"]
        qg["question"] = [q.serialize for q in qg["question"]]
        for q in qg["question"]:
            # check if has answer here
            if answer_check:
                answer = crud_answer.count_answer_by_question(
                    session=session, question=q.get("id")
                )
                if answer:
                    q.update({"disableDelete": True})
            # extract addons value
            if q.get("addons"):
                q.update(q["addons"])
            if "addons" in q:
                del q["addons"]
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
                        current=[],
                    )
                    projects = crud_answer.get_answer_by_question(
                        session=session,
                        question=project.option[0].name,
                        administrations=administration_ids,
                    )
                    option = [p.to_project for p in projects]
                    option.reverse()
                    for o in option:
                        data_id = o["id"]
                        data_name = crud_data.get_data_name_by_id(
                            session=session, id=data_id
                        )
                        o.update({"id": data_id, "name": data_name})
                q.update({"option": option, "type": "option"})
        # order question by question order
        qg["question"] = sorted(qg["question"], key=lambda x: x["order"])
    # order question group by question group order
    form["question_group"] = sorted(form["question_group"], key=lambda x: x["order"])
    administration = crud_administration.get_parent_administration(
        session=session, access=access
    )
    form.update({"cascade": {"administration": [a.cascade for a in administration]}})
    return form


def generateId(index: int = 0):
    now = datetime.now().timestamp() * 1000000
    unique_id = str(round(now) + index)[-9:]
    return int(unique_id)


def transformJsonForm(session: Session, json_form: dict, edit: bool = False):
    qid_mapping = {}
    form_id = json_form.get("id") if edit else generateId()
    # check form on db to get version
    current_form = crud.get_form_by_id(session=session, id=form_id)
    version = 1.0
    if current_form:
        current_version = current_form.version
        version = current_version + 1 if current_version else version
    # question group
    question_group = []
    for qg in json_form.get("question_group"):
        is_new_group = True
        if edit:
            find_qg = (
                session.query(QuestionGroup)
                .filter(QuestionGroup.id == qg.get("id"))
                .first()
            )
            is_new_group = False if find_qg else True
        qg_id = generateId() if is_new_group else qg.get("id")
        qg.update({"id": qg_id})
        # question
        question = []
        for q in qg.get("question"):
            is_new_question = True
            prev_type = q.get("type")
            if edit:
                find_q = (
                    session.query(Question).filter(Question.id == q.get("id")).first()
                )
                is_new_question = False if find_q else True
                prev_type = find_q.type.value if find_q else prev_type
            curr_qid = q.get("id")
            qid = generateId() if is_new_question else q.get("id")
            qid_mapping.update({curr_qid: qid})
            q.update({"id": qid})
            q.update({"questionGroupId": qg_id})
            # dependency
            if "dependency" in q and q.get("dependency"):
                dependency = []
                for d in q.get("dependency"):
                    depend_to = d.get("id")
                    d.update({"id": qid_mapping.get(depend_to)})
                    dependency.append(d)
                q.update({"dependency": dependency})
            # option
            if "option" in q and q.get("option"):
                option = []
                for o in q.get("option"):
                    oid = (
                        generateId()
                        if is_new_question or prev_type != q.get("type")
                        else o.get("id")
                    )
                    o.update({"id": oid})
                    option.append(o)
                q.update({"option": option})
            # hint
            if "hint" in q and q.get("hint"):
                hint = q.get("hint")
                endpoint = hint.get("endpoint").replace(str(curr_qid), str(qid))
                hint.update({"endpoint": endpoint})
                q.update({"hint": hint})
            question.append(q)
        qg.update({"question": question})
        question_group.append(qg)
    json_form.update({"id": form_id})
    json_form.update({"version": version})
    json_form.update({"question_group": question_group})
    return json_form


def save_webform(session: Session, json_form: dict, form_id: int = None):
    # if form_id ==> update
    is_test = os.environ.get("TESTING")
    if is_test:
        sessionUsed = session
    else:
        sessionUsed = next(get_session())
    if form_id:
        # fetch group and question ids from db to detect which deleted
        question_groups = (
            session.query(QuestionGroup).filter(QuestionGroup.form == form_id).all()
        )
        questions = session.query(Question).filter(Question.form == form_id).all()
        db_question_group_ids = [qg.id for qg in question_groups]
        db_question_ids = [q.id for q in questions]
    # add form
    if not form_id:
        form = crud.add_form(
            session=sessionUsed,
            id=json_form.get("id"),
            name=json_form.get("name"),
            description=json_form.get("description"),
            default_language=json_form.get("defaultLanguage"),
            languages=json_form.get("languages"),
            translations=json_form.get("translations"),
        )
    if form_id:
        form = crud.update_form(
            session=sessionUsed,
            id=form_id,
            name=json_form.get("name"),
            description=json_form.get("description"),
            default_language=json_form.get("defaultLanguage"),
            languages=json_form.get("languages"),
            translations=json_form.get("translations"),
        )
    question_group_ids = []
    question_ids = []
    for qg in json_form.get("question_group"):
        is_new_group = False
        if form_id:
            find_qg = (
                session.query(QuestionGroup)
                .filter(QuestionGroup.id == qg.get("id"))
                .first()
            )
            if find_qg:
                question_group_ids.append(qg.get("id"))
                question_group = crud_question_group.update_question_group(
                    session=sessionUsed,
                    id=qg.get("id"),
                    form=form_id,
                    name=qg.get("name"),
                    order=qg.get("order"),
                    description=qg.get("description"),
                    repeatable=qg.get("repeatable"),
                    repeat_text=qg.get("repeatText"),
                    translations=qg.get("translations"),
                )
            else:
                is_new_group = True
        if not form_id or is_new_group:
            question_group = crud_question_group.add_question_group(
                session=sessionUsed,
                id=qg.get("id"),
                form=form.id,
                name=qg.get("name"),
                order=qg.get("order"),
                description=qg.get("description"),
                repeatable=qg.get("repeatable"),
                repeat_text=qg.get("repeatText"),
                translations=qg.get("translations"),
            )
        for q in qg.get("question"):
            is_new_question = False
            dependency = q.get("dependency") if "dependency" in q else None
            # get addons
            addons = {}
            if "allowOther" in q:
                addons.update({"allowOther": q.get("allowOther")})
            if "allowOtherText" in q:
                addons.update({"allowOtherText": q.get("allowOtherText")})
            if "hint" in q:
                addons.update({"hint": q.get("hint")})
            # transform cascade type to administration
            if q.get("type") == "cascade":
                q["type"] = QuestionType.administration
            if form_id:
                find_q = (
                    session.query(Question).filter(Question.id == q.get("id")).first()
                )
                if find_q:
                    question_ids.append(q.get("id"))
                    crud_question.update_question(
                        session=sessionUsed,
                        id=q.get("id"),
                        name=q.get("name"),
                        form=form_id,
                        question_group=qg.get("id"),
                        type=q.get("type"),
                        meta=q.get("meta") if "meta" in q else False,
                        order=q.get("order"),
                        required=q.get("required"),
                        rule=q.get("rule") if "rule" in q else None,
                        dependency=dependency,
                        tooltip=q.get("tooltip"),
                        translations=q.get("translations"),
                        api=q.get("api"),
                        addons=addons if addons else None,
                        option=q.get("option") if "option" in q else [],
                    )
                else:
                    is_new_question = True
            if not form_id or is_new_question:
                crud_question.add_question(
                    session=sessionUsed,
                    id=q.get("id"),
                    name=q.get("name"),
                    form=form.id,
                    question_group=question_group.id,
                    type=q.get("type"),
                    meta=False,
                    order=q.get("order"),
                    required=q.get("required"),
                    rule=q.get("rule") if "rule" in q else None,
                    dependency=dependency,
                    tooltip=q.get("tooltip"),
                    translations=q.get("translations"),
                    api=q.get("api"),
                    addons=addons if addons else None,
                    option=q.get("option") if "option" in q else [],
                )
    # delete question group and question
    if form_id:
        deleted_question = []
        deleted_group = []
        for qid in db_question_ids:
            if qid not in question_ids:
                deleted_question.append(qid)
        for qgid in db_question_group_ids:
            if qgid not in question_group_ids:
                deleted_group.append(qgid)
        # delete
        session.query(Question).filter(Question.id.in_(deleted_question)).delete(
            synchronize_session="fetch"
        )
        session.query(QuestionGroup).filter(QuestionGroup.id.in_(deleted_group)).delete(
            synchronize_session="fetch"
        )
        session.commit()
        session.flush()


def get_form_id_from_url_config(uuid: str):
    with open(URL_FORM_CONFIG, "r") as j:
        configs = json.loads(j.read())
    form_id = configs.get(uuid)
    if not form_id:
        return None
    return int(form_id)


@form_route.get(
    "/form/",
    response_model=List[FormDictWithFlag],
    summary="get all forms",
    name="form:get_all",
    tags=["Form"],
)
def get(req: Request, session: Session = Depends(get_session)):
    form = crud.get_form(session=session)
    forms = []
    for fr in [f.serialize for f in form]:
        form_id = fr.get("id")
        if "question_group" in fr:
            del fr["question_group"]
        hash_survey_id = hash_cipher(text=str(form_id))
        url = f"/webform?id={hash_survey_id}"
        data = crud_data.count(session=session, form=form_id)
        fr.update({"disableDelete": True if data else False})
        fr.update({"url": url or None})
        forms.append(fr)
    return forms


@form_route.get(
    "/form/{id:path}",
    response_model=FormBase,
    summary="get form by id",
    name="form:get_by_id",
    tags=["Form"],
)
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
                current=[],
            )
            form = get_project_form(
                session=session,
                form=form,
                project=project,
                administrations=administration_ids,
            )
    return form


@form_route.get(
    "/webform/{id:path}",
    summary="get form by id",
    name="webform:get_by_id",
    tags=["Form"],
)
def get_webform_by_id(
    req: Request,
    id: int,
    edit: bool = False,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    res = get_form_definition(
        req=req,
        id=id,
        session=session,
        credentials=credentials,
        answer_check=edit,
    )
    return res


@form_route.post(
    "/form/",
    response_model=FormDict,
    summary="add new form",
    name="form:create",
    tags=["Form"],
)
def add(
    req: Request,
    name: str,
    version: Optional[float] = 0.0,
    description: Optional[str] = None,
    default_language: Optional[str] = None,
    languages: Optional[List[str]] = None,
    translations: Optional[List[dict]] = None,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    verify_admin(req.state.authenticated, session)
    form = crud.add_form(
        session=session,
        name=name,
        version=version,
        description=description,
        default_language=default_language,
        languages=languages,
        translations=translations,
    )
    return form.serialize


@form_route.post(
    "/webform/",
    summary="post webform editor JSON value",
    name="webform:create",
    tags=["Form"],
)
async def add_webform(
    req: Request,
    payload: dict,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    if os.environ.get("TESTING"):
        json_form = payload
    else:
        if INSTANCE_NAME != "wai-demo":
            return Response(status_code=HTTPStatus.METHOD_NOT_ALLOWED.value)
        json_form = transformJsonForm(session=session, json_form=payload)
    background_tasks.add_task(save_webform, session=session, json_form=json_form)
    return json_form


@form_route.put(
    "/webform/{id:path}",
    summary="update webform definition",
    name="webform:update",
    tags=["Form"],
)
async def update_webform(
    req: Request,
    id: int,
    payload: dict,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    if os.environ.get("TESTING"):
        json_form = payload
    else:
        if INSTANCE_NAME != "wai-demo":
            return Response(status_code=HTTPStatus.METHOD_NOT_ALLOWED.value)
        json_form = transformJsonForm(session=session, json_form=payload, edit=True)
    background_tasks.add_task(
        save_webform, session=session, json_form=json_form, form_id=id
    )
    return payload


@form_route.put(
    "/form/{id:path}",
    responses={204: {"model": None}},
    summary="update form passcode",
    name="form:update_passcode",
    tags=["Form"],
)
def update_form(
    req: Request,
    id: int,
    passcode: str,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    user = verify_admin(req.state.authenticated, session)
    if not user.manage_form_passcode:
        # prevent admin without manage form passcode
        raise HTTPException(
            status_code=403, detail="You don't have data access, please contact admin"
        )
    form = crud.get_form_by_id(session=session, id=id)
    crud.update_form(
        session=session,
        id=form.id,
        name=form.name,
        version=form.version,
        description=form.description,
        default_language=form.default_language,
        languages=form.languages,
        translations=form.translations,
        passcode=passcode,
    )
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


@form_route.delete(
    "/form/{id:path}",
    responses={204: {"model": None}},
    status_code=HTTPStatus.NO_CONTENT,
    summary="delete form",
    name="form:delete",
    tags=["Form"],
)
def delete(
    req: Request,
    id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    verify_editor(req.state.authenticated, session)
    check_data = crud_data.count(session=session, form=id)
    if check_data:
        return Response(status_code=HTTPStatus.BAD_REQUEST.value)
    crud_question.delete_by_form(session=session, form=id)
    crud_question_group.delete_by_form(session=session, form=id)
    crud.delete_by_id(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


@form_route.get(
    "/form-standalone/{uuid:path}",
    response_model=FormDict,
    summary="get standalone form detail by URL",
    name="form:get_standalone_form_detail",
    tags=["Form"],
)
def get_standalone_form_detail_by_uuid(
    req: Request, uuid: str, session: Session = Depends(get_session)
):
    # get form id by uuid
    form_id = get_form_id_from_url_config(uuid=uuid)
    form = crud.get_form_by_id(session=session, id=form_id)
    if not form:
        return Response(status_code=HTTPStatus.NOT_FOUND.value)
    return form.to_form_detail


@form_route.post(
    "/webform-standalone/login",
    response_model=FormLoginResponse,
    summary="get standalone form detail by URL",
    name="webform:check_passcode",
    tags=["Form"],
)
def form_standalone_login(
    req: Request,
    uuid: str = Form(default=Required),
    passcode: str = Form(default=Required),
    session: Session = Depends(get_session),
):
    form_id = get_form_id_from_url_config(uuid=uuid)
    form = crud.get_form_by_id(session=session, id=form_id)
    if not form:
        return Response(status_code=HTTPStatus.NOT_FOUND.value)
    # check passcode
    if passcode and form.passcode != passcode:
        return Response(status_code=HTTPStatus.FORBIDDEN.value)
    return {"uuid": uuid, "passcode": form.passcode}


@form_route.get(
    "/webform-standalone/{uuid:path}",
    summary="get standalone webform definition by URL & passcode",
    name="webform:get_standalone_form",
    tags=["Form"],
)
def get_standalone_webform_by_uuid(
    req: Request, uuid: str, session: Session = Depends(get_session)
):
    # get form id by uuid
    form_id = get_form_id_from_url_config(uuid=uuid)
    form = crud.get_form_by_id(session=session, id=form_id)
    if not form:
        return Response(status_code=HTTPStatus.NOT_FOUND.value)
    res = get_form_definition(req=req, id=form.id, session=session)
    return res
