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


class TestOfflineSubmissionRoutes:
    @pytest.mark.asyncio
    async def test_submit_data_form_standalone(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.post(
            app.url_path_for("data:create_form_standalone", form_id=1),
            params={"submitter": "Wayan Galih"},
            json=[
                {"question": 1, "value": "Option 1"},
                {"question": 2, "value": [2, 10]},
                {"question": 3, "value": {"lat": -7.836114, "lng": 110.331143}},
                {"question": 4, "value": "Garut"},
            ],
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 7,
            "name": "Garut - Garut",
            "administration": 10,
            "created": today,
            "created_by": "Wayan Galih",
            "form": 1,
            "geo": {"lat": -7.836114, "long": 110.331143},
            "updated": None,
            "updated_by": None,
            "answer": [
                {"question": 1, "value": "Option 1"},
                {"question": 2, "value": 10},
                {"question": 3, "value": "-7.836114|110.331143"},
                {"question": 4, "value": "Garut"},
            ],
        }
