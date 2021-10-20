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


class TestMapsRoutes():
    @pytest.mark.asyncio
    async def test_get_data(self, app: FastAPI, session: Session,
                            client: AsyncClient) -> None:
        res = await client.get(app.url_path_for("maps:get", form_id=1),
                               params={
                                   "color_by": 1,
                                   "count_by": 2
                               })
        assert res.status_code == 200
        res = res.json()
        assert res == [{
            "id": 1,
            "geo": [-7.836114, 110.331143],
            "loc": "Arsi Negele Town",
            "color_by": "Option 1",
            "count_by": 4,
        }]
