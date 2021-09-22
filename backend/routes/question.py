from enum import Enum
from fastapi import Depends, Request, APIRouter, Query
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List, Optional
from sqlalchemy.orm import Session
import db.crud_question as crud
from models.form import Form
from db.connection import get_session, engine
from models.question import QuestionDict, QuestionType
from middleware import verify_admin

security = HTTPBearer()
question_route = APIRouter()


@question_route.get("/question/",
                    response_model=List[QuestionDict],
                    summary="get all questions",
                    tags=["Question"])
def get_question(req: Request, session: Session = Depends(get_session)):
    question = crud.get_question(session=session)
    return [f.serialize for f in question]


def get_form_list():
    session = Session(engine)
    form = session.query(Form).all()
    return [f.name for f in form]


class PostQueryParams:
    def __init__(
        self,
        name: str = Query(None, alias="Question Text"),
        type: QuestionType = Query(default=QuestionType.text,
                                   alias="Question Type"),
        meta: bool = Query(default=False, alias="Question is Metadata"),
        question_group: int = Query(
            None,
            alias="Question Group",
            description=
            "Append existing or Create Question Group"
        ),
        form_name: str = Query(
            enum=get_form_list(),
            default=None,
            alias="Form Name",
            description="Existing form, must create form if you don't have one"
        ),
        options: Optional[List[str]] = Query(
            None,
            alias="Question Options",
            description="Only applies when question type is option"),
    ):
        self.name = name
        self.form_name = form_name
        self.question_group = question_group
        self.type = type
        self.meta = meta
        self.options = options


@question_route.post("/question/",
                     response_model=QuestionDict,
                     summary="add new question",
                     name="question:create",
                     tags=["Question"])
def add_question(req: Request,
                 params: PostQueryParams = Depends(),
                 session: Session = Depends(get_session),
                 credentials: credentials = Depends(security)):
    verify_admin(req.state.authenticated, session)
    question = crud.add_question(session=session, name=params.name)
    return question.serialize
