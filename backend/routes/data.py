import os
from http import HTTPStatus
from datetime import datetime
from math import ceil
from fastapi import Depends, Request, Response, APIRouter, HTTPException, Query
from fastapi import BackgroundTasks
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List, Optional
from sqlalchemy.orm import Session
from pydantic import Required
import db.crud_data as crud
from db import crud_question
from db import crud_administration
from db import crud_answer
from db import crud_form
from db import crud_user
from db import crud_jmp
from models.user import User, UserRole
from models.answer import Answer, AnswerDict
from models.question import QuestionType
from models.history import History
from db.connection import get_session
from models.data import DataResponse, DataDict
from models.data import DataDictWithHistory, SubmissionInfo
from middleware import verify_user, verify_editor, check_query
from db.crud_jmp import get_jmp_table_view, get_jmp_config_by_form
from AkvoResponseGrouper.views import refresh_view

security = HTTPBearer()
data_route = APIRouter()


def refresh_category_view(session: Session):
    is_test = os.environ.get("TESTING")
    if is_test:
        sessionUsed = session
    else:
        sessionUsed = next(get_session())
    refresh_view(session=sessionUsed)


def check_access(adm, user) -> None:
    if user.role == UserRole.admin:
        return
    access = [a.administration for a in user.access]
    if int(adm) not in access:
        raise HTTPException(status_code=404, detail="Forbidden")


# PROJECT BASE
def check_project(
    session: Session,
    data: List[DataDictWithHistory],
    question: List[int],
    form: int,
) -> List[DataDictWithHistory]:
    form_question = crud_question.get_question_ids(session=session, form=form)
    form_question = [fq.id for fq in form_question]
    external = []
    if question:
        external = [q for q in question if q not in form_question]
    if len(external):
        question = crud_question.get_question_by_id(
            session=session, id=external[0])
        if len(question.option):
            question = int(question.option[0].name)
            for d in data:
                project_id = list(
                    filter(lambda x: x["question"] == question, d["answer"])
                )
                project_id = project_id[0]["value"]
                for ex in external:
                    total_projects = crud_answer.get_project_count(
                        session=session, question=ex, value=project_id
                    )
                    total_projects = {
                        "question": ex,
                        "value": total_projects,
                        "history": False,
                    }
                    d["answer"].append(total_projects)
    return data


# END PROJECT BASE


