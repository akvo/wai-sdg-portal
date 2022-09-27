from fastapi import Depends, Request, APIRouter, Query, HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List, Optional
from sqlalchemy.orm import Session
import db.crud_question as crud
import db.crud_question_group as crud_question_group
from db.connection import get_session
from models.question import QuestionDict, QuestionBase, QuestionType
from models.question import DependencyDict
from models.option import OptionDict
from middleware import verify_admin

security = HTTPBearer()
question_route = APIRouter()


@question_route.get("/question/",
                    response_model=List[QuestionDict],
                    summary="get all questions",
                    tags=["Form"])
def get(req: Request, session: Session = Depends(get_session)):
    question = crud.get_question(session=session)
    return [f.serialize for f in question]


class PostQueryParams:
    def __init__(
        self,
        name: str = Query(None, description="question text"),
        order: int = None,
        type: QuestionType = Query(default=QuestionType.text,
                                   description="question type"),
        meta: bool = Query(default=False,
                           description="Wether question is metadata or not"),
        required: bool = Query(
            default=True, description="Wether question is required or not"),
        min: int = Query(
            default=0,
            description="Minimum number for number question type, default: 0"),
        max: int = Query(None,
                         description="Max number for number question type"),
        form: int = Query(
            None,
            description="Existing form id, create if you don't have one"),
        question_group: str = Query(
            None, description="Name of Question Group, Append or Create")):
        self.name = name
        self.order = order
        self.form = form
        self.question_group = question_group
        self.type = type
        self.required = required
        self.min = min
        self.max = max
        self.meta = meta


@question_route.post("/question/",
                     response_model=QuestionBase,
                     summary="add new question",
                     name="question:create",
                     tags=["Form"])
def add(req: Request,
        params: PostQueryParams = Depends(),
        option: List[OptionDict] = [],
        dependency: List[DependencyDict] = None,
        tooltip: Optional[dict] = None,
        translations: Optional[List[dict]] = None,
        api: Optional[dict] = None,
        addons: Optional[dict] = None,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    verify_admin(req.state.authenticated, session)
    question_group = crud_question_group.search_question_group(
        session=session, form=params.form, name=params.question_group)
    if not question_group:
        question_group = crud_question_group.add_question_group(
            session=session, name=params.question_group, form=params.form)
    if params.type != QuestionType.option:
        option = None
    rule = {}
    has_rule = False
    if dependency:
        dependency_errors = crud.validate_dependency(session=session,
                                                     dependency=dependency)
        if len(dependency_errors):
            raise HTTPException(status_code=404,
                                detail=", ".join(dependency_errors))
    if params.type == QuestionType.number:
        if params.min is not None:
            has_rule = True
            rule.update({"min": params.min})
        if params.max:
            has_rule = True
            rule.update({"max": params.max})
    question = crud.add_question(session=session,
                                 name=params.name,
                                 order=params.order,
                                 form=params.form,
                                 meta=params.meta,
                                 type=params.type,
                                 required=params.required,
                                 rule=rule if has_rule else None,
                                 dependency=dependency,
                                 question_group=question_group.id,
                                 option=option,
                                 tooltip=tooltip,
                                 translations=translations,
                                 api=api,
                                 addons=addons)
    return question.serialize
