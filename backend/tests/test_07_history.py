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
        del res["created"]
        del res["updated"]
        assert res == {
            "id": 1,
            "name": "Arsi Negele Town - Garut",
            "administration": 4,
            "created_by": 1,
            "form": 1,
            "geo": {
                "lat": -7.836114,
                "long": 110.331143
            },
            "updated_by": 1,
            "answer": [{
                "question": 2,
                "value": 4
            }, {
                "question": 3,
                "value": "-7.836114|110.331143"
            }, {
                "question": 1,
                "value": "Option 2"
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
            app.url_path_for("data:history", data_id=1, question_id=1))
        assert res.status_code == 200
        res = res.json()
        assert res == {
                "date": today,
                "history": [{
                    "date": today,
                    "user": "Akvo Support",
                    "value": "Option 1"
                    }],
                "user": "Akvo Support",
                "value": "Option 2"
            }
