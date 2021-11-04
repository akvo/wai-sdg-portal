import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(True)


class TestFileRoutes():
    @pytest.mark.asyncio
    async def test_delete_data(self, app: FastAPI, session: Session,
                               client: AsyncClient) -> None:
        res = await client.delete(
            app.url_path_for("data:delete", id=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 204
        res = await client.get(app.url_path_for("data:get", form_id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["total"] == 2
