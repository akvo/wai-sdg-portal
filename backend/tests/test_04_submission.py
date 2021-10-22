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


class TestSubmissionRoutes():

    @pytest.mark.asyncio
    async def test_get_form(self, app: FastAPI, session: Session,
                            client: AsyncClient) -> None:
        res = await client.get(app.url_path_for("form:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "name": "test",
            "question_group": [{
                "form": 1,
                "id": 1,
                "name": "Test Question Group",
                "order": 1,
                "question": [{
                    "form": 1,
                    "id": 1,
                    "meta": True,
                    "name": "Test Option Question",
                    "order": 1,
                    "question_group": 1,
                    "type": "option",
                    "option": [{
                        "color": "#333",
                        "name": "Option 1",
                        "order": 1,
                    }, {
                        "color": "#333",
                        "name": "Option 2",
                        "order": 2,
                    }, {
                        "color": None,
                        "name": "Option 3",
                        "order": None,
                    }]
                }, {
                    "form": 1,
                    "id": 2,
                    "meta": True,
                    "name": "Test Administration Question",
                    "order": 2,
                    "question_group": 1,
                    "type": "administration",
                    "option": [],
                }, {
                    "form": 1,
                    "id": 3,
                    "meta": True,
                    "name": "Test Geo Question",
                    "order": 3,
                    "question_group": 1,
                    "type": "geo",
                    "option": [],
                }, {
                    "form": 1,
                    "id": 4,
                    "meta": True,
                    "name": "Test Datapoint Text Question",
                    "order": 4,
                    "question_group": 1,
                    "type": "text",
                    "option": [],
                }]
            }]
        }

    @pytest.mark.asyncio
    async def test_submit_data(self, app: FastAPI, session: Session,
                               client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("data:create", form_id=1),
            json=[{
                "question": 1,
                "value": "Option 1"
            }, {
                "question": 2,
                "value": [1, 4]
            }, {
                "question": 3,
                "value": {"lat": -7.836114, "lng": 110.331143}
            }, {
                "question": 4,
                "value": "Garut"
            }],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
                "id": 1,
                "name": "Arsi Negele Town - Garut",
                "administration": 4,
                "created": today,
                "created_by": "Akvo Support",
                "form": 1,
                "geo": {"lat": -7.836114, "long": 110.331143},
                "updated": None,
                "updated_by": None,
                "answer": [
                    {"question": 1, "value": "Option 1"},
                    {"question": 2, "value": 4},
                    {"question": 3, "value": "-7.836114|110.331143"},
                    {"question": 4, "value": "Garut"}
                ]
            }
