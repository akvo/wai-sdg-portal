import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(True)


class TestChartsRoutes:
    @pytest.mark.asyncio
    async def test_get_aggregated_chart_data(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("charts:get_aggregated_chart_data", form_id=1),
            params={"question": 1},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "type": "BAR",
            "data": [
                {"name": "option 1", "value": 1},
                {"name": "option 2", "value": 3},
            ],
        }

    @pytest.mark.asyncio
    async def test_get_aggregated_chart_data_with_administration_stack(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("charts:get_aggregated_chart_data", form_id=1),
            params={"question": 1, "stack": 2},
        )
        assert res.status_code == 200
        res = res.json()
        print(res)
        assert res == {
            'type': 'BARSTACK',
            'data': [{
                'group': 'option 1',
                'child': [{
                    'name': 24,
                    'value': 1
                }]
            }, {
                'group': 'option 2',
                'child': [{
                    'name': 10,
                    'value': 2
                }, {
                    'name': 24,
                    'value': 1
                }]
            }]
        }

    @pytest.mark.asyncio
    async def test_get_aggregated_jmp_chart_data(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for(
                "charts:get_aggregated_jmp_chart_data",
                form_id=1,
                type_name="water",
            )
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "current": 1,
            "data": [
                {"administration": 1, "child": []},
                {"administration": 2, "child": []},
                {"administration": 3, "child": []},
            ],
            "total": 4,
            "total_page": 1,
            "question": "water",
            "scores": [],
        }
        res = await client.get(
            app.url_path_for(
                "charts:get_aggregated_jmp_chart_data",
                form_id=1,
                type_name="sanitation",
            ),
            params={"administration": 3},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "current": 1,
            "data": [
                {"administration": 22, "child": []},
                {"administration": 23, "child": []},
                {"administration": 24, "child": []},
                {"administration": 25, "child": []},
                {"administration": 26, "child": []},
            ],
            "total": 2,
            "total_page": 1,
            "question": "sanitation",
            "scores": [],
        }

    @pytest.mark.asyncio
    async def test_get_aggregated_pie_chart_data(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for(
                "charts:get_aggregated_pie_chart_data",
                form_id=1,
                question_id=1,
            )
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "form": 1,
            "question": 1,
            "data": [
                {
                    "count": 1,
                    "itemStyle": {"color": "#333"},
                    "name": "Option 1",
                    "total": 4,
                    "value": 25.0,
                },
                {
                    "count": 3,
                    "itemStyle": {"color": "#333"},
                    "name": "Option 2",
                    "total": 4,
                    "value": 75.0,
                },
            ],
        }

    @pytest.mark.asyncio
    async def test_get_overviews_chart_and_info_data(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for(
                "charts:get_overviews_chart_and_info",
                form_id=1,
                question_id=1,
                option="option 2",
            )
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "form": 1,
            "question": 1,
            "question_name": "Test Option Question",
            "data": [
                {
                    "data": {
                        "itemStyle": {"color": "#333"},
                        "count": 3,
                        "name": "Option 2",
                        "total": 4,
                        "value": 75.0,
                    },
                    "type": "info",
                },
                {
                    "data": [
                        {
                            "count": 1,
                            "itemStyle": {"color": "#333"},
                            "name": "Option 1",
                            "total": 4,
                            "value": 25.0,
                        },
                        {
                            "count": 3,
                            "itemStyle": {"color": "#333"},
                            "name": "Option 2",
                            "total": 4,
                            "value": 75.0,
                        },
                    ],
                    "type": "chart",
                },
            ],
        }
