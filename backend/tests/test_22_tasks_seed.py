import sys
import os
import pytest
import pandas as pd
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session
from tasks.seed import seed
from db.crud_user import get_user_by_email
from models.answer import Answer

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(True)
ftype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


class TestUnitTasksSeed:
    @pytest.mark.asyncio
    async def test_seed_data_from_excel(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        form_id = 1
        user = get_user_by_email(
            session=session, email=account.data.get("email"))
        original_filename = f"{form_id}-unit-test.xlsx"
        excel_file = f"./tmp/{original_filename}"
        right_data = [
            [
                "Option 2",
                "Yogyakarta|Bantul",
                "-6.2,106.81",
                "Jane",
                100,
                "Option B|Option A",
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
        seed(session=session, file=excel_file, user=user.id, form=form_id)
        # assert expected value
        expected_values = {
            1: "Option 2",
            2: 24.0,
            3: "-6.2|106.81",
            4: "Jane",
            6: 100.0,
            7: ["Option B", "Option A"],
            8: "2020-12-18"
        }
        for key, value in expected_values.items():
            answer = session.query(Answer).filter(
                Answer.question == key).order_by(
                    Answer.id.desc()).first()
            answer = answer.only_value
            assert answer == value
        os.remove(excel_file)
