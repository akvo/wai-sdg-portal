from http import HTTPStatus
from fastapi import Depends, Request, APIRouter, Response
from fastapi.security import HTTPBasicCredentials as credentials
from fastapi.security import HTTPBearer
from typing import List, Optional
from sqlalchemy.orm import Session
import db.crud_organisation as crud
from db.connection import get_session
from models.organisation import OrganisationBase, OrganisationDict
from models.organisation import OrganisationType
from middleware import verify_admin

organisation_route = APIRouter()
security = HTTPBearer()


@organisation_route.get(
    "/organisation",
    response_model=List[OrganisationBase],
    summary="get all organisations",
    tags=["Organisation"],
)
def get(req: Request, session: Session = Depends(get_session)):
    organisation = crud.get_organisation(session=session)
    return organisation


@organisation_route.get(
    "/organisation/{id:path}",
    response_model=OrganisationDict,
    summary="get organisation by id",
    tags=["Organisation"],
)
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    organisation = crud.get_organisation_by_id(session=session, id=id)
    return organisation.serialize


@organisation_route.put(
    "/organisation/{id:path}",
    status_code=HTTPStatus.NO_CONTENT,
    summary="Update organisation by id",
    tags=["Organisation"],
)
def update(
    req: Request,
    id: int,
    name: Optional[str] = None,
    type: Optional[OrganisationType] = None,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    verify_admin(req.state.authenticated, session)
    crud.update_organisation(session=session, id=id, name=name, type=type)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)
