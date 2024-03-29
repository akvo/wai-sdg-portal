from http import HTTPStatus
import pandas as pd
from math import ceil
from fastapi import Depends, Request, APIRouter
from fastapi import HTTPException, Response, Query
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List, Optional
from sqlalchemy import desc
from sqlalchemy.orm import Session
import db.crud_user as crud
from db.connection import get_session
from middleware import verify_token, verify_admin, verify_user, get_auth0_user
from models.access import Access
from models.user import UserRole, UserBase, UserAccessBase, UserResponse
from models.jobs import Jobs, JobsPaginateResponse
from util.mailer import Email, MailTypeEnum
from db.crud_organisation import get_organisation_by_id
from db.crud_administration import get_administration_by_id

security = HTTPBearer()
user_route = APIRouter()


@user_route.get(
    "/user/me",
    response_model=UserAccessBase,
    summary="get account information",
    name="user:me",
    tags=["User"],
)
def me(
    req: Request,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    user = verify_user(req.state.authenticated, session)
    return user.serialize


@user_route.post(
    "/user",
    response_model=UserBase,
    summary="register new user",
    name="user:register",
    tags=["User"],
)
def add(
    req: Request,
    organisation: int,
    first_name: str,
    last_name: str = "",
    manage_form_passcode: Optional[bool] = None,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    name = f"{first_name} {last_name}"
    user = verify_token(req.state.authenticated)
    user = crud.add_user(
        session=session,
        name=name,
        email=user.get("email"),
        role="user",
        organisation=organisation,
        manage_form_passcode=manage_form_passcode,
    )
    # send email to admin
    organisation = get_organisation_by_id(session=session, id=user.organisation)
    context = f"""
                <table border="1">
                    <tr>
                        <td> Email </td>
                        <td>{user.email}</td>
                    </tr>
                    <tr>
                        <td> Organisation </td>
                        <td>{organisation.name}</td>
                    </tr>
                </table>
            """
    recipient = crud.get_all_admin_recipient(session=session)
    email = Email(recipients=recipient, type=MailTypeEnum.user_reg_new, context=context)
    email.send
    return user.serialize


@user_route.get(
    "/user",
    response_model=UserResponse,
    summary="get all users",
    name="user:get",
    tags=["User"],
)
def get(
    req: Request,
    active: int = 0,
    page: int = 1,
    search: Optional[str] = Query(None),
    organisation: Optional[int] = Query(None),
    role: Optional[UserRole] = Query(None),
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    verify_admin(req.state.authenticated, session)
    user = crud.get_user(
        session=session,
        skip=(10 * (page - 1)),
        active=active,
        search=search,
        organisation=organisation,
        role=role,
    )
    if not user:
        raise HTTPException(status_code=404, detail="Not found")
    total = crud.count(
        session=session,
        active=active,
        search=search,
        organisation=organisation,
        role=role,
    )
    user = [i.serialize for i in user]
    if not active:
        auth0_data = get_auth0_user()
        auth0_data = pd.DataFrame(auth0_data)
        auth0_data = auth0_data.drop_duplicates(subset="email")
        user = pd.DataFrame(user)
        user = user.merge(auth0_data, on="email", how="left")
        for col in list(user):
            user[col] = user[col].apply(lambda x: None if x != x else x)
        user = user.to_dict("records")
    total_page = ceil(total / 10) if total > 0 else 0
    if total_page < page:
        raise HTTPException(status_code=404, detail="Not found")
    if active:
        [u.update({"email_verified": True}) for u in user]
    return {
        "current": page,
        "data": user,
        "total": total,
        "total_page": total_page,
    }


@user_route.get(
    "/user/{id:path}",
    response_model=UserAccessBase,
    summary="get user detail",
    name="user:get_by_id",
    tags=["User"],
)
def get_by_id(
    req: Request,
    id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    verify_admin(req.state.authenticated, session)
    user = crud.get_user_by_id(session=session, id=id)
    if user is None:
        raise HTTPException(status_code=404, detail="Not Found")
    return user.serialize


@user_route.put(
    "/user/{id:path}",
    response_model=UserAccessBase,
    summary="Update user",
    name="user:update",
    tags=["User"],
)
def update_by_id(
    req: Request,
    id: int,
    active: bool,
    role: UserRole,
    first_name: str = "",
    last_name: str = "",
    access: List[int] = [],
    organisation: int = None,
    manage_form_passcode: Optional[bool] = None,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    verify_admin(req.state.authenticated, session)
    # get old value
    old_user = crud.get_user_by_id(session=session, id=id)
    old_active = old_user.active
    # get administration value
    access_list = [get_administration_by_id(session=session, id=a) for a in access]
    access_list = [a.name for a in access_list]
    user_access = ", ".join(access_list)
    name = ""
    if len(first_name):
        name = first_name
    if len(last_name) and len(first_name):
        name = f"{first_name} {last_name}"
    elif len(last_name) and not len(first_name):
        name = last_name
    else:
        name = ""
    access = [Access(user=id, administration=a) for a in access]
    access = crud.add_access(session=session, user=id, access=access)
    user = crud.update_user_by_id(
        session=session,
        id=id,
        name=name,
        organisation=organisation,
        active=active,
        role=role,
        manage_form_passcode=manage_form_passcode,
    )
    if user is None:
        raise HTTPException(status_code=404, detail="Not Found")
    if user.role == UserRole.admin:
        crud.delete_all_access(session=session, user=user.id)
        user_access = "All"
    # email
    context = f"""
            <table border="1">
                <tr>
                    <td> Role </td>
                    <td>{role.value.title()}</td>
                </tr>
                <tr>
                    <td> Access </td>
                    <td>{user_access}</td>
                </tr>
            </table>
        """
    # check approval
    if active is True and old_active is False:
        # send approval email
        email = Email(
            recipients=[old_user.recipient],
            type=MailTypeEnum.user_reg_approved,
            context=context,
        )
        email.send
    else:
        # send user updated email
        email = Email(
            recipients=[old_user.recipient],
            type=MailTypeEnum.user_acc_changed,
            context=context,
        )
        email.send
    return user.serialize


@user_route.delete(
    "/user/{id:path}",
    responses={204: {"model": None}},
    status_code=HTTPStatus.NO_CONTENT,
    summary="delete non admin user by id",
    name="user:delete",
    tags=["User"],
)
def delete_user_by_id(
    req: Request,
    id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    verify_admin(req.state.authenticated, session)
    crud.delete_user_by_id(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


@user_route.get(
    "/jobs/current-user",
    response_model=JobsPaginateResponse,
    summary="get all jobs by current user",
    name="jobs:get_by_current_user",
    tags=["User"],
)
def get_by_current_user(
    req: Request,
    page: int = 1,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    user = verify_user(req.state.authenticated, session)
    skip = 10 * (page - 1)
    limit = 5
    jobs = (
        session.query(Jobs)
        .filter(Jobs.created_by == user.id, Jobs.type != 'download')
        .order_by(desc(Jobs.created))
    )
    total = jobs.count()
    data = jobs.offset(skip).limit(limit).all()
    total_page = ceil(total / 10) if total > 0 else 0
    if total_page < page:
        raise HTTPException(status_code=404, detail="Not found")
    data = [d.serialize for d in data]
    return {
        "current": page,
        "data": data,
        "total": total,
        "total_page": total_page,
    }
