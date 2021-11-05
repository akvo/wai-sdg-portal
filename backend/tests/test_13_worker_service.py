import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session
import db.crud_jobs as crud_jobs
from models.jobs import JobStatus, JobType
from tasks.main import do_task

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(True)
ftype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'


class TestWorkerRoutes():
    @pytest.mark.asyncio
    async def test_get_data_before_recorded(self, app: FastAPI,
                                            session: Session,
                                            client: AsyncClient) -> None:
        res = await client.get(
            app.url_path_for("data:get", form_id=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res["total"] == 1

    @pytest.mark.asyncio
    async def test_execute_first_queue(self, worker: FastAPI, session: Session,
                                       worker_client: AsyncClient) -> None:
        pending_jobs = None
        if crud_jobs.is_not_busy(session=session):
            pending_jobs = crud_jobs.pending(session=session)
        if pending_jobs:
            jobs = crud_jobs.update(session=session,
                                    id=pending_jobs,
                                    status=JobStatus.on_progress)
            do_task(session=session, jobs=jobs)
        res = await worker_client.get(
            worker.url_path_for("jobs:status", id=pending_jobs))
        assert res.json() == "done"
        current = crud_jobs.get_by_id(session=session, id=pending_jobs)
        assert current["available"] is not None
        assert current["type"] is JobType.seed_data
        assert current["status"] is JobStatus.done

    @pytest.mark.asyncio
    async def test_execute_second_queue(self, worker: FastAPI,
                                        session: Session,
                                        worker_client: AsyncClient) -> None:
        pending_jobs = None
        pending_jobs = crud_jobs.pending(session=session)
        assert pending_jobs is False

    @pytest.mark.asyncio
    async def test_get_data_after_recorded(self, app: FastAPI,
                                           session: Session,
                                           client: AsyncClient) -> None:
        res = await client.get(
            app.url_path_for("data:get", form_id=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res["total"] == 3
