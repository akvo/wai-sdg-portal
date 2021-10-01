from fastapi import Depends, Request, APIRouter
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
import db.crud_form as crud
from db.connection import get_session
from models.form import FormDict, FormBase
from middleware import verify_admin

security = HTTPBearer()
form_route = APIRouter()


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
                tags=["Form"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    form = crud.get_form_by_id(session=session, id=id)
    return form.serialize


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
