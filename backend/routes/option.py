from fastapi import Depends, Request, APIRouter, HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List, Optional
from models.option import OptionBaseWithId
from sqlalchemy.orm import Session
from db.connection import get_session
import db.crud_option as crud
import db.crud_question as crud_question
from middleware import verify_admin

security = HTTPBearer()
option_route = APIRouter()


@option_route.get("/option/",
                  response_model=List[OptionBaseWithId],
                  summary="get all options",
                  name="option:get",
                  tags=["Option"])
def get(req: Request, session: Session = Depends(get_session)):
    option = crud.get_option(session=session)
    return [opt.serializeWithId for opt in option]


@option_route.post("/option/",
                   response_model=OptionBaseWithId,
                   summary="Add new option",
                   name="option:post",
                   tags=["Option"])
def post(req: Request,
         question_id: int,
         name: Optional[str] = None,
         order: Optional[str] = None,
         color: Optional[str] = None,
         score: Optional[str] = None,
         code: Optional[str] = None,
         translations: Optional[List[dict]] = None,
         session: Session = Depends(get_session),
         credentials: credentials = Depends(security)):
    verify_admin(req.state.authenticated, session)
    question = crud_question.get_question_by_id(session=session,
                                                id=question_id)
    if not question:
        raise HTTPException(status_code=404,
                            detail=f"Question id {question_id} is not found")
    option = crud.add_option(session=session,
                             question=question_id,
                             name=name,
                             order=order,
                             color=color,
                             score=score,
                             code=code,
                             translations=translations)
    return option.serializeWithId


@option_route.put("/option/{id:path}",
                  response_model=OptionBaseWithId,
                  summary="update option",
                  name="option:update",
                  tags=["Option"])
def update_by_id(req: Request,
                 id: int,
                 name: Optional[str] = None,
                 order: Optional[str] = None,
                 color: Optional[str] = None,
                 score: Optional[str] = None,
                 code: Optional[str] = None,
                 translations: Optional[List[dict]] = None,
                 session: Session = Depends(get_session),
                 credentials: credentials = Depends(security)):
    verify_admin(req.state.authenticated, session)
    option = crud.update_option(session=session,
                                id=id,
                                name=name,
                                order=order,
                                color=color,
                                score=score,
                                code=code,
                                translations=translations)
    return option.serializeWithId
