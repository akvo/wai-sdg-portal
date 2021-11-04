import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session
from db.crud_answer import get_answer_by_question

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(True)


class TestFileRoutes():
    @pytest.mark.asyncio
    async def test_delete_data(self, app: FastAPI, session: Session,
                               client: AsyncClient) -> None:
        data = await client.get(
            app.url_path_for("data:get_by_id", id=1),
            headers={"Authorization": f"Bearer {account.token}"})
        data.status_code == 200
        data = data.json()
        assert data["answer"] == [
            {
                "question": 1,
                "value": "Option 2"
            },
            {
                "question": 2,
                "value": 4
            },
            {
                "question": 3,
                "value": "-7.836114|110.331143"
            },
            {
                "question": 4,
                "value": "Bandung"
            },
        ]
        res = await client.delete(
            app.url_path_for("data:delete", id=data["id"]),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 204
        res = await client.get(app.url_path_for("data:get", form_id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["total"] == 2

        deleted_data = await client.get(
            app.url_path_for("data:get_by_id", id=data["id"]),
            headers={"Authorization": f"Bearer {account.token}"})
        deleted_data.status_code == 401
        for q in data["answer"]:
            answer = get_answer_by_question(session=session,
                                            question=q["question"])
            for a in answer:
                assert a.data != 1
