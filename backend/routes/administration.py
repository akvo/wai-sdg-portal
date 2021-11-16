from fastapi import Depends, Request, APIRouter, Query
from typing import List, Optional
from sqlalchemy.orm import Session
import db.crud_administration as crud
from db.connection import get_session
from models.administration import AdministrationBase, AdministrationResponse

administration_route = APIRouter()


@administration_route.get("/administration",
                          response_model=List[AdministrationBase],
                          summary="get all administrations",
                          name="administration:get",
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


@administration_route.get(
    "/administration-boundary",
    summary="get nested id's list of parent administration",
    tags=["Administration"])
def get_all_ids(
    req: Request,
    id: Optional[List[int]] = Query(None),
    session: Session = Depends(get_session)
) -> List[int]:
    ids = crud.get_nested_children_ids(session=session, parents=id)
    return ids


@administration_route.get(
    "/administration-simple",
    summary="get simplified administration data",
    tags=["Administration"])
def get_all_with_parent_name(req: Request,
                             session: Session = Depends(get_session)):
    adm = crud.get_administration(session=session)
    return [a.with_parent_name for a in adm]
