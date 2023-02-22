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
    async def test_get_aggregated_chart_data(
            self, app: FastAPI, session: Session, client: AsyncClient) -> None:
        res = await client.get(
            app.url_path_for("charts:get_aggregated_chart_data", form_id=1),
            params={"question": 1})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "type": "BAR",
            "data": [{
                "name": "option 1",
                "value": 1
            }, {
                "name": "option 2",
                "value": 3
            }]
        }

    @pytest.mark.asyncio
    async def test_get_aggregated_jmp_chart_data(
            self, app: FastAPI, session: Session, client: AsyncClient) -> None:
        res = await client.get(
            app.url_path_for(
                "charts:get_aggregated_jmp_chart_data",
                form_id=1, cname='1'))
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "form": 1,
            "question": '1',
            "data": [{
                "administration": 1,
                "child": [],
                "score": 0
            }, {
                "administration": 2,
                "child": [],
                "score": 0
            }, {
                "administration": 3,
                "child": [],
                "score": 0
            }]
        }

    @pytest.mark.asyncio
    async def test_get_aggregated_pie_chart_data(
        self, app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for(
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
                "total": 4,
                "value": 25.0,
            }, {
                "count": 3,
                "itemStyle": {"color": "#333"},
                "name": "Option 2",
                "total": 4,
                "value": 75.0,
            }]
        }

    @pytest.mark.asyncio
    async def test_get_overviews_chart_and_info_data(
        self, app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for(
                "charts:get_overviews_chart_and_info",
                form_id=1, question_id=1, option="option 2"))
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "form": 1,
            "question": 1,
            "question_name": "Test Option Question",
            "data": [{
                "data": {
                    "itemStyle": {"color": "#333"},
                    "count": 3,
                    "name": "Option 2",
                    "total": 4,
                    "value": 75.0,
                },
                "type": "info",
            }, {
                "data": [{
                    "count": 1,
                    "itemStyle": {"color": "#333"},
                    "name": 'Option 1',
                    "total": 4,
                    "value": 25.0,
                }, {
                    "count": 3,
                    "itemStyle": {"color": "#333"},
                    "name": "Option 2",
                    "total": 4,
                    "value": 75.0,
                }],
                "type": "chart",
            }]
        }
