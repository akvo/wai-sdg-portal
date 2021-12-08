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

    @pytest.mark.asyncio
    async def test_get_aggregated_jmp_chart_data(self, app: FastAPI,
                                                 session: Session,
                                                 client: AsyncClient) -> None:
        res = await client.get(app.url_path_for(
                "charts:get_aggregated_jmp_chart_data",
                form_id=1, question_id=1))
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "form": 1,
            "question": 1,
            "data": [{
                    "administration": 2,
                    "child": [{
                        "count": 1,
                        "option": "Option 2",
                        "percent": 100.00
                    }],
                    "score": 5.0
                },
                {
                    "administration": 3,
                    "child": [{
                        "count": 1,
                        "option": "Option 2",
                        "percent": 100.00
                    }],
                    "score": 5.0
                }]
            }

    @pytest.mark.asyncio
    async def test_get_aggregated_pie_chart_data(
        self, app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        res = await client.get(app.url_path_for(
                "charts:get_aggregated_pie_chart_data",
                form_id=1, question_id=1))
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "form": 1,
            "question": 1,
            "data": [{
                    "count": 1,
                    "itemStyle": {"color": "#333"},
                    "name": 'Option 1',
                    "total": 3,
                    "value": 33.33,
                },
                {
                    "count": 2,
                    "itemStyle": {"color": "#333"},
                    "name": "Option 2",
                    "total": 3,
                    "value": 66.67,
                }]
            }

    @pytest.mark.asyncio
    async def test_get_overviews_chart_and_info_data(
        self, app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        res = await client.get(app.url_path_for(
                "charts:get_overviews_chart_and_info",
                form_id=1, question_id=1, option="option 2"))
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "form": 1,
            "question": 1,
            "data": [{
                        "data": {
                            "count": 2,
                            "name": "Option 2",
                            "total": 3,
                            "value": 66.67,
                        },
                        "type": "info",
                    },
                    {
                        "data": [
                            {
                                "count": 1,
                                "name": 'Option 1',
                                "total": 3,
                                "value": 33.33,
                            }, {
                                "count": 2,
                                "name": "Option 2",
                                "total": 3,
                                "value": 66.67,
                            }
                        ],
                        "type": "chart",
                    }
                ]
            }
