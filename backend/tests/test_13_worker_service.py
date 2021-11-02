import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session
import db.crud_jobs as crud_jobs
from models.jobs import JobStatus

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(True)
ftype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'


class TestWorkerRoutes():
    @pytest.mark.asyncio
    async def test_get_data_before_recorded(self, app: FastAPI,
                                            session: Session,
                                            client: AsyncClient) -> None:
        res = await client.get(app.url_path_for("data:get", form_id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["total"] == 1

    @pytest.mark.asyncio
    async def test_execute_first_queue(self, worker: FastAPI, session: Session,
                                       worker_client: AsyncClient) -> None:
        res = await worker_client.get(worker.url_path_for("jobs:start"))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 2
        assert res["status"] == "on_progress"
        assert res["info"] == {"administration": 4, "form_id": 1}
        assert res["available"] is None
        current = crud_jobs.get_by_id(session=session, id=res["id"])
        assert current["available"] is None
        assert current["status"] == JobStatus.failed
        assert current["info"] == {
            "administration": 4,
            "form_id": 1,
        }

    @pytest.mark.asyncio
    async def test_execute_second_queue(self, worker: FastAPI,
                                        session: Session,
                                        worker_client: AsyncClient) -> None:
        res = await worker_client.get(worker.url_path_for("jobs:start"))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 3
        assert res["status"] == "on_progress"
        assert res["info"] == {"administration": 5, "form_id": 1}
        assert res["available"] is None
        current = crud_jobs.get_by_id(session=session, id=res["id"])
        assert current["available"] is not None
        assert current["status"] == JobStatus.done
        assert current["info"] == {
            "administration": 5,
            "form_id": 1,
            "records": 2,
        }

    @pytest.mark.asyncio
    async def test_get_data_after_recorded(self, app: FastAPI,
                                           session: Session,
                                           client: AsyncClient) -> None:
        res = await client.get(app.url_path_for("data:get", form_id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["total"] == 3
