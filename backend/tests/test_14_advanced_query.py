import sys
import pytest
from datetime import datetime
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session
from models.views.view_data import ViewData

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(True)
today = datetime.today().strftime("%B %d, %Y")


class TestAdvancedFilter():
    @pytest.mark.asyncio
    async def test_get_data_with_query_option(self, app: FastAPI,
                                              session: Session,
                                              client: AsyncClient) -> None:
        data_view = session.query(ViewData).all()
        data_view = [d.raw for d in data_view]
        assert data_view == [[
            {"answer": "option 2", "id": 3, "question": "1"},
            {"answer": "o", "id": 3, "question": "6"},
            {"answer": "p", "id": 3, "question": "6"},
            {"answer": "t", "id": 3, "question": "6"},
            {"answer": "i", "id": 3, "question": "6"},
            {"answer": "o", "id": 3, "question": "6"},
            {"answer": "n", "id": 3, "question": "6"},
            {"answer": " ", "id": 3, "question": "6"},
            {"answer": "b", "id": 3, "question": "6"}
        ], [
            {"answer": "option 2", "id": 1, "question": "1"}
        ], [
            {"answer": "option 1", "id": 2, "question": "1"},
            {"answer": "o", "id": 2, "question": "6"},
            {"answer": "p", "id": 2, "question": "6"},
            {"answer": "t", "id": 2, "question": "6"},
            {"answer": "i", "id": 2, "question": "6"},
            {"answer": "o", "id": 2, "question": "6"},
            {"answer": "n", "id": 2, "question": "6"},
            {"answer": " ", "id": 2, "question": "6"},
            {"answer": "a", "id": 2, "question": "6"}
        ]]
        res = await client.get(
            app.url_path_for("data:get", form_id=1),
            params={"q": "1|option 1"},
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res["current"] == 1
        assert res["total"] == 1
        assert res["total_page"] == 1
        assert len(res["data"]) == 1

        res = await client.get(
            app.url_path_for("data:get", form_id=1),
            params={"q": "1|option 2"},
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res["current"] == 1
        assert res["total"] == 2
        assert res["total_page"] == 1
        assert len(res["data"]) == 2

    @pytest.mark.asyncio
    async def test_get_maps_with_query_option(self, app: FastAPI,
                                              session: Session,
                                              client: AsyncClient) -> None:
        res = await client.get(app.url_path_for("maps:get", form_id=1),
                               params={
                                   "marker": 1,
                                   "shape": 2,
                                   "q": "1|option 2"
                               })
        assert res.status_code == 200
        res = res.json()
        assert res == [{
            "id": 1,
            "geo": [-7.836114, 110.331143],
            "name": "Garut - Garut",
            "loc": "Garut",
            "marker": "Option 2",
            "shape": 10.0,
            }, {
            "id": 3,
            "geo": [-6.2, 106.81],
            "name": "Bantul - Testing Data 2",
            "loc": "Bantul",
            "marker": "Option 2",
            "shape": 24.0
        }]
