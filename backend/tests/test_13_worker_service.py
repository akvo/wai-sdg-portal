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
    async def test_available_jobs(self, worker: FastAPI, session: Session,
                                  worker_client: AsyncClient) -> None:
        res = await worker_client.get(worker.url_path_for("jobs:start"))
        assert res.status_code == 200
        res = res.json()
        assert res["status"] == "on_progress"
        assert res["info"] == {"administration": 4, "form_id": 1}
        assert res["available"] is None
        current = crud_jobs.get_by_id(session=session, id=res["id"])
        assert current["available"] is not None
        assert current["status"] == JobStatus.done
        assert current["info"] == {
            "administration": 4,
            "form_id": 1,
            "valid": False
        }
