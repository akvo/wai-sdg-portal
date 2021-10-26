import sys
import os
import pytest
import pandas as pd
from datetime import datetime
from fastapi import FastAPI
from sqlalchemy.orm import Session
from db import crud_question
from util.excel import generate_excel_template

pytestmark = pytest.mark.asyncio
sys.path.append("..")


class TestTemplateGenerator():
    @pytest.mark.asyncio
    async def test_add_more_question(self, app: FastAPI,
                                     session: Session) -> None:
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
        excel_file = generate_excel_template(session=session, form=1, adm=10)
        t = datetime.today().strftime("%y%m%d")
        assert excel_file == f"./tmp/1_10_{t}-test_arsi_negele_shala_bila.xls"
        df = pd.read_excel(excel_file)
        assert list(df) == [
            "1|Test Option Question", "2|Test Administration Question",
            "3|Test Geo Question", "4|Test Datapoint Text Question",
            "5|Test Number Question", "6|Test Multiple Option Question"
        ]
        os.remove(excel_file)
