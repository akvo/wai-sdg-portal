import sys
import pytest
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
                                   "marker": 1,
                                   "shape": 2
                               })
        assert res.status_code == 200
        res = res.json()
        assert res == [{
            "id": 1,
            "geo": [-7.836114, 110.331143],
            "name": "Garut - Garut",
            "loc": "Garut",
            "marker": "Option 1",
            "marker_hover": None,
            "shape": 10.0,
        }]
