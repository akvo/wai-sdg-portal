import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(True)


class TestChartsRoutes():
    @pytest.mark.asyncio
    async def test_get_aggregated_chart_data(self, app: FastAPI,
                                             session: Session,
                                             client: AsyncClient) -> None:
        res = await client.get(app.url_path_for(
                "charts:get_aggregated_chart_data",
                form_id=1), params={
                    "question": 1
                })
        assert res.status_code == 200
        res = res.json()
        assert res == {
                "type": "BAR",
                "data": [{
                    "name": "option 1",
                    "value": 1
                }, {
                    "name": "option 2",
                    "value": 2
                }]
            }
