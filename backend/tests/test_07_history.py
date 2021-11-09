import sys
import pytest
from datetime import datetime
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(True)
today = datetime.today().strftime("%B %d, %Y")


class TestDataUpdateRoutes():
    @pytest.mark.asyncio
    async def test_update_data(self, app: FastAPI, session: Session,
                               client: AsyncClient) -> None:
        res = await client.put(
            app.url_path_for("data:update", id=1),
            json=[{
                "question": 1,
                "value": "Option 2"
            }, {
                "question": 4,
                "value": "Bandung"
            }],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "name": "Garut - Garut",
            "administration": 10,
            "created_by": "Akvo Support",
            "created": today,
            "form": 1,
            "geo": {
                "lat": -7.836114,
                "long": 110.331143
            },
            "updated_by": "Akvo Support",
            "updated": today,
            "answer": [{
                "question": 1,
                "value": "Option 2"
            }, {
                "question": 2,
                "value": 10
            }, {
                "question": 3,
                "value": "-7.836114|110.331143"
            }, {
                "question": 4,
                "value": "Bandung"
            }]
        }


class TestHistoryRoutes():
    @pytest.mark.asyncio
    async def test_get_history(self, app: FastAPI, session: Session,
                               client: AsyncClient) -> None:
        res = await client.get(
            app.url_path_for("data:history", data_id=1, question_id=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [{
            "date": today,
            "user": "Akvo Support",
            "value": "Option 2"
        }, {
            "date": today,
            "user": "Akvo Support",
            "value": "Option 1"
        }]

    @pytest.mark.asyncio
    async def test_get_data(self, app: FastAPI, session: Session,
                            client: AsyncClient) -> None:
        res = await client.get(
            app.url_path_for("data:get", form_id=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res["current"] == 1
        assert res["total"] == 1
        assert res["total_page"] == 1
        assert len(res["data"]) == 1
        first_data = res["data"][0]
        assert first_data == {
            "id": 1,
            "name": "Garut - Garut",
            "administration": 10,
            "created": today,
            "created_by": "Akvo Support",
            "form": 1,
            "geo": {
                "lat": -7.836114,
                "long": 110.331143
            },
            "updated": today,
            "updated_by": "Akvo Support",
            "answer": [{
                "question": 1,
                "value": "Option 2",
                "history": True,
            }, {
                "question": 2,
                "value": 10,
                "history": False,
            }, {
                "question": 3,
                "value": "-7.836114|110.331143",
                "history": False,
            }, {
                "question": 4,
                "value": "Bandung",
                "history": True,
            }]
        }
