import sys
import aiofiles
import os
import pytest
import pandas as pd
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(True)
ftype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'


class TestFileRoutes():
    @pytest.mark.asyncio
    async def test_download_excel_template(self, app: FastAPI,
                                           session: Session,
                                           client: AsyncClient) -> None:
        res = await client.get(
            app.url_path_for("excel-template:get_by_form_id", form_id=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        headers = res.headers
        assert headers["content-type"] == ftype
        assert headers[
            "content-disposition"] == 'attachment; filename="1-test.xlsx"'

    @pytest.mark.asyncio
    async def test_queue_wrong_excel_data(self, app: FastAPI, session: Session,
                                          client: AsyncClient) -> None:
        excel_file = "./tmp/1-test.xlsx"
        wrong_data = [[
            "Option 4", "23,23", "Testing Data 1", 20, "Option A", "2020-12-18"
        ], [
            "Option 2", "24,24", "Testing Data 2", 23, "Option B", "2020-12-18"
        ]]
        columns = [
            "2|Test Option Question", "3|Test Geo Question",
            "4|Test Datapoint Text Question", "5|Test Number Question",
            "6|Test Multiple Option Question", "7|Test Date Question"
        ]
        df = pd.DataFrame(wrong_data, columns=columns)
        df.to_excel(excel_file, index=False, sheet_name='data')
        fname = excel_file.split("/")[-1]
        async with aiofiles.open(excel_file, 'rb') as of:
            contents = await of.read()
        res = await client.post(
            app.url_path_for("excel-template:post",
                             form_id=1,
                             administration=4),
            files={"file": (fname, contents, ftype)},
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res["attempt"] == 0
        assert res["available"] is None
        assert res["status"] == "pending"
        assert res["type"] == "validate_data"
        assert res["info"] == {"administration": 4, "form_id": 1}
        os.remove(excel_file)

    @pytest.mark.asyncio
    async def test_queue_right_excel_data(self, app: FastAPI, session: Session,
                                          client: AsyncClient) -> None:
        excel_file = "./tmp/1-test.xlsx"
        right_data = [[
            "Option 1", "Shashemene|Kuyera Town", "-6.2,106.81",
            "Testing Data 1", 20, "Option A", "2020-12-18"
        ], [
            "Option 2", "Shashemene|Kuyera Town", "-6.2,106.81",
            "Testing Data 2", 23, "Option B", "2020-12-18"
        ]]
        columns = [
            "1|Test Option Question", "2|Test Administration Question",
            "3|Test Geo Question", "4|Test Datapoint Text Question",
            "5|Test Number Question", "6|Test Multiple Option Question",
            "7|Test Date Question"
        ]
        df = pd.DataFrame(right_data, columns=columns)
        df.to_excel(excel_file, index=False, sheet_name='data')
        fname = excel_file.split("/")[-1]
        async with aiofiles.open(excel_file, 'rb') as of:
            contents = await of.read()
        res = await client.post(
            app.url_path_for("excel-template:post",
                             form_id=1,
                             administration=5),
            files={"file": (fname, contents, ftype)},
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res["attempt"] == 0
        assert res["available"] is None
        assert res["status"] == "pending"
        assert res["type"] == "validate_data"
        assert res["info"] == {"administration": 5, "form_id": 1}
        os.remove(excel_file)
