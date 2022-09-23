import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(True)

form_definition = {
    "id": 903430001,
    "name": "New Form",
    "description": "New Form Description",
    "question_group": [{
        "id": 903430556,
        "name": "Consequat porta lorem",
        "order": 1,
        "repeatable": False,
        "question": [{
            "id": 903430557,
            "order": 1,
            "questionGroupId": 903430556,
            "name": "Donec amet tincidunt dapibus ipsum aliquet",
            "type": "option",
            "required": False,
            "option": [{
                "code": None,
                "name": "New Option 1",
                "order": 1,
                "id": 904875904
            }, {
                "code": None,
                "name": "New Option 2",
                "order": 2,
                "id": 904875905
            }]
        }]
    }]
}


class TestWebformEditorRoutes():
    @pytest.mark.asyncio
    async def test_add_webform(
            self, app: FastAPI, session: Session, client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("webform:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=form_definition)
        assert res.status_code == 200
