import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(True)


class TestDataRoutes():
    @pytest.mark.asyncio
    async def test_get_data(self, app: FastAPI, session: Session,
                            client: AsyncClient) -> None:
        res = await client.get(app.url_path_for("data:get", form_id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["current"] == 1
        assert res["total"] == 1
        assert res["total_page"] == 1
        assert len(res["data"]) == 1
        first_data = res["data"][0]
        del first_data["created"]
        assert first_data == {
                    "id": 1,
                    "name": "Arsi Negele Town - Garut",
                    "administration": 4,
                    "created_by": 1,
                    "form": 1,
                    "geo": {
                        "lat": -7.836114,
                        "long": 110.331143
                    },
                    "updated": None,
                    "updated_by": None,
                    "answer": [{
                        "question": 1,
                        "value": "Option 1"
                    }, {
                        "question": 2,
                        "value": 4
                    }, {
                        "question": 3,
                        "value": "-7.836114|110.331143"
                    }, {
                        "question": 4,
                        "value": "Garut"
                    }]
                }
