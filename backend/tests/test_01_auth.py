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
    def __init__(
            self, verified: bool = False, email: str = None, name: str = None):
        self.exp_date = (datetime.now() + timedelta(days=30)).timestamp()
        self.data = {
            "email": email if email else "support@akvo.org",
            "name": name if name else "Akvo Support",
            "exp": self.exp_date,
            "email_verified": verified,
        }
        self.token = jwt.encode(self.data, "secret", algorithm="HS256")
        self.decoded = jwt.decode(self.token, "secret", algorithms=["HS256"])


class TestAuthorizationSetup:
    def test_token_verification(self):
        account = Acc(verified=True)
        assert account.token != ""
        assert account.decoded == account.data
        assert True if verify_token(account.decoded) else False
        account = Acc(False)
        with pytest.raises(HTTPException):
            verify_token(account.decoded)

    @pytest.mark.asyncio
    async def test_user_get_registered(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        org = crud_organisation.add_organisation(
            session=session, name="Akvo", type="iNGO"
        )
        org = org.serialize
        assert org["id"] == 1
        assert org["name"] == "Akvo"
        assert org["type"] == OrganisationType.iNGO
        account = Acc(verified=True)
        res = await client.post(
            app.url_path_for("user:register"),
            params={
                "first_name": "Akvo",
                "last_name": "Support",
                "organisation": org["id"],
                "manage_form_passcode": True,
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        user = crud_user.update_user_by_id(
            session=session, id=1, role="admin", active=True
        )
        assert res["email"] == user.email
        assert res["active"] is False
        res = await client.get(
            app.url_path_for("user:me"),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["active"] is user.active
        assert res["role"] == "admin"
        assert res["manage_form_passcode"] is True

    @pytest.mark.asyncio
    async def test_get_user(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        account = Acc(verified=True)
        res = await client.get(
            app.url_path_for("user:get"),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 404

        res = await client.get(
            app.url_path_for("user:get"),
            params={"page": 2},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 404
        # get active user
        res = await client.get(
            app.url_path_for("user:get"),
            params={"active": 1},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["current"] == 1
        assert res["total"] == 1
        assert res["total_page"] == 1
        assert len(res["data"]) == 1
        assert res["data"] == [
            {
                "id": 1,
                "email": "support@akvo.org",
                "name": "Akvo Support",
                "role": "admin",
                "active": True,
                "email_verified": True,
                "picture": None,
                "organisation": 1,
                "manage_form_passcode": True,
            }
        ]
        # register as new user
        new_account = Acc(
            verified=True, email="john_doe@mail.com", name="John Doe")
        res = await client.post(
            app.url_path_for("user:register"),
            params={
                "first_name": "John",
                "last_name": "Doe",
                "organisation": 1,
            },
            headers={"Authorization": f"Bearer {new_account.token}"},
        )
        assert res.status_code == 200
        # get non active user
        res = await client.get(
            app.url_path_for("user:get"),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["current"] == 1
        assert res["total"] == 1
        assert res["total_page"] == 1
        assert len(res["data"]) == 1
        assert res["data"] == [
            {
                "id": 2,
                "email": "john_doe@mail.com",
                "name": "John Doe",
                "role": "user",
                "active": False,
                "email_verified": None,
                "picture": None,
                "organisation": 1,
                "manage_form_passcode": False,
            }
        ]
        # get non active user with extra filter return 404
        res = await client.get(
            app.url_path_for("user:get"),
            params={
                "active": 0,
                "search": "john",
                "organisation": 1,
                "role": "admin"
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 404
        # get non active user with extra filter return 200
        res = await client.get(
            app.url_path_for("user:get"),
            params={
                "active": 0,
                "search": "john",
                "organisation": 1,
                "role": "user"
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["current"] == 1
        assert res["total"] == 1
        assert res["total_page"] == 1
        assert len(res["data"]) == 1
        assert res["data"] == [
            {
                "id": 2,
                "email": "john_doe@mail.com",
                "name": "John Doe",
                "role": "user",
                "active": False,
                "email_verified": None,
                "picture": None,
                "organisation": 1,
                "manage_form_passcode": False,
            }
        ]
        # full text search support
        res = await client.get(
            app.url_path_for("user:get"),
            params={
                "active": 0,
                "search": "mail",
                "organisation": 1,
                "role": "user"
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["current"] == 1
        assert res["total"] == 1
        assert res["total_page"] == 1
        assert len(res["data"]) == 1
        assert res["data"] == [
            {
                "id": 2,
                "email": "john_doe@mail.com",
                "name": "John Doe",
                "role": "user",
                "active": False,
                "email_verified": None,
                "picture": None,
                "organisation": 1,
                "manage_form_passcode": False,
            }
        ]
        # get user by id
        res = await client.get(
            app.url_path_for("user:get_by_id", id=3),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 404

        res = await client.get(
            app.url_path_for("user:get_by_id", id=1),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "email": "support@akvo.org",
            "name": "Akvo Support",
            "role": "admin",
            "active": True,
            "access": [],
            "organisation": 1,
            "manage_form_passcode": True,
        }

    @pytest.mark.asyncio
    async def test_update_user(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        account = Acc(verified=True)
        res = await client.get(
            app.url_path_for("user:get_by_id", id=2),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        user = res.json()
        # update John Doe
        res = await client.put(
            app.url_path_for("user:update", id=user["id"]),
            params={
                "active": True,
                "role": "admin",
                "first_name": "John",
                "last_name": "Doe",
                "organisation": 1,
                "manage_form_passcode": True,
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 2,
            "email": "john_doe@mail.com",
            "name": "John Doe",
            "role": "admin",
            "active": True,
            "access": [],
            "organisation": 1,
            "manage_form_passcode": True,
        }

        @pytest.mark.asyncio
        async def test_delete_user(
            self, app: FastAPI, session: Session, client: AsyncClient
        ) -> None:
            account = Acc(verified=True)
            res = await client.get(
                app.url_path_for("user:get_by_id", id=2),
                headers={"Authorization": f"Bearer {account.token}"},
            )
            assert res.status_code == 200
            user = res.json()
            res = await client.delete(
                app.url_path_for("user:delete", id=user["id"]),
                headers={"Authorization": f"Bearer {account.token}"},
            )
            assert res.status_code == 204
