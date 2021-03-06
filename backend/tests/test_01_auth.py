import sys
import jwt
import pytest
from httpx import AsyncClient
from fastapi import FastAPI, HTTPException
from middleware import verify_token
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from db import crud_user
from db import crud_organisation
from models.organisation import OrganisationType

sys.path.append("..")


class Acc:
    def __init__(self, verified):
        self.exp_date = (datetime.now() + timedelta(days=30)).timestamp()
        self.data = {
            "email": "support@akvo.org",
            "name": "Akvo Support",
            "exp": self.exp_date,
            "email_verified": verified
        }
        self.token = jwt.encode(self.data, "secret", algorithm="HS256")
        self.decoded = jwt.decode(self.token, "secret", algorithms=["HS256"])


class TestAuthorizationSetup:
    def test_token_verification(self):
        account = Acc(True)
        assert account.token != ""
        assert account.decoded == account.data
        assert True if verify_token(account.decoded) else False
        account = Acc(False)
        with pytest.raises(HTTPException):
            verify_token(account.decoded)

    @pytest.mark.asyncio
    async def test_user_get_registered(self, app: FastAPI, session: Session,
                                       client: AsyncClient) -> None:
        org = crud_organisation.add_organisation(session=session,
                                                 name="Akvo",
                                                 type="iNGO")
        org = org.serialize
        assert org["id"] == 1
        assert org["name"] == "Akvo"
        assert org["type"] == OrganisationType.iNGO
        account = Acc(True)
        res = await client.post(
            app.url_path_for("user:register"),
            params={
                "first_name": "Akvo",
                "last_name": "Support",
                "organisation": org["id"]
            },
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        user = crud_user.update_user_by_id(session=session,
                                           id=1,
                                           role="admin",
                                           active=True)
        assert res["email"] == user.email
        assert res["active"] is False
        res = await client.get(
            app.url_path_for("user:me"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res["active"] is user.active
        assert res["role"] == "admin"
