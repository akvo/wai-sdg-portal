import pandas as pd
from math import ceil
from fastapi import Depends, Request, APIRouter, HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
from db import crud_user
from db.schema import UserBase, UserAccessBase, AccessBase, UserResponse
from db.models import UserRole
from db.connection import get_session
from middleware import verify_token, verify_admin, verify_user, get_auth0_user

security = HTTPBearer()
user_route = APIRouter()


@user_route.get("/user/me",
                response_model=UserAccessBase,
                summary="get account information",
                tags=["User"])
def get_me(req: Request,
           session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    user = verify_user(req.state.authenticated, session)
    return user


@user_route.post("/user/",
                 response_model=UserBase,
                 summary="register new user",
                 name="user:register",
                 tags=["User"])
def add_user(req: Request,
             session: Session = Depends(get_session),
             credentials: credentials = Depends(security)):
    user = verify_token(req.state.authenticated)
    user = crud_user.add_user(session=session,
                              email=user.get("email"),
                              role="user")
    return user


@user_route.get("/user/",
                response_model=UserResponse,
                summary="get all users",
                tags=["User"])
def get_user(req: Request,
             active: int = 0,
             page: int = 1,
             session: Session = Depends(get_session),
             credentials: credentials = Depends(security)):
    verify_admin(req.state.authenticated, session)
    user = crud_user.get_user(session=session,
                              skip=(10 * (page - 1)),
                              active=active)
    if not user:
        raise HTTPException(status_code=404, detail="Not found")
    total = crud_user.count(session=session, active=active)
    user = [i.serialize for i in user]
    if not active:
        auth0_data = get_auth0_user()
        auth0_data = pd.DataFrame(auth0_data)
        auth0_data = auth0_data.drop_duplicates(subset='email')
        user = pd.DataFrame(user)
        user = user.merge(auth0_data, on='email', how='left')
        for col in list(user):
            user[col] = user[col].apply(lambda x: None if x != x else x)
        user = user.to_dict('records')
    total_page = ceil(total / 10) if total > 0 else 0
    if total_page < page:
        raise HTTPException(status_code=404, detail="Not found")
    if active:
        [u.update({'email_verified': True}) for u in user]
    return {
        'current': page,
        'data': user,
        'total': total,
        'total_page': total_page
    }


@user_route.get("/user/{id:path}",
                response_model=UserAccessBase,
                summary="get user detail",
                tags=["User"])
def get_user_by_id(req: Request,
                   id: int,
                   session: Session = Depends(get_session),
                   credentials: credentials = Depends(security)):
    verify_admin(req.state.authenticated, session)
    user = crud_user.get_user_by_id(session=session, id=id)
    if user is None:
        raise HTTPException(status_code=404, detail="Not Found")
    return user.serialize


@user_route.put("/user/{id:path}",
                response_model=UserAccessBase,
                summary="Update user",
                tags=["User"])
def update_user_by_id(req: Request,
                      id: int,
                      active: bool,
                      role: UserRole,
                      access: List[AccessBase] = [],
                      session: Session = Depends(get_session),
                      credentials: credentials = Depends(security)):
    verify_admin(req.state.authenticated, session)
    access = crud_user.add_access(session=session, user=id, access=access)
    user = crud_user.update_user_by_id(session=session,
                                       id=id,
                                       active=active,
                                       role=role)
    if user is None:
        raise HTTPException(status_code=404, detail="Not Found")
    if user.role == UserRole.admin:
        crud_user.delete_all_access(session=session, user=user.id)
    return user.serialize
