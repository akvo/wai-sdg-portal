import sys
import pytest
from datetime import datetime
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from AkvoResponseGrouper.cli.generate_schema import generate_schema
from AkvoResponseGrouper.views import get_categories, refresh_view

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(True)
today = datetime.today().strftime("%B %d, %Y")


class TestDataRoutes:
    @pytest.mark.asyncio
    async def test_if_views_is_exists(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        schema = generate_schema(file_config="./source/wai-demo/category.json")
        session.execute(text(schema))
        refresh_view(session=session)
        res = get_categories(session=session)
        assert len(res) == 0

    @pytest.mark.asyncio
    async def test_get_data(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("data:get", form_id=1),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["current"] == 1
        assert res["total"] == 3
        assert res["total_page"] == 1
        assert len(res["data"]) == 3
        first_data = res["data"][len(res["data"]) - 1]
        assert first_data == {
            "id": 1,
            "name": "Garut - Garut",
            "administration": 10,
            "created": today,
            "created_by": "Akvo Support",
            "form": 1,
            "geo": {"lat": -7.836114, "long": 110.331143},
            "updated": None,
            "updated_by": None,
            "answer": [
                {"question": 1, "value": "Option 1", "history": False},
                {"question": 2, "value": 10, "history": False},
                {"question": 3, "value": "-7.836114|110.331143", "history": False},
                {"question": 4, "value": "Garut", "history": False},
            ],
        }

    @pytest.mark.asyncio
    async def test_get_last_submitted(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("data:last-submitted"),
            params={"form_id": 1},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        # account.decoded["name"]
        assert res == {"at": today, "by": "Wayan Galih"}
