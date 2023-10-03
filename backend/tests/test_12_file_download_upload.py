import sys
import aiofiles
import os
import pytest
import pandas as pd
import json
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session
from db.crud_administration import get_administration_id_by_keyword
from tasks import downloader
from datetime import datetime

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(True)
ftype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


class TestFileRoutes:
    @pytest.mark.asyncio
    async def test_download_excel_template(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("excel-template:get_by_form_id", form_id=1),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        headers = res.headers
        assert headers["content-type"] == ftype
        assert (
            headers["content-disposition"]
            == 'attachment; filename="1-test.xlsx"'
        )

    @pytest.mark.asyncio
    async def test_queue_wrong_excel_data(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        original_filename = "1-test.xlsx"
        excel_file = f"./tmp/{original_filename}"
        wrong_data = [
            [
                "Option 4",
                "23,23",
                "Testing Data 1",
                20,
                "Option A",
                "2020-12-18",
            ],
            [
                "Option 2",
                "24,24",
                "Testing Data 2",
                23,
                "Option B",
                "2020-12-18",
            ],
        ]
        columns = [
            "2|Test Option Question",
            "3|Test Geo Question",
            "4|Test Datapoint Text Question",
            "6|Test Number Question",
            "7|Test Multiple Option Question",
            "8|Test Date Question",
        ]
        df = pd.DataFrame(wrong_data, columns=columns)
        df.to_excel(excel_file, index=False, sheet_name="data")
        fname = excel_file.split("/")[-1]
        async with aiofiles.open(excel_file, "rb") as of:
            contents = await of.read()
        res = await client.post(
            app.url_path_for(
                "excel-template:post", form_id=1, administration=3
            ),
            files={"file": (fname, contents, ftype)},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["attempt"] == 0
        assert res["available"] is None
        assert res["status"] == "pending"
        assert res["type"] == "validate_data"
        assert res["info"] == {
            "original_filename": original_filename,
            "administration": 3,
            "form_id": 1,
        }
        os.remove(excel_file)

    @pytest.mark.asyncio
    async def test_queue_right_excel_data(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        original_filename = "1-test.xlsx"
        excel_file = f"./tmp/{original_filename}"
        right_data = [
            [
                "Option 1",
                "Yogyakarta|Bantul",
                "-6.2,106.81",
                None,
                20,
                "Option A",
                "2020-12-18",
            ],
            [
                "Option 2",
                "Yogyakarta|Bantul",
                "-6.2,106.81",
                None,
                23,
                "Option B",
                "2020-12-18",
            ],
        ]
        columns = [
            "1|Test Option Question",
            "2|Test Administration Question",
            "3|Test Geo Question",
            "4|Test Datapoint Text Question",
            "6|Test Number Question",
            "7|Test Multiple Option Question",
            "8|Test Date Question",
        ]
        df = pd.DataFrame(right_data, columns=columns)
        df.to_excel(excel_file, index=False, sheet_name="data")
        fname = excel_file.split("/")[-1]
        async with aiofiles.open(excel_file, "rb") as of:
            contents = await of.read()
        administration_id = get_administration_id_by_keyword(
            session=session, name="Yogyakarta"
        )
        res = await client.post(
            app.url_path_for(
                "excel-template:post",
                form_id=1,
                administration=administration_id,
            ),
            files={"file": (fname, contents, ftype)},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["attempt"] == 0
        assert res["available"] is None
        assert res["status"] == "pending"
        assert res["type"] == "validate_data"
        assert res["info"] == {
            "original_filename": original_filename,
            "administration": administration_id,
            "form_id": 1,
        }
        os.remove(excel_file)

    @pytest.mark.asyncio
    async def test_download_excel_data(self, session: Session) -> None:
        filename = "download.xlsx"
        jobs = {
            "id": 1,
            "type": "download",
            "status": "pending",
            "payload": filename,
            "info": {
                "tags": [],
                "form_id": 1,
                "options": None,
                "form_name": "test",
                "administration": None,
            },
            "created_by": 1,
            "created": datetime.now().strftime("%B %d, %Y at %I:%M %p"),
        }
        file, context = downloader.download(
            session=session, jobs=jobs, file=f"./tmp/{filename}"
        )
        assert file == f"./tmp/{filename}"
        success = False
        try:
            open(file, "r")
            success = True
        except (OSError, IOError) as e:
            print(e)
        assert success is True
        # check JMP service ladder
        jmp_categories_name = ["water", "sanitation", "hygiene"]
        df = pd.read_excel(file)
        df_columns = [v.lower() for v in list(df)]
        for jn in jmp_categories_name:
            assert jn.lower() not in df_columns
        os.remove(file)

    @pytest.mark.asyncio
    async def test_download_excel_data_with_JMP_service_ladder(
        self, session: Session
    ) -> None:
        # get from JMP config
        try:
            with open("./.category.json", "r") as categories:
                json_config = json.load(categories)
        except Exception:
            json_config = []
        form_id = json_config[0]["form"]
        jmp_categories_name = list(set([jc["name"] for jc in json_config]))
        # start download
        filename = "download.xlsx"
        jobs = {
            "id": 2,
            "type": "download",
            "status": "pending",
            "payload": filename,
            "info": {
                "tags": [],
                "form_id": form_id,
                "options": None,
                "form_name": "test",
                "administration": None,
            },
            "created_by": 1,
            "created": datetime.now().strftime("%B %d, %Y at %I:%M %p"),
        }
        file, context = downloader.download(
            session=session, jobs=jobs, file=f"./tmp/{filename}"
        )
        assert file == f"./tmp/{filename}"
        success = False
        try:
            open(file, "r")
            success = True
        except (OSError, IOError) as e:
            print(e)
        assert success is True
        # check JMP service ladder
        df = pd.read_excel(file)
        df_columns = [v.lower() for v in list(df)]
        for jn in jmp_categories_name:
            assert jn.lower() in df_columns
        os.remove(file)
