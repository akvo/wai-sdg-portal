import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from datetime import datetime
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session
from models.jobs import JobType, JobStatus
import db.crud_jobs as jobs

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(True)
today = datetime.today().strftime("%B %d, %Y")


class TestsJobs:
    @pytest.mark.asyncio
    async def test_write_jobs(self, session: Session) -> None:
        new_task = jobs.add(
            session=session,
            payload="testing_job_1.xlsx",
            created_by=1,
            type=JobType.validate_data,
        )
        assert new_task["id"] == 1
        assert new_task["created_by"] == 1
        assert new_task["payload"] == "testing_job_1.xlsx"
        assert new_task["status"] == JobStatus.pending
        assert new_task["available"] is None

    @pytest.mark.asyncio
    async def test_for_worker_checking_a_pending_jobs(self, session: Session) -> None:
        new_task = jobs.pending(session=session)
        assert new_task == 1
        new_task = jobs.update(
            session=session, id=new_task, status=JobStatus.on_progress
        )

    @pytest.mark.asyncio
    async def test_web_check_worker_availability(self, session: Session) -> None:
        availability = jobs.is_not_busy(session=session)
        assert availability is False
        current_task = jobs.update(session=session, id=1, status=JobStatus.done)
        assert current_task["available"].strftime("%B %d, %Y") == today
        availability = jobs.is_not_busy(session=session)
        assert availability is True

    @pytest.mark.asyncio
    async def test_get_jobs_by_current_user(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("jobs:get_by_current_user"),
            params={
                "page": 1,
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["current"] == 1
        assert len(res["data"]) > 0
        assert res["data"][0]["created_by"] == 1
        assert res["data"][0]["status"] == "done"
        res404 = await client.get(
            app.url_path_for("jobs:get_by_current_user"),
            params={
                "page": 2,
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res404.status_code == 404
