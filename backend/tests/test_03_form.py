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
            params={
                "name": "test",
                "description": "test description",
                "default_language": "en",
                "version": 1.0
            },
            json={
                "languages": ["en", "id"],
                "translations": [{
                    "language": "id",
                    "name": "uji coba",
                    "description": "deskripsi uji coba"
                }]
            },
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "name": "test",
            "version": 1.0,
            "description": "test description",
            "default_language": "en",
            "languages": ["en", "id"],
            "translations": [{
                "language": "id",
                "name": "uji coba",
                "description": "deskripsi uji coba"
            }]
        }

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
            json={
                "option": [{
                    "name": " Option 1 ", #strip option test
                    "color": "#333",
                    "order": 1,
                    "score": None,
                    "code": "OP1",
                    "translations": [{
                        "language": "id",
                        "name": "Pilihan 1",
                    }]
                }, {
                    "name": "Option 2",
                    "color": "#333",
                    "order": 2,
                    "score": 5,
                    "code": "OP2",
                    "translations": [{
                        "language": "id",
                        "name": "Pilihan 2",
                    }]
                }, {
                    "name": "Option 3",
                    "color": None,
                    "order": None,
                    "score": 10,
                    "code": "OP3",
                    "translations": [{
                        "language": "id",
                        "name": "Pilihan 3",
                    }]
                }]
            },
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
            "id": 1,
            "order": 1,
            "name": "Option 1",
            "score": None,
            "code": "OP1",
            "translations": [{
                "language": "id",
                "name": "Pilihan 1",
            }]
        }, {
            "color": "#333",
            "id": 2,
            "order": 2,
            "name": "Option 2",
            "score": 5,
            "code": "OP2",
            "translations": [{
                "language": "id",
                "name": "Pilihan 2",
            }]
        }, {
            "color": None,
            "id": 3,
            "order": None,
            "name": "Option 3",
            "score": 10,
            "code": "OP3",
            "translations": [{
                "language": "id",
                "name": "Pilihan 3",
            }]
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
        assert res["required"] is True
        assert res["rule"] is None
        assert res["type"] == "administration"

    @pytest.mark.asyncio
    async def test_add_geo_question(self, app: FastAPI, session: Session,
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
        assert res["required"] is True
        assert res["rule"] is None
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
                "type": "text",
                "required": False,
            },
            json={"dependency": [{
                "id": 1,
                "options": ["Option 1"],
            }]},
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
        assert res["required"] is False
        assert res["rule"] is None
        assert res["type"] == "text"
        assert res["dependency"] == [{
            "id": 1,
            "options": ["Option 1"],
        }]
