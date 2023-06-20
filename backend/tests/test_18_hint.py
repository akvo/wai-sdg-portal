import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session
from db.crud_question import get_question_by_id
from models.question import QuestionType
from datetime import datetime

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(True)
today = datetime.today().strftime("%B %d, %Y")


class TestHintRoutes:
    @pytest.mark.asyncio
    async def test_get_hint(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get hint when no data
        question = get_question_by_id(session=session, id=5)
        question = question.serialize
        assert question["type"] == QuestionType.number
        res = await client.get(
            app.url_path_for("hint:get", question_id=question["id"])
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "mean": None,
            "q1": None,
            "q2": None,
            "q3": None,
            "max": None,
            "min": None,
        }
        # submit data with number
        res = await client.post(
            app.url_path_for("data:create", form_id=1),
            json=[
                {"question": 1, "value": "Option 1"},
                {"question": 2, "value": [2, 10]},
                {
                    "question": 3,
                    "value": {"lat": -7.836114, "lng": 110.331143},
                },
                {"question": 4, "value": "Hint Test"},
                {"question": 5, "value": 45},
                {"question": 6, "value": ["Option A", "Option B"]},
                {"question": 7, "value": "2021-12-21"},
            ],
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 5,
            "name": "Garut - Hint Test",
            "administration": 10,
            "created": today,
            "created_by": "Akvo Support",
            "form": 1,
            "geo": {"lat": -7.836114, "long": 110.331143},
            "updated": None,
            "updated_by": None,
            "answer": [
                {"question": 1, "value": "Option 1"},
                {"question": 2, "value": 10},
                {"question": 3, "value": "-7.836114|110.331143"},
                {"question": 4, "value": "Hint Test"},
                {"question": 5, "value": 45},
                {"question": 6, "value": ["Option A", "Option B"]},
                {"question": 7, "value": "2021-12-21"},
            ],
        }
        # assert second data
        res = await client.post(
            app.url_path_for("data:create", form_id=1),
            json=[
                {"question": 1, "value": "Option 2"},
                {"question": 2, "value": [2, 10]},
                {
                    "question": 3,
                    "value": {"lat": -7.836114, "lng": 110.331143},
                },
                {"question": 4, "value": "Hint Test"},
                {"question": 5, "value": 55},
                {"question": 6, "value": ["Option B"]},
                {"question": 7, "value": "2022-10-10"},
            ],
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        # get hint
        res = await client.get(
            app.url_path_for("hint:get", question_id=question["id"])
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "mean": "Average value is 50.0",
            "q1": "First quantile value is 47.5",
            "q2": "Second quantile value is 50.0",
            "q3": "Third quantile value is 52.5",
            "max": "Maximum value is 55.0",
            "min": "Minimum value is 45.0",
        }
