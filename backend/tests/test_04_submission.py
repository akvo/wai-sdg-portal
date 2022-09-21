import sys
import pytest
from datetime import datetime
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session

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
            "question_group": [{
                "form": 1,
                "id": 1,
                "name": "Test Question Group",
                "order": 1,
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
                    }, {
                        "color": "#333",
                        "id": 2,
                        "name": "Option 2",
                        "order": 2,
                        "score": 5,
                    }, {
                        "color": None,
                        "id": 3,
                        "name": "Option 3",
                        "order": None,
                        "score": 10,
                    }],
                    "dependency": None,
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
                }]
            }]
        }

    @pytest.mark.asyncio
    async def test_submit_data(self, app: FastAPI, session: Session,
                               client: AsyncClient) -> None:
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
            "score": None
        }, {
            "id": 2,
            "name": "Option 2",
            "color": "#333",
            "order": 2,
            "score": 5,
        }, {
            "id": 3,
            "name": "Option 3",
            "color": None,
            "order": None,
            "score": 10,
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
            },
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
        }

    @pytest.mark.asyncio
    async def test_get_webform_editor(
        self, app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("webform_editor:get_by_id", id=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            'id': 1,
            'name': 'test',
            'question_group': [{
                'id': 1,
                'form': 1,
                'question': [{
                    'id': 1,
                    'form': 1,
                    'question_group': 1,
                    'name': 'Test Option Question',
                    'order': 1,
                    'meta': True,
                    'type': 'option',
                    'required': True,
                    'rule': None,
                    'dependency': None,
                    'option': [{
                        'color': '#333',
                        'name': 'Option 2',
                        'id': 2,
                        'score': 5,
                        'order': 2,
                        'question': 1
                    }, {
                        'color': None,
                        'name': 'Option 3',
                        'id': 3,
                        'score': 10,
                        'order': None,
                        'question': 1
                    }, {
                        'color': '#333',
                        'name': 'Option 1',
                        'id': 1,
                        'score': None,
                        'order': 1,
                        'question': 1
                    }],
                    'disableDelete': True
                }, {
                    'id': 2,
                    'form': 1,
                    'question_group': 1,
                    'name': 'Test Administration Question',
                    'order': 2,
                    'meta': True,
                    'type': 'cascade',
                    'required': True,
                    'rule': None,
                    'dependency': None,
                    'option': 'administration',
                    'disableDelete': True
                }, {
                    'id': 3,
                    'form': 1,
                    'question_group': 1,
                    'name': 'Test Geo Question',
                    'order': 3,
                    'meta': True,
                    'type': 'geo',
                    'required': True,
                    'rule': None,
                    'dependency': None,
                    'option': [],
                    'disableDelete': True,
                    'center': {
                        'lat': 7.3942,
                        'lng': 38.6682
                    }
                }, {
                    'id': 4,
                    'form': 1,
                    'question_group': 1,
                    'name': 'Test Datapoint Text Question',
                    'order': 4,
                    'meta': True,
                    'type': 'text',
                    'required': True,
                    'rule': None,
                    'dependency': [{
                        'id': 1,
                        'options': ['Option 1']
                    }],
                    'option': [],
                    'disableDelete': True
                }],
                'name': 'Test Question Group',
                'order': 1
            }],
            'cascade': {
                'administration': [{
                    'value': 1,
                    'label': 'Jakarta',
                    'children': [{
                        'value': 4,
                        'label': 'Jakarta Pusat'
                    }, {
                        'value': 5,
                        'label': 'Jakarta Barat'
                    }, {
                        'value': 6,
                        'label': 'Jakarta Selatan'
                    }, {
                        'value': 7,
                        'label': 'Jakarta Utara'
                    }, {
                        'value': 8,
                        'label': 'Jakarta Timur'
                    }]
                }, {
                    'value': 2,
                    'label': 'Jawa Barat',
                    'children': [{
                        'value': 9,
                        'label': 'Bandung'
                    }, {
                        'value': 10,
                        'label': 'Garut'
                    }, {
                        'value': 11,
                        'label': 'Bogor'
                    }, {
                        'value': 12,
                        'label': 'Sumedang'
                    }, {
                        'value': 13,
                        'label': 'Cianjur'
                    }, {
                        'value': 14,
                        'label': 'Sukabumi'
                    }, {
                        'value': 15,
                        'label': 'Bekasi'
                    }, {
                        'value': 16,
                        'label': 'Subang'
                    }, {
                        'value': 17,
                        'label': 'Majalengka'
                    }, {
                        'value': 18,
                        'label': 'Ciamis'
                    }, {
                        'value': 19,
                        'label': 'Banjar'
                    }, {
                        'value': 20,
                        'label': 'Indramayu'
                    }, {
                        'value': 21,
                        'label': 'Kuningan'
                    }]
                }, {
                    'value': 3,
                    'label': 'Yogyakarta',
                    'children': [{
                        'value': 22,
                        'label': 'Kota Yogyakarta'
                    }, {
                        'value': 23,
                        'label': 'Sleman'
                    }, {
                        'value': 24,
                        'label': 'Bantul'
                    }, {
                        'value': 25,
                        'label': 'Wonosari'
                    }, {
                        'value': 26,
                        'label': 'Kulon Progo'
                    }]
                }]
            }
        }
