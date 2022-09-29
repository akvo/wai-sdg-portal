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
            "allowOther": True,
            "allowOtherText": "Other gender",
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
        }, {
            "id": 903430559,
            "order": 4,
            "questionGroupId": 903430556,
            "name": "Age",
            "type": "number",
            "required": True
        }]
    }, {
        "id": 903430546,
        "name": "Group 2",
        "order": 2,
        "repeatable": False,
        "question": [{
            "id": 903430560,
            "order": 1,
            "questionGroupId": 903430546,
            "name": "Dependent to Gender Male",
            "type": "text",
            "required": False,
            "tooltip": {
                "text": "This question is for male",
                "translations": {
                    "language": "id",
                    "text": "Pertanyaan ini akan untuk laki-laki"
                }
            },
            "dependency": [{
                "id": 903430557,
                "options": ["Male"]
            }]
        }, {
            "id": 903430561,
            "order": 1,
            "questionGroupId": 903430546,
            "name": "Dependent to Age greater than 17",
            "type": "text",
            "required": True,
            "tooltip": {
                "text": "This question is for age greater than 17",
                "translations": {
                    "language": "id",
                    "text": "Pertanyaan ini untuk usia di atas 17"
                }
            },
            "dependency": [{
                "id": 903430559,
                "min": 17
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
        res = res.json()
        form_id = res.get('id')
        # get webform
        res = await client.get(
            app.url_path_for("webform:get_by_id", id=form_id),
            params={"edit": True},
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 903430001,
            "name": "Test Form",
            "description": "This is a test form definition for webform editor",
            "languages": None,
            "defaultLanguage": None,
            "translations": None,
            "question_group": [{
                "id": 903430556,
                "form": 903430001,
                "name": "Group 1",
                "order": 1,
                "description": None,
                "repeatable": False,
                "translations": None,
                "repeatText": None,
                "question": [{
                    "id": 903430547,
                    "form": 903430001,
                    "question_group": 903430556,
                    "name": "Name",
                    "order": 1,
                    "meta": False,
                    "type": "text",
                    "required": True,
                    "rule": None,
                    "dependency": None,
                    "tooltip": None,
                    "translations": None,
                    "api": None,
                    "option": [],
                }, {
                    "id": 903430557,
                    "form": 903430001,
                    "question_group": 903430556,
                    "name": "Gender",
                    "order": 2,
                    "meta": False,
                    "type": "option",
                    "required": True,
                    "rule": None,
                    "dependency": None,
                    "tooltip": None,
                    "translations": None,
                    "api": None,
                    "allowOther": True,
                    "allowOtherText": "Other gender",
                    "option": [{
                        "translations": None,
                        "score": None,
                        "order": 1,
                        "name": "Male",
                        "id": 904875904,
                        "code": "M",
                        "color": None,
                        "question": 903430557,
                    }, {
                        "translations": None,
                        "score": None,
                        "order": 2,
                        "name": "Female",
                        "id": 904875905,
                        "code": "F",
                        "color": None,
                        "question": 903430557,
                    }],
                }, {
                    "id": 903430558,
                    "form": 903430001,
                    "question_group": 903430556,
                    "name": "Address",
                    "order": 3,
                    "meta": False,
                    "type": "text",
                    "required": True,
                    "rule": None,
                    "dependency": None,
                    "tooltip": None,
                    "translations": None,
                    "api": None,
                    "option": [],
                }, {
                    "id": 903430559,
                    "form": 903430001,
                    "question_group": 903430556,
                    "name": "Age",
                    "order": 4,
                    "meta": False,
                    "type": "number",
                    "required": True,
                    "rule": None,
                    "dependency": None,
                    "tooltip": None,
                    "translations": None,
                    "api": None,
                    "option": [],
                }]
            }, {
                "id": 903430546,
                "form": 903430001,
                "name": "Group 2",
                "order": 2,
                "description": None,
                "repeatable": False,
                "translations": None,
                "repeatText": None,
                "question": [{
                    "id": 903430560,
                    "form": 903430001,
                    "question_group": 903430546,
                    "name": "Dependent to Gender Male",
                    "order": 1,
                    "meta": False,
                    "type": "text",
                    "required": False,
                    "rule": None,
                    "dependency": [
                        {"id": 903430557, "options": ["Male"]}],
                    "tooltip": {
                        "text": "This question is for male",
                        "translations": {
                            "text": "Pertanyaan ini akan untuk laki-laki",
                            "language": "id",
                        },
                    },
                    "translations": None,
                    "api": None,
                    "option": [],
                }, {
                    "id": 903430561,
                    "form": 903430001,
                    "question_group": 903430546,
                    "name": "Dependent to Age greater than 17",
                    "order": 1,
                    "meta": False,
                    "type": "text",
                    "required": True,
                    "rule": None,
                    "dependency": [{"id": 903430559, "min": 17}],
                    "tooltip": {
                        "text": "This question is for age greater than 17",
                        "translations": {
                            "text": "Pertanyaan ini untuk usia di atas 17",
                            "language": "id",
                        },
                    },
                    "translations": None,
                    "api": None,
                    "option": [],
                }]
            }],
            "cascade": {
                "administration": [{
                    "value": 1,
                    "label": "Jakarta",
                    "children": [
                        {"value": 4, "label": "Jakarta Pusat"},
                        {"value": 5, "label": "Jakarta Barat"},
                        {"value": 6, "label": "Jakarta Selatan"},
                        {"value": 7, "label": "Jakarta Utara"},
                        {"value": 8, "label": "Jakarta Timur"},
                    ],
                }, {
                    "value": 2,
                    "label": "Jawa Barat",
                    "children": [
                        {"value": 9, "label": "Bandung"},
                        {"value": 10, "label": "Garut"},
                        {"value": 11, "label": "Bogor"},
                        {"value": 12, "label": "Sumedang"},
                        {"value": 13, "label": "Cianjur"},
                        {"value": 14, "label": "Sukabumi"},
                        {"value": 15, "label": "Bekasi"},
                        {"value": 16, "label": "Subang"},
                        {"value": 17, "label": "Majalengka"},
                        {"value": 18, "label": "Ciamis"},
                        {"value": 19, "label": "Banjar"},
                        {"value": 20, "label": "Indramayu"},
                        {"value": 21, "label": "Kuningan"},
                    ],
                }, {
                    "value": 3,
                    "label": "Yogyakarta",
                    "children": [
                        {"value": 22, "label": "Kota Yogyakarta"},
                        {"value": 23, "label": "Sleman"},
                        {"value": 24, "label": "Bantul"},
                        {"value": 25, "label": "Wonosari"},
                        {"value": 26, "label": "Kulon Progo"},
                    ],
                }]
            }
        }

    @pytest.mark.asyncio
    async def test_update_webform(
            self, app: FastAPI, session: Session, client: AsyncClient) -> None:
        res = await client.put(
            app.url_path_for("webform:update", id=form_definition['id']),
            headers={"Authorization": f"Bearer {account.token}"},
            json=form_definition)
        assert res.status_code == 200
