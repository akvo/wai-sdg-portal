import os
import sys
from main import app
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

client = TestClient(app)


def test_read_main():
    response = client.get("/")
    assert response.json() == "OK"
    assert response.status_code == 200


def test_read_credentials():
    if 'GOOGLE_APPLICATION_CREDENTIALS' in os.environ:
        service_account = os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
        credentials = os.path.exists(service_account)
        assert credentials is True
    else:
        print("SKIPPING READ CREDENTIAL TEST")
        assert True is True
