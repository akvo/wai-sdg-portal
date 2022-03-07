import sys
import os
import pytest
import pandas as pd
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from db import crud_question
from tests.test_01_auth import Acc
from util.excel import generate_excel_template
from tasks import validation
from tasks.validation import ExcelError
from util.i18n import ValidationText

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
                                   type="number",
                                   rule={
                                       "min": 0,
                                       "max": 100
                                   })
        crud_question.add_question(session=session,
                                   name="Test Multiple Option Question",
                                   question_group=1,
                                   form=1,
                                   meta=False,
                                   type="multiple_option",
                                   required=True,
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
            "1|Test Option Question", "2|Test Administration Question",
            "3|Test Geo Question", "4|Test Datapoint Text Question",
            "5|Test Number Question", "6|Test Multiple Option Question",
            "7|Test Date Question"
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
            "Option 4", "Jawa Barat|Garut", "-6.2,106.81", "Testing Data 1",
            "", "Two", "Option B|Option A", ""
        ], [
            "Option 2", "Jakarta|Garut", "180", "Testing Data 2",
            "", 300, "option a|Option D", "2020"
        ], [
            "Option 2", "Jakarta|Jakarta Barat", "180,A",
            "Testing Data 2", "", -23, "Option B", "2020-12-18"
        ], [
            "Option 2        ", "Jakarta|Jakarta Pusat", "-6.2,106.81",
            "Testing Data 2", "", 23, "    Option B\n", "2020-12-18"
        ], [
            "Option 1", "Jakarta|Jakarta Barat", "-6.2,106.81",
            "Testing Data 2", "", 23, "", "2020-12-18"
        ]]
        columns = [
            "2|Test Option Question", "2|Test Administration Question",
            "3|Test Geo Question", "Test Datapoint Text Question", "",
            "5|Test Number Question", "6|Test Multiple Option Question",
            "7|Test Date Question"
        ]
        # Sheet Name Error
        df = pd.DataFrame(wrong_data, columns=columns)
        df.to_excel(excel_file, index=False, sheet_name='NOT DATA')
        errors = validation.validate(session=session,
                                     form=1,
                                     administration=1,
                                     file=excel_file)
        assert errors == [{
            'error': ExcelError.sheet,
            "error_message":
            "Wrong sheet names or invalid file upload template",
            'sheets': "NOT DATA"
        }]
        # Empty Sheet Error
        df = pd.DataFrame([], columns=columns)
        df.to_excel(excel_file, index=False, sheet_name='data')
        errors = validation.validate(session=session,
                                     form=1,
                                     administration=1,
                                     file=excel_file)
        assert errors == [{
            'error': ExcelError.sheet,
            "error_message": ValidationText.file_empty_validation.value,
        }]
        # Header and Value Error
        df = pd.DataFrame(wrong_data, columns=columns)
        df.to_excel(excel_file, index=False, sheet_name='data')
        errors = validation.validate(session=session,
                                     form=1,
                                     administration=1,
                                     file=excel_file)
        assert errors == [{
            'error': ExcelError.header,
            'error_message': "2|Test Option Question has invalid id",
            'cell': "A1"
        }, {
            'error': ExcelError.header,
            'error_message':
            "Test Datapoint Text Question doesn't have question id",
            'cell': "D1"
        }, {
            'error': ExcelError.header,
            'error_message': "Header name is missing",
            "cell": "E1"
        }, {
            'error': ExcelError.value,
            'error_message': "Wrong administration data for Jakarta",
            "cell": "B2"
        }, {
            'error': ExcelError.value,
            'error_message': "Garut is not part of Jakarta",
            "cell": "B3"
        }, {
            'error': ExcelError.value,
            'error_message': "Invalid lat long format",
            "cell": "C3"
        }, {
            'error': ExcelError.value,
            'error_message': "Invalid lat long format",
            "cell": "C4"
        }, {
            'error': ExcelError.value,
            'error_message': "Value should be numeric",
            "cell": "F2"
        }, {
            'error': ExcelError.value,
            'error_message': "Maximum value for Test Number Question is 100",
            "cell": "F3"
        }, {
            'error': ExcelError.value,
            'error_message': "Minimum value for Test Number Question is 0",
            "cell": "F4"
        }, {
            'error': ExcelError.value,
            'error_message':
            "Invalid case: option a and Invalid value: Option D",
            "cell": "G3"
        }, {
            'error': ExcelError.value,
            'error_message': "Test Multiple Option Question is required",
            "cell": "G6"
        }, {
            'error': ExcelError.value,
            'error_message': "Test Date Question is required",
            "cell": "H2"
        }, {
            'error': ExcelError.value,
            'error_message':
            "Invalid date format: 2020. It should be YYYY-MM-DD",
            "cell": "H3"
        }]
        os.remove(excel_file)
