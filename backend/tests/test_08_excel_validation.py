import sys
import os
import pytest
import pandas as pd
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from db import crud_question
from tests.test_01_auth import Acc
from util.excel import generate_excel_template, validate_excel_data
from util.excel import ExcelError

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(True)


class TestExcelValidation():
    @pytest.mark.asyncio
    async def test_get_excel_template(self, session: Session) -> None:
        crud_question.add_question(session=session,
                                   name="Test Number Question",
                                   question_group=1,
                                   form=1,
                                   meta=False,
                                   type="number")
        crud_question.add_question(session=session,
                                   name="Test Multiple Option Question",
                                   question_group=1,
                                   form=1,
                                   meta=False,
                                   type="multiple_option",
                                   option=[{
                                       "name": "Option A",
                                       "order": 1
                                   }, {
                                       "name": "Option B",
                                       "order": 2
                                   }])
        crud_question.add_question(session=session,
                                   name="Test Date Question",
                                   question_group=1,
                                   form=1,
                                   meta=False,
                                   type="date")
        excel_file = generate_excel_template(session=session, form=1)
        assert excel_file == "./tmp/1-test.xlsx"
        df = pd.read_excel(excel_file)
        assert list(df) == [
            "1|Test Option Question", "3|Test Geo Question",
            "4|Test Datapoint Text Question", "5|Test Number Question",
            "6|Test Multiple Option Question", "7|Test Date Question"
        ]
        os.remove(excel_file)

    @pytest.mark.asyncio
    async def test_download_excel_template(self, app: FastAPI,
                                           session: Session,
                                           client: AsyncClient) -> None:
        res = await client.get(
            app.url_path_for("excel-template:get_by_form_id", form_id=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        head = res.headers
        type = head.get("content-type")
        disposition = head.get("content-disposition")
        assert "spreadsheetml" in type
        assert disposition == 'attachment; filename="1-test.xlsx"'

    @pytest.mark.asyncio
    async def test_validate_excel_file(self, session: Session) -> None:
        excel_file = "./tmp/1-test.xlsx"
        wrong_data = [[
            "Option 4", "180,90", "Testing Data 1", "", "Two",
            "Option B|Option A", ""
            ], [
            "Option 2", "180", "Testing Data 2", "", 23,
            "Option C|Option D", "2020"
            ], [
            "Option 2", "180,A", "Testing Data 2", "", 23,
            "Option B", "2020-12-18"
            ]]
        columns = [
            "2|Test Option Question", "3|Test Geo Question",
            "Test Datapoint Text Question", "", "5|Test Number Question",
            "6|Test Multiple Option Question", "7|Test Date Question"
        ]
        df = pd.DataFrame(wrong_data, columns=columns)
        df.to_excel(excel_file, index=False)
        errors = validate_excel_data(session=session,
                                     form=1,
                                     administration=1,
                                     file=excel_file)
        assert errors == [{
            'error': ExcelError.header,
            'message': "2|Test Option Question has invalid id",
            'column': "A1"
        }, {
            'error': ExcelError.header,
            'message': "Test Datapoint Text Question doesn't have question id",
            'column': "C1"
        }, {
            'error': ExcelError.header,
            'message': "Header name is missing",
            "column": "D1"
        }, {
            'error': ExcelError.value,
            'message': "Invalid lat long format",
            "column": "B3"
        }, {
            'error': ExcelError.value,
            'message': "Invalid lat long format",
            "column": "B4"
        }, {
            'error': ExcelError.value,
            'message': "Value should be numeric",
            "column": "E2"
        }, {
            'error': ExcelError.value,
            'message': "Invalid value: Option C, Option D",
            "column": "F3"
        }, {
            'error': ExcelError.value,
            'message': "Invalid date format: 2020. It should be YYYY-MM-DD",
            "column": "G3"
        }]
        os.remove(excel_file)
