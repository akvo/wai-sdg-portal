import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(True)


class TestMapsRoutes:
    @pytest.mark.asyncio
    async def test_get_map_data(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("maps:get", form_id=1),
            params={"marker": "Water", "shape": 2},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["data"] == [
            {
                "id": 1,
                "loc": "Garut",
                "geo": [-7.836114, 110.331143],
                "name": "Garut - Garut",
                "marker": None,
                "shape": 10.0,
            },
            {
                "id": 2,
                "loc": "Garut",
                "geo": [-7.836114, 110.331143],
                "name": "Garut",
                "marker": None,
                "shape": 10.0,
            },
        ]
