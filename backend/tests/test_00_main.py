import os
import sys
from main import app
from util.helper import HText, UUID
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

client = TestClient(app)


def test_read_main():
    response = client.get("/")
    assert response.json() == "OK"
    assert response.status_code == 200


def test_read_credentials():
    if "GOOGLE_APPLICATION_CREDENTIALS" in os.environ:
        service_account = os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
        credentials = os.path.exists(service_account)
        assert credentials is True
    else:
        print("SKIPPING READ CREDENTIAL TEST")
        assert True is True


def test_string_trim_helper():
    string_list = ["Option    1", "Option 1 ", "Option  1", " Option 1 ", "Option 1\n "]
    for st in string_list:
        assert HText(st).clean == "Option 1"


def test_check_number_helper():
    string_list = [
        {"text": "mantap", "has_number": False},
        {"text": "mantap123", "has_number": True},
        {"text": "1|mantap", "has_number": True},
    ]
    for st in string_list:
        assert HText(st["text"]).hasnum == st["has_number"]
    metadata_columns = list(filter(lambda x: not HText(x["text"]).hasnum, string_list))
    assert metadata_columns == [{"text": "mantap", "has_number": False}]
    question_columns = list(filter(lambda x: HText(x["text"]).hasnum, string_list))
    assert question_columns == [
        {"text": "mantap123", "has_number": True},
        {"text": "1|mantap", "has_number": True},
    ]


def test_uuid_helper():
    uuid = UUID("testing")
    assert uuid.str == f"testing-{uuid.uuid}"
