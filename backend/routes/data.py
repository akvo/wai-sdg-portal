from fastapi import Depends, Request, APIRouter
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
import db.crud_data as crud
from db import crud_user
from db.connection import get_session
from models.data import DataDict
from middleware import verify_admin

security = HTTPBearer()
data_route = APIRouter()


@data_route.get("/data/{form_id:path}",
                response_model=List[DataDict],
                summary="get all datas",
                tags=["Data"])
def get_data(req: Request,
             form_id: int,
             session: Session = Depends(get_session)):
    data = crud.get_data(session=session, form=form_id)
    return [f.serialize for f in data]


@data_route.post("/data/",
                 response_model=DataDict,
                 summary="add new data",
                 name="data:create",
                 tags=["Data"])
def add_data(req: Request,
             form: int,
             session: Session = Depends(get_session),
             credentials: credentials = Depends(security)):
    user = verify_admin(req.state.authenticated, session)
    administration = 54
    name = "Testing - of Testing"
    geo = [0.7893, 113.9312]
    data = crud.add_data(session=session,
                         form=form,
                         name=name,
                         geo=geo,
                         administration=administration,
                         created_by=user.id)
    data = data.serialize
    if data["geo"]:
        data.update({"geo": {"lat": data["geo"][0], "long": data["geo"][1]}})
    return data
