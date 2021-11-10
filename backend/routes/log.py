from fastapi import Depends, Request, APIRouter
from sqlalchemy.orm import Session
from typing import List
from db.connection import get_session
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from models.log import LogDict
import db.crud_log as crud
from middleware import verify_editor

log_route = APIRouter()
security = HTTPBearer()


@log_route.get("/log",
               response_model=List[LogDict],
               summary="get all log",
               name="log:status",
               tags=["Log"])
def get(req: Request,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    user = verify_editor(req.state.authenticated, session)
    log = crud.get(session=session, user=user.id)
    return log


@log_route.get("/log/{id:path}",
               response_model=LogDict,
               summary="get all log",
               name="log:status",
               tags=["Log"])
def get_by_id(req: Request,
              id: int,
              session: Session = Depends(get_session),
              credentials: credentials = Depends(security)):
    verify_editor(req.state.authenticated, session)
    log = crud.get_by_id(session=session, id=id)
    return log
