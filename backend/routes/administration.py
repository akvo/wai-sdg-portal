from fastapi import Depends, Request, APIRouter
from typing import List
from sqlalchemy.orm import Session
import db.crud_administration as crud
from db.connection import get_session
from models.administration import AdministrationBase, AdministrationResponse

administration_route = APIRouter()


@administration_route.get("/administration",
                          response_model=List[AdministrationBase],
                          summary="get all administrations",
                          tags=["Administration"])
def get(req: Request, session: Session = Depends(get_session)):
    administration = crud.get_administration(session=session)
    return administration


@administration_route.get("/administration/{id:path}",
                          response_model=AdministrationResponse,
                          summary="get administration by id",
                          tags=["Administration"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    administration = crud.get_administration_by_id(session=session, id=id)
    return administration
