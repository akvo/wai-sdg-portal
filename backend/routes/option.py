from fastapi import Depends, Request, APIRouter
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List, Optional
from models.option import OptionBaseWithId
from sqlalchemy.orm import Session
from db.connection import get_session
import db.crud_option as crud
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


@option_route.put("/option/{id:path}",
                  response_model=OptionBaseWithId,
                  summary="update option",
                  name="option:update",
                  tags=["Option"])
def update_by_id(req: Request, id: int,
                 name: Optional[str] = None,
                 order: Optional[str] = None,
                 color: Optional[str] = None,
                 score: Optional[str] = None,
                 session: Session = Depends(get_session),
                 credentials: credentials = Depends(security)):
    verify_admin(req.state.authenticated, session)
    option = crud.update_option(session=session, id=id,
                                name=name, order=order,
                                color=color, score=score)
    return option.serializeWithId
