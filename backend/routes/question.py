from fastapi import Depends, Request, APIRouter, Query
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List, Optional
from sqlalchemy.orm import Session
import db.crud_question as crud
import db.crud_question_group as crud_question_group
from db.connection import get_session
from models.question import QuestionDict, QuestionBase, QuestionType
from middleware import verify_admin

security = HTTPBearer()
question_route = APIRouter()


@question_route.get("/question/",
                    response_model=List[QuestionDict],
                    summary="get all questions",
                    tags=["Form"])
def get_question(req: Request, session: Session = Depends(get_session)):
    question = crud.get_question(session=session)
    return [f.serialize for f in question]


class PostQueryParams:
    def __init__(
        self,
        name: str = Query(None, alias="question text"),
        order: int = None,
        type: QuestionType = Query(default=QuestionType.text,
                                   alias="question type"),
        meta: bool = Query(default=False,
                           description="Wether question is metadata or not"),
        form: int = Query(
            None,
            alias="form id",
            description=
            "Existing form id, must create form if you don't have one"),
        question_group: str = Query(
            None,
            alias="question group",
            description="Append existing or Create Question Group"),
        option: Optional[List[str]] = Query(
            None,
            alias="options",
            description=
            "Only applies when question type is option or multiple_option"),
    ):
        self.name = name
        self.order = order
        self.form = form
        self.question_group = question_group
        self.type = type
        self.meta = meta
        self.option = option


@question_route.post("/question/",
                     response_model=QuestionBase,
                     summary="add new question",
                     name="question:create",
                     tags=["Form"])
def add_question(req: Request,
                 params: PostQueryParams = Depends(),
                 session: Session = Depends(get_session),
                 credentials: credentials = Depends(security)):
    verify_admin(req.state.authenticated, session)
    question_group = crud_question_group.search_question_group(
        session=session, form=params.form, name=params.question_group)
    if not question_group:
        question_group = crud_question_group.add_question_group(
            session=session, name=params.question_group, form=params.form)
    option = params.option
    if params.type != QuestionType.option:
        option = None
    question = crud.add_question(session=session,
                                 name=params.name,
                                 order=params.order,
                                 form=params.form,
                                 meta=params.meta,
                                 type=params.type,
                                 question_group=question_group.id,
                                 option=option)
    return question.serialize
