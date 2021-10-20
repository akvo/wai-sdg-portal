import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(True)


class TestFormRoutes():
    @pytest.mark.asyncio
    async def test_add_form(self, app: FastAPI, session: Session,
                            client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("form:create"),
            params={"name": "test"},
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {"id": 1, "name": "test"}

    @pytest.mark.asyncio
    async def test_add_option_question(self, app: FastAPI, session: Session,
                                       client: AsyncClient) -> None:
        res = await client.get(app.url_path_for("form:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert len(res["question_group"]) == 0
        res = await client.post(
            app.url_path_for("question:create"),
            params={
                "name": "Test Option Question",
                "form": 1,
                "question_group": "Test Question Group",
                "meta": True,
                "type": "option"
            },
            json=[{
                "name": "Option 1",
                "color": "#333",
                "order": 1
            }, {
                "name": "Option 2",
                "color": "#333",
                "order": 2
            }, {
                "name": "Option 3",
                "color": None,
                "order": None
            }],
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        assert res["form"] == 1
        assert res["question_group"] == 1
        assert res["order"] == 1
        assert res["name"] == "Test Option Question"
        assert res["meta"] is True
        assert res["type"] == "option"
        assert res["option"] == [{
            "color": "#333",
            "order": 1,
            "name": "Option 1"
        }, {
            "color": "#333",
            "order": 2,
            "name": "Option 2"
        }, {
            "color": None,
            "order": None,
            "name": "Option 3"
        }]

    @pytest.mark.asyncio
    async def test_add_administration_question(self, app: FastAPI,
                                               session: Session,
                                               client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("question:create"),
            params={
                "name": "Test Administration Question",
                "form": 1,
                "question_group": "Test Question Group",
                "meta": True,
                "type": "administration"
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 2
        assert res["form"] == 1
        assert res["question_group"] == 1
        assert res["order"] == 2
        assert res["name"] == "Test Administration Question"
        assert res["meta"] is True
        assert res["type"] == "administration"

    @pytest.mark.asyncio
    async def test_add_geo_question(self, app: FastAPI,
                                    session: Session,
                                    client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("question:create"),
            params={
                "name": "Test Geo Question",
                "form": 1,
                "question_group": "Test Question Group",
                "meta": True,
                "type": "geo"
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 3
        assert res["form"] == 1
        assert res["question_group"] == 1
        assert res["order"] == 3
        assert res["name"] == "Test Geo Question"
        assert res["meta"] is True
        assert res["type"] == "geo"

    @pytest.mark.asyncio
    async def test_datapoint_name_question(self, app: FastAPI,
                                           session: Session,
                                           client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("question:create"),
            params={
                "name": "Test Datapoint Text Question",
                "form": 1,
                "question_group": "Test Question Group",
                "meta": True,
                "type": "text"
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 4
        assert res["form"] == 1
        assert res["question_group"] == 1
        assert res["order"] == 4
        assert res["name"] == "Test Datapoint Text Question"
        assert res["meta"] is True
        assert res["type"] == "text"
