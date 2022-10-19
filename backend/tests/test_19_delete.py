import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session
from models.form import Form
from models.data import Data

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(True)


class TestDeleteRoutes():
    @pytest.mark.asyncio
    async def test_delete_form(
            self, app: FastAPI, session: Session, client: AsyncClient) -> None:
        # with data
        data = session.query(Data).first()
        res = await client.delete(
            app.url_path_for("form:delete", id=data.form),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 400
        # no data
        form = session.query(Form).filter(Form.id != data.form).first()
        res = await client.delete(
            app.url_path_for("form:delete", id=form.id),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 204
