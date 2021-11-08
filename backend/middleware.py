import re
from pydantic import Field
from typing import Optional
import requests as r
from fastapi import HTTPException
from fastapi_auth0 import Auth0, Auth0User
from os import environ, path
from db import crud_user
from models.user import UserRole
from datetime import datetime

AUTH0_DOMAIN = environ['AUTH0_DOMAIN']
AUTH0_CLIENT_ID = environ['AUTH0_CLIENT_ID']
AUTH0_SECRET = environ['AUTH0_SECRET']
AUTH0_AUDIENCE = environ['AUTH0_AUDIENCE']
TOKEN_TMP = "./tmp/token.txt"
query_pattern = re.compile(r"[0-9]*\|(.*)")


class CustomAuth0User(Auth0User):
    email: Optional[str] = Field(None, alias='grand-type')


auth = Auth0(domain=AUTH0_DOMAIN,
             api_audience="wai-ethiopia-backend",
             auth0user_model=CustomAuth0User,
             scopes={'read:email': 'test'})


def get_token(generate=False):
    if generate:
        data = {
            "client_id": AUTH0_CLIENT_ID,
            "client_secret": AUTH0_SECRET,
            "audience": AUTH0_AUDIENCE,
            "grant_type": "client_credentials"
        }
        res = r.post(f"https://{AUTH0_DOMAIN}/oauth/token", data=data)
        res = res.json()
        with open(TOKEN_TMP, 'w') as access:
            access.write(res['access_token'])
        return res['access_token']
    if path.exists(TOKEN_TMP):
        with open(TOKEN_TMP, 'r') as access:
            access_token = access.read()
        return access_token
    return get_token(True)


def get_auth0_user():
    access_token = get_token()
    fields = "email%2Cemail_verified%2Cpicture&include_fields=true"
    user = r.get(f"https://{AUTH0_DOMAIN}/api/v2/users?fields={fields}",
                 headers={"Authorization": "Bearer {}".format(access_token)})
    if user.status_code != 200:
        access_token = get_token(True)
        return get_auth0_user()
    return user.json()


def verify_token(authenticated):
    if datetime.now().timestamp() > authenticated.get('exp'):
        raise HTTPException(status_code=401, detail="Unauthorized")
    if not authenticated.get('email_verified'):
        raise HTTPException(
            status_code=401,
            detail="Please check your email inbox to verify email account")
    return authenticated


def verify_user(authenticated, session):
    authenticated = verify_token(authenticated)
    user = crud_user.get_user_by_email(session=session,
                                       email=authenticated.get('email'))
    if not user:
        raise HTTPException(status_code=404, detail="Forbidden")
    return user


def verify_admin(authenticated, session):
    user = verify_user(authenticated, session)
    if user.role != UserRole.admin:
        raise HTTPException(
            status_code=403,
            detail="You don't have data access, please contact admin")
    return user


def verify_editor(authenticated, session):
    user = verify_user(authenticated, session)
    if user.role not in [UserRole.admin, UserRole.editor]:
        raise HTTPException(
            status_code=403,
            detail="You don't have data access, please contact admin")
    return user


def check_query(keywords):
    keys = []
    if not keywords:
        return keys
    for q in keywords:
        if not query_pattern.match(q):
            raise HTTPException(status_code=400, detail="Bad Request")
        else:
            keys.append(q.replace("|", "||"))
    return keys
