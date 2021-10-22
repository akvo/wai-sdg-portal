import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(True)


class TestDataUpdateRoutes():

    @pytest.mark.asyncio
    async def test_submit_data(self, app: FastAPI, session: Session,
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
