import sys
import pytest
from datetime import datetime
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session
import db.crud_answer as crud_answer
from models.answer import Answer
from models.question import QuestionType

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(True)
today = datetime.today().strftime("%B %d, %Y")


class TestSubmissionRoutes():
    @pytest.mark.asyncio
    async def test_get_form(self, app: FastAPI, session: Session,
                            client: AsyncClient) -> None:
        res = await client.get(app.url_path_for("form:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "name": "test",
            "description": "test description",
            "default_language": "en",
            "languages": ["en", "id"],
            "translations": [{
                "language": "id",
                "name": "uji coba",
                "description": "deskripsi uji coba"
            }],
            "question_group": [{
                "form": 1,
                "id": 1,
                "name": "Test Question Group",
                "order": 1,
                "description": None,
                "repeatable": False,
                "repeat_text": None,
                "translations": None,
                "question": [{
                    "form": 1,
                    "id": 1,
                    "meta": True,
                    "name": "Test Option Question",
                    "order": 1,
                    "question_group": 1,
                    "type": "option",
                    "required": True,
                    "rule": None,
                    "option": [{
                        "color": "#333",
                        "id": 1,
                        "name": "Option 1",
                        "order": 1,
                        "score": None,
                        "code": "OP1",
                        "translations": [{
                            "language": "id",
                            "name": "Pilihan 1"
                        }]
                    }, {
                        "color": "#333",
                        "id": 2,
                        "name": "Option 2",
                        "order": 2,
                        "score": 5,
                        "code": "OP2",
                        "translations": [{
                            "language": "id",
                            "name": "Pilihan 2"
                        }]
                    }, {
                        "color": None,
                        "id": 3,
                        "name": "Option 3",
                        "order": None,
                        "score": 10,
                        "code": "OP3",
                        "translations": [{
                            "language": "id",
                            "name": "Pilihan 3"
                        }]
                    }],
                    "dependency": None,
                    "tooltip": None,
                    "translations": None,
                    "api": None,
                    "addons": None
                }, {
                    "form": 1,
                    "id": 2,
                    "meta": True,
                    "name": "Test Administration Question",
                    "order": 2,
                    "question_group": 1,
                    "type": "administration",
                    "required": True,
                    "rule": None,
                    "option": [],
                    "dependency": None,
                    "tooltip": None,
                    "translations": None,
                    "api": None,
                    "addons": None
                }, {
                    "form": 1,
                    "id": 3,
                    "meta": True,
                    "name": "Test Geo Question",
                    "order": 3,
                    "question_group": 1,
                    "type": "geo",
                    "required": True,
                    "rule": None,
                    "option": [],
                    "dependency": None,
                    "tooltip": None,
                    "translations": None,
                    "api": None,
                    "addons": None
                }, {
                    "form": 1,
                    "id": 4,
                    "meta": True,
                    "name": "Test Datapoint Text Question",
                    "order": 4,
                    "question_group": 1,
                    "type": "text",
                    "required": True,
                    "rule": None,
                    "option": [],
                    "dependency": [{
                        "id": 1,
                        "options": ["Option 1"]
                    }],
                    "tooltip": None,
                    "translations": None,
                    "api": None,
                    "addons": None
                }]
            }]
        }

    @pytest.mark.asynio
    async def test_append_value_crud_answer_func(
            self, app: FastAPI, session: Session, client: AsyncClient) -> None:
        answer = Answer(question=1, created_by=1, created=None)
        # option
        value = ["Option 1"]
        res = crud_answer.append_value(
            answer=answer, value=value, type=QuestionType.option)
        assert res.question == answer.question
        assert res.options == value
        assert res.text is None
        assert res.value is None
        # administration
        answer = Answer(question=2, created_by=1, created=None)
        value = 10
        res = crud_answer.append_value(
            answer=answer, value=value, type=QuestionType.administration)
        assert res.question == answer.question
        assert res.value == value
        assert res.text is None
        assert res.options is None
        # geo
        answer = Answer(question=3, created_by=1, created=None)
        value = [-7.836114, 110.331143]
        res = crud_answer.append_value(
            answer=answer, value=value, type=QuestionType.geo)
        assert res.question == answer.question
        assert res.text == ("{}|{}").format(value[0], value[1])
        assert res.value is None
        assert res.options is None
        # text
        answer = Answer(question=4, created_by=1, created=None)
        value = "Test"
        res = crud_answer.append_value(
            answer=answer, value=value, type=QuestionType.text)
        assert res.question == answer.question
        assert res.text == value
        assert res.value is None
        assert res.options is None
        # number
        answer = Answer(question=5, created_by=1, created=None)
        value = 99
        res = crud_answer.append_value(
            answer=answer, value=value, type=QuestionType.number)
        assert res.question == answer.question
        assert res.value == value
        assert res.text is None
        assert res.options is None
        # date
        answer = Answer(question=6, created_by=1, created=None)
        value = "2021-12-21"
        res = crud_answer.append_value(
            answer=answer, value=value, type=QuestionType.date)
        assert res.question == answer.question
        assert res.text == value
        assert res.value is None
        assert res.options is None
        # multiple option
        answer = Answer(question=7, created_by=1, created=None)
        value = ["Multiple Option 1", "Multiple Option 2"]
        res = crud_answer.append_value(
            answer=answer, value=value, type=QuestionType.multiple_option)
        assert res.question == answer.question
        assert res.options == value
        assert res.text is None
        assert res.value is None

    @pytest.mark.asyncio
    async def test_submit_data(
            self, app: FastAPI, session: Session, client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("data:create", form_id=1),
            json=[{
                "question": 1,
                "value": "Option 1"
            }, {
                "question": 2,
                "value": [2, 10]
            }, {
                "question": 3,
                "value": {
                    "lat": -7.836114,
                    "lng": 110.331143
                }
            }, {
                "question": 4,
                "value": "Garut"
            }],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "name": "Garut - Garut",
            "administration": 10,
            "created": today,
            "created_by": "Akvo Support",
            "form": 1,
            "geo": {
                "lat": -7.836114,
                "long": 110.331143
            },
            "updated": None,
            "updated_by": None,
            "answer": [{
                "question": 1,
                "value": "Option 1"
            }, {
                "question": 2,
                "value": 10
            }, {
                "question": 3,
                "value": "-7.836114|110.331143"
            }, {
                "question": 4,
                "value": "Garut"
            }]
        }

    @pytest.mark.asyncio
    async def test_get_all_option(self, app: FastAPI, session: Session,
                                  client: AsyncClient) -> None:
        res = await client.get(
            app.url_path_for("option:get"),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == [{
            "id": 1,
            "name": "Option 1",
            "color": "#333",
            "order": 1,
            "score": None,
            "code": "OP1",
            "translations": [{
                "language": "id",
                "name": "Pilihan 1"
            }]
        }, {
            "id": 2,
            "name": "Option 2",
            "color": "#333",
            "order": 2,
            "score": 5,
            "code": "OP2",
            "translations": [{
                "language": "id",
                "name": "Pilihan 2"
            }]
        }, {
            "id": 3,
            "name": "Option 3",
            "color": None,
            "order": None,
            "score": 10,
            "code": "OP3",
            "translations": [{
                "language": "id",
                "name": "Pilihan 3"
            }]
        }]

    @pytest.mark.asyncio
    async def test_update_option(self, app: FastAPI, session: Session,
                                 client: AsyncClient) -> None:
        res = await client.put(
            app.url_path_for("option:update", id=1),
            params={
                "name": "Option 1",
                "color": "#333",
                "order": 1,
                "code": "OP1"
            },
            json=[{
                "language": "id",
                "name": "Pilihan 1"
            }],
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "color": "#333",
            "id": 1,
            "name": "Option 1",
            "order": 1,
            "score": None,
            "code": "OP1",
            "translations": [{
                "language": "id",
                "name": "Pilihan 1"
            }]
        }

    @pytest.mark.asyncio
    async def test_get_webform_editor(
        self, app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("webform:get_by_id", id=1),
            params={'edit': True},
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        for qg in res.get('question_group'):
            for q in qg.get('question'):
                assert 'disableDelete' in q
                assert q.get('disableDelete') is True
