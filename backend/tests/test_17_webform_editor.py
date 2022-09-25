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
    "name": "Test Form",
    "description": "This is a test form definition for webform editor",
    "question_group": [{
        "id": 903430556,
        "name": "Group 1",
        "order": 1,
        "repeatable": False,
        "question": [{
            "id": 903430547,
            "order": 1,
            "questionGroupId": 903430556,
            "name": "Name",
            "type": "text",
            "required": True
        }, {
            "id": 903430557,
            "order": 2,
            "questionGroupId": 903430556,
            "name": "Gender",
            "type": "option",
            "required": True,
            "option": [{
                "code": "M",
                "name": "Male",
                "order": 1,
                "id": 904875904
            }, {
                "code": "F",
                "name": "Female",
                "order": 2,
                "id": 904875905
            }]
        }, {
            "id": 903430558,
            "order": 3,
            "questionGroupId": 903430556,
            "name": "Address",
            "type": "text",
            "required": True
        }]
    }, {
        "id": 903430546,
        "name": "Group 2",
        "order": 2,
        "repeatable": False,
        "question": [{
            "id": 903430559,
            "order": 1,
            "questionGroupId": 903430546,
            "name": "Dependent to Gender Male",
            "type": "text",
            "required": False,
            "dependency": {
                "id": 903430557,
                "options": ["Male"]
            }
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

    @pytest.mark.asyncio
    async def test_update_webform(
            self, app: FastAPI, session: Session, client: AsyncClient) -> None:
        res = await client.put(
            app.url_path_for("webform:update", id=form_definition['id']),
            headers={"Authorization": f"Bearer {account.token}"},
            json=form_definition)
        assert res.status_code == 200
