import os
import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session
from util.helper import Cipher

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(True)

cascade = {
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


class TestWebformEditorRoutes():
    @pytest.mark.asyncio
    async def test_add_webform(
            self, app: FastAPI, session: Session, client: AsyncClient) -> None:
        form_definition = {
            "id": 903430001,
            "name": "Test Form",
            "version": 1.0,
            "description": "This is a test form definition for webform editor",
            "defaultLanguage": "en",
            "languages": ["en", "id"],
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
                    "required": True,
                    "hint": {
                        "id": 1,
                        "endpoint": "/api/hint/1667456499056",
                        "path": ["max"]
                    },
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
                    "order": 2,
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
                }, {
                    "id": 903430562,
                    "order": 3,
                    "questionGroupId": 903430546,
                    "name": "Favorite food",
                    "type": "option",
                    "required": False,
                    "option": [{
                        "code": None,
                        "name": "Rendang",
                        "order": 1,
                        "id": 904875914
                    }, {
                        "code": None,
                        "name": "Chicken Pop",
                        "order": 2,
                        "id": 904875915
                    }]
                }]
            }, {
                "id": 903430547,
                "name": "Group 3",
                "order": 3,
                "repeatable": False,
                "question": [{
                    "id": 903430570,
                    "order": 1,
                    "questionGroupId": 903430547,
                    "name": "Comment",
                    "type": "text",
                    "required": False,
                }]
            }]
        }
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
            "version": 1.0,
            "description": "This is a test form definition for webform editor",
            "defaultLanguage": "en",
            "languages": ["en", "id"],
            "translations": None,
            'passcode': None,
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
                    "hint": {
                        "id": 1,
                        "endpoint": "/api/hint/1667456499056",
                        "path": ["max"]
                    },
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
                    "order": 2,
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
                }, {
                    "id": 903430562,
                    "form": 903430001,
                    "question_group": 903430546,
                    "name": "Favorite food",
                    "order": 3,
                    "meta": False,
                    "type": "option",
                    "required": False,
                    "rule": None,
                    "dependency": None,
                    "tooltip": None,
                    "translations": None,
                    "api": None,
                    "option": [{
                        "translations": None,
                        "score": None,
                        "order": 1,
                        "name": "Rendang",
                        "id": 904875914,
                        "code": None,
                        "color": None,
                        "question": 903430562,
                    }, {
                        "translations": None,
                        "score": None,
                        "order": 2,
                        "name": "Chicken Pop",
                        "id": 904875915,
                        "code": None,
                        "color": None,
                        "question": 903430562,
                    }],
                }]
            }, {
                "id": 903430547,
                "form": 903430001,
                "name": "Group 3",
                "order": 3,
                "description": None,
                "repeatable": False,
                "translations": None,
                "repeatText": None,
                "question": [{
                    "id": 903430570,
                    "form": 903430001,
                    "question_group": 903430547,
                    "name": "Comment",
                    "order": 1,
                    "meta": False,
                    "type": "text",
                    "required": False,
                    "rule": None,
                    "dependency": None,
                    "tooltip": None,
                    "translations": None,
                    "api": None,
                    "option": [],
                }]
            }],
            "cascade": cascade
        }

    @pytest.mark.asyncio
    async def test_update_webform(
            self, app: FastAPI, session: Session, client: AsyncClient) -> None:
        form_definition = {
            "id": 903430001,
            "name": "Test Form Updated",
            "description": "This is a test form definition for webform editor",
            "defaultLanguage": "en",
            "languages": ["en", "id"],
            "translations": [{
                "language": "id",
                "name": "Pembaharuan Formulir Uji Coba",
                "description": "Ini adalah formulir uji coba untuk webform"
            }],
            "question_group": [{
                "id": 903430556,
                "name": "Registration",
                "description": "This is registration section",
                "order": 1,
                "repeatable": False,
                "translations": [{
                    "language": "id",
                    "name": "Pendaftaran",
                    "description": "Ini adalah bagian registrasi"
                }],
                "question": [{
                    "id": 903430547,
                    "order": 1,
                    "questionGroupId": 903430556,
                    "name": "Name",
                    "type": "text",
                    "required": True,
                    "translations": [{
                        "language": "id",
                        "name": "Nama"
                    }]
                }, {
                    "id": 903430557,
                    "order": 2,
                    "questionGroupId": 903430556,
                    "name": "Gender",
                    "type": "option",
                    "required": True,
                    "allowOther": True,
                    "allowOtherText": "Other gender",
                    "translations": [{
                        "language": "id",
                        "name": "Jenis Kelamin",
                        "allowOtherText": "Lainnya"
                    }],
                    "option": [{
                        "code": "M",
                        "name": "Male",
                        "order": 1,
                        "id": 904875904,
                        "translations": [{
                            "language": "id",
                            "name": "Laki-laki"
                        }]
                    }, {
                        "code": "F",
                        "name": "Female",
                        "order": 2,
                        "id": 904875905,
                        "translations": [{
                            "language": "id",
                            "name": "Perempuan"
                        }]
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
                    "id": 903430561,
                    "order": 1,
                    "questionGroupId": 903430546,
                    "name": "Describe about yourself",
                    "type": "text",
                    "required": True
                }, {
                    "id": 903430562,
                    "order": 2,
                    "questionGroupId": 903430546,
                    "name": "Describe your favorite food",
                    "type": "text",
                    "required": False
                }]
            }, {
                "id": 903430548,
                "name": "Group 4",
                "order": 3,
                "repeatable": False,
                "question": [{
                    "id": 903430580,
                    "order": 1,
                    "questionGroupId": 903430548,
                    "name": "Sort comment",
                    "type": "text",
                    "required": False,
                    "hint": {
                        "id": 1,
                        "endpoint": "/api/hint/1667456499056",
                        "path": ["count"]
                    },
                }]
            }]
        }
        res = await client.put(
            app.url_path_for("webform:update", id=form_definition['id']),
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
            "name": "Test Form Updated",
            "version": 2.0,
            "description": "This is a test form definition for webform editor",
            "defaultLanguage": "en",
            "languages": ["en", "id"],
            "translations": [{
                "language": "id",
                "name": "Pembaharuan Formulir Uji Coba",
                "description": "Ini adalah formulir uji coba untuk webform"
            }],
            'passcode': None,
            "question_group": [{
                "id": 903430556,
                "form": 903430001,
                "name": "Registration",
                "order": 1,
                "description": "This is registration section",
                "repeatable": False,
                "translations": [{
                    "language": "id",
                    "name": "Pendaftaran",
                    "description": "Ini adalah bagian registrasi"
                }],
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
                    "translations": [{
                        "language": "id",
                        "name": "Nama"
                    }],
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
                    "translations": [{
                        "language": "id",
                        "name": "Jenis Kelamin",
                        "allowOtherText": "Lainnya"
                    }],
                    "api": None,
                    "allowOther": True,
                    "allowOtherText": "Other gender",
                    "option": [{
                        "translations": [{
                            "language": "id",
                            "name": "Laki-laki"
                        }],
                        "score": None,
                        "order": 1,
                        "name": "Male",
                        "id": 904875904,
                        "code": "M",
                        "color": None,
                        "question": 903430557,
                    }, {
                        "translations": [{
                            "language": "id",
                            "name": "Perempuan"
                        }],
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
                    "id": 903430561,
                    "form": 903430001,
                    "question_group": 903430546,
                    "name": "Describe about yourself",
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
                    "id": 903430562,
                    "form": 903430001,
                    "question_group": 903430546,
                    "name": "Describe your favorite food",
                    "order": 2,
                    "meta": False,
                    "type": "text",
                    "required": False,
                    "rule": None,
                    "dependency": None,
                    "tooltip": None,
                    "translations": None,
                    "api": None,
                    "option": [],
                }]
            }, {
                "id": 903430548,
                "form": 903430001,
                "name": "Group 4",
                "order": 3,
                "description": None,
                "repeatable": False,
                "translations": None,
                "repeatText": None,
                "question": [{
                    "id": 903430580,
                    "form": 903430001,
                    "question_group": 903430548,
                    "name": "Sort comment",
                    "order": 1,
                    "meta": False,
                    "type": "text",
                    "required": False,
                    "rule": None,
                    "dependency": None,
                    "tooltip": None,
                    "translations": None,
                    "api": None,
                    "option": [],
                    "hint": {
                        "id": 1,
                        "endpoint": "/api/hint/1667456499056",
                        "path": ["count"]
                    }
                }]
            }],
            "cascade": cascade
        }

    async def test_get_all_form(self, app: FastAPI, session: Session,
                                client: AsyncClient) -> None:
        webdomain = os.environ.get('WEBDOMAIN')
        instance_name = os.environ.get('INSTANCE_NAME').replace("-", "_")
        res = await client.get(app.url_path_for("form:get_all"))
        assert res.status_code == 200
        res = res.json()
        url1 = Cipher(f"{instance_name}-1").encode()
        url2 = Cipher(f"{instance_name}-903430001").encode()
        assert res == [{
            "id": 1,
            "name": "test",
            "disableDelete": False,
            "version": 1.0,
            "description": "test description",
            "default_language": "en",
            "languages": ["en", "id"],
            "translations": [{
                "name": "uji coba",
                "language": "id",
                "description": "deskripsi uji coba"
            }],
            "url": f"https://{webdomain}/webform/{url1}",
            "passcode": None,
        }, {
            "id": 903430001,
            "name": "Test Form Updated",
            "disableDelete": False,
            "version": 2.0,
            "description": "This is a test form definition for webform editor",
            "default_language": "en",
            "languages": ["en", "id"],
            "translations": [{
                "name": "Pembaharuan Formulir Uji Coba",
                "language": "id",
                "description": "Ini adalah formulir uji coba untuk webform",
            }],
            "url": f"https://{webdomain}/webform/{url2}",
            "passcode": None,
        }]
