from fastapi import Depends, Request, APIRouter
from typing import List
from sqlalchemy.orm import Session
from db.crud_administration import GetAdministration, GetAdministrationById
from db.connection import get_session
from models.administration import AdministrationBase, AdministrationResponse

administration_route = APIRouter()


@administration_route.get("/administration/",
                          response_model=List[AdministrationBase],
                          summary="get all administrations",
                          tags=["administration"])
def get_administration(req: Request, session: Session = Depends(get_session)):
    administration = GetAdministration(session=session)
    return administration


@administration_route.get("/administration/{id:path}",
                          response_model=AdministrationResponse,
                          summary="get administration by id",
                          tags=["administration"])
def get_administration_by_id(req: Request,
                             id: int,
                             session: Session = Depends(get_session)):
    administration = GetAdministrationById(session=session, id=id)
    return administration