@data_route.get(
    "/data/form/{form_id:path}",
    response_model=DataResponse,
    name="data:get",
    summary="get all datas",
    tags=["Data"],
)
def get(
    req: Request,
    form_id: int,
    page: int = 1,
    perpage: int = 10,
    administration: Optional[int] = None,
    question: Optional[List[int]] = Query(None),
    q: Optional[List[str]] = Query(None),
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    options = check_query(q) if q else None
    user = verify_user(req.state.authenticated, session)
    administration_ids = False
    if not administration:
        administration_ids = crud_administration.get_all_childs(
            session=session,
            parents=[a.administration for a in user.access],
            current=[],
        )
    if administration:
        administration_ids = crud_administration.get_all_childs(
            session=session, parents=[administration], current=[]
        )
        if not len(administration_ids):
            raise HTTPException(status_code=404, detail="Not found")
    data = crud.get_data(
        session=session,
        form=form_id,
        administration=administration_ids,
        # question=question,
        options=options,
        skip=(perpage * (page - 1)),
        perpage=perpage,
    )
    if not data["count"]:
        raise HTTPException(status_code=404, detail="Not found")
    total_page = ceil(data["count"] / 10) if data["count"] > 0 else 0
    if total_page < page:
        raise HTTPException(status_code=404, detail="Not found")
    count = data["count"]
    configs = get_jmp_config_by_form(form=form_id)
    data = [d.serialize for d in data["data"]]
    data = get_jmp_table_view(session=session, data=data, configs=configs)
    if question:
        data = check_project(
            session=session, data=data, question=question, form=form_id
        )
    return {
        "current": page,
        "data": data,
        "total": count,
        "total_page": total_page,
    }
    options = check_query(q) if q else None
    user = verify_user(req.state.authenticated, session)
    administration_ids = False
    if not administration:
        administration_ids = crud_administration.get_all_childs(
            session=session, parents=[a.administration for a in user.access], current=[]
        )
    if administration:
        administration_ids = crud_administration.get_all_childs(
            session=session, parents=[administration], current=[]
        )
        if not len(administration_ids):
            raise HTTPException(status_code=404, detail="Not found")
    res = crud.get_data(
        session=session,
        form=form_id,
        administration=administration_ids,
        question=question,
        options=options,
        skip=(perpage * (page - 1)),
        perpage=perpage,
    )
    if not res["count"]:
        raise HTTPException(status_code=404, detail="Not found")
    total_page = ceil(res["count"] / 10) if res["count"] > 0 else 0
    if total_page < page:
        raise HTTPException(status_code=404, detail="Not found")
    count = res["count"]
    data = [d.serialize for d in res["data"]]
    ids = [d["id"] for d in data]
    categories = crud_jmp.get_categories_by_data_ids(
        session=session, form=form_id, ids=ids
    )
    if question:
        data = check_project(
            session=session, data=data, question=question, form=form_id
        )
    return {
        "current": page,
        "data": data,
        "total": count,
        "total_page": total_page,
        "categories": categories,
    }


@data_route.post(
    "/data/form/{form_id:path}",
    response_model=DataDict,
    summary="add new data",
    name="data:create",
    tags=["Data"],
)
async def add(
    req: Request,
    form_id: int,
    answers: List[AnswerDict],
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    user = verify_editor(req.state.authenticated, session)
    data = save_datapoint(
        session=session,
        form_id=form_id,
        answers=answers,
        user=user,
        background_tasks=background_tasks
    )
    return data.serialize


@data_route.post(
    "/data/form-standalone/{form_id:path}",
    response_model=DataDict,
    summary="add new data for standalone form",
    name="data:create_form_standalone",
    tags=["Data"],
)
async def add_form_standalone(
    req: Request,
    form_id: int,
    answers: List[AnswerDict],
    background_tasks: BackgroundTasks,
    submitter: str = Query(default=Required),
    session: Session = Depends(get_session),
):
    data = save_datapoint(
        session=session,
        form_id=form_id,
        answers=answers,
        submitter=submitter,
        background_tasks=background_tasks
    )
    return data.serialize


@data_route.get(
    "/data/{id:path}",
    response_model=DataDict,
    summary="get data by id",
    name="data:get_by_id",
    tags=["Data"],
)
def get_by_id(
    req: Request,
    id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    data = crud.get_data_by_id(session=session, id=id)
    if not data:
        raise HTTPException(
            status_code=404,
            detail="data {} is not found".format(id)
        )
    return data.serialize


@data_route.delete(
    "/data/{id:path}",
    responses={204: {"model": None}},
    status_code=HTTPStatus.NO_CONTENT,
    summary="delete data",
    name="data:delete",
    tags=["Data"],
)
def delete(
    req: Request,
    id: int,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    verify_editor(req.state.authenticated, session)
    crud.delete_by_id(session=session, id=id)
    TESTING = os.environ.get("TESTING")
    if not TESTING:
        background_tasks.add_task(refresh_category_view, session=session)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


@data_route.delete(
    "/data",
    responses={204: {"model": None}},
    status_code=HTTPStatus.NO_CONTENT,
    summary="bulk delete data",
    name="data:bulk-delete",
    tags=["Data"],
)
def bulk_delete(
    req: Request,
    background_tasks: BackgroundTasks,
    id: Optional[List[int]] = Query(None),
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    verify_editor(req.state.authenticated, session)
    crud.delete_bulk(session=session, ids=id)
    TESTING = os.environ.get("TESTING")
    if not TESTING:
        background_tasks.add_task(refresh_view, session=session)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


@data_route.put(
    "/data/{id:path}",
    response_model=DataDict,
    summary="update data",
    name="data:update",
    tags=["Data"],
)
async def update_by_id(
    req: Request,
    id: int,
    answers: List[AnswerDict],
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    user = verify_editor(req.state.authenticated, session)
    data = crud.get_data_by_id(session=session, id=id)
    form = crud_form.get_form_by_id(session=session, id=data.form)
    questions = form.list_of_questions
    current_answers = crud_answer.get_answer_by_data_and_question(
        session=session, data=id, questions=[a["question"] for a in answers]
    )
    checked = {}
    [checked.update(a.dicted) for a in current_answers]
    for a in answers:
        execute = "update"
        qid = a["question"]
        if qid not in list(questions):
            raise HTTPException(
                status_code=401,
                detail="question {} is not part of this form".format(qid),
            )
        a.update({"type": questions[a["question"]]})
        if a["type"] == QuestionType.option:
            a.update({"value": [a["value"]]})
        if qid in list(checked):
            execute = "update"
        else:
            execute = "new"
        if execute == "update" and a["value"] != checked[qid]["value"]:
            answer = checked[qid]["data"]
            history = answer.serialize
            del history["id"]
            history = History(**history)
            a = crud_answer.update_answer(
                session=session,
                answer=answer,
                history=history,
                user=user.id,
                type=questions[qid],
                value=a["value"],
            )
        if execute == "new":
            answer = Answer(
                question=qid,
                data=data.id,
                created_by=user.id,
                created=datetime.now(),
            )
            a = crud_answer.add_answer(
                session=session,
                answer=answer,
                type=questions[qid],
                value=a["value"],
            )
        if execute:
            data.updated_by = user.id
            data.updated = datetime.now()
            data = crud.update_data(session=session, data=data)
    TESTING = os.environ.get("TESTING")
    if not TESTING:
        background_tasks.add_task(refresh_category_view, session=session)
    return data.serialize


@data_route.get(
    "/last-submitted",
    response_model=SubmissionInfo,
    summary="get last submission",
    name="data:last-submitted",
    tags=["Data"],
)
def get_last_submission(
    req: Request,
    form_id: int,
    administration: Optional[int] = None,
    q: Optional[List[str]] = Query(None),
    session: Session = Depends(get_session),
):
    options = None
    if q:
        options = check_query(q)
    administration_ids = False
    if administration:
        administration_ids = crud_administration.get_all_childs(
            session=session, parents=[administration], current=[]
        )
        if not len(administration_ids):
            raise HTTPException(status_code=404, detail="Not found")
    last_submitted = crud.get_last_submitted(
        session=session,
        form=form_id,
        options=options,
        administration=administration_ids,
    )
    if not last_submitted:
        raise HTTPException(status_code=404, detail="Not found")
    submitter = last_submitted.submitter
    last_submitted = last_submitted.submission_info
    last_submitted_user = submitter
    if last_submitted["by"]:
        last_submitted_user = crud_user.get_user_by_id(
            session=session, id=last_submitted["by"]
        )
        last_submitted_user = last_submitted_user.name
    last_submitted.update(
        {"by": last_submitted_user, "at": last_submitted["at"].strftime("%B %d, %Y")}
    )
    return last_submitted


@data_route.get(
    "/history/{data_id:path}/{question_id:path}",
    summary="get answer with it's history",
    name="data:history",
    tags=["Data"],
)
def get_history(
    req: Request,
    data_id: int,
    question_id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    verify_editor(req.state.authenticated, session)
    answer = crud_answer.get_history(
        session=session, data=data_id, question=question_id
    )
    return answer


def save_datapoint(
    session: Session,
    form_id: int,
    answers: List[AnswerDict],
    background_tasks: BackgroundTasks,
    user: Optional[User] = None,
    submitter: Optional[str] = None,
) -> DataDict:
    administration = None
    geo = None
    answerlist = []
    names = []
    parent_code = None
    user_id = None if not user else user.id
    for a in answers:
        q = crud_question.get_question_by_id(session=session, id=a["question"])
        answer = Answer(question=q.id, created_by=user_id, created=datetime.now())
        if q.type == QuestionType.administration:
            # check user access
            if user:
                check_access(a["value"][0], user)
            if len(a["value"]):
                administration = int(a["value"][-1])
                answer.value = administration
                if q.meta:
                    adm_name = crud_administration.get_administration_by_id(
                        session, id=administration
                    )
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
        if q.type == QuestionType.answer_list:
            parent = crud.get_data_by_name(session=session, name=a["value"])
            parent_code = parent.name.split(" - ")[-1]
            administration = parent.administration
            answer.value = int(parent_code)
            if q.meta:
                names.append(parent.name)
        answerlist.append(answer)
    name = " - ".join([str(n) for n in names])
    if parent_code:
        name = f"{parent_code} - {name}"
    data = crud.add_data(
        session=session,
        form=form_id,
        name=name,
        geo=geo,
        administration=administration,
        created_by=user_id,
        answers=answerlist,
        submitter=submitter,
    )
    TESTING = os.environ.get("TESTING")
    if not TESTING:
        background_tasks.add_task(refresh_category_view, session=session)
    return data
