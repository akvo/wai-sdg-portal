import os
import sys
import pytest
import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session
from util.excel import generate_excel_template
from tasks import validation

pytestmark = pytest.mark.asyncio
sys.path.append("..")


class TestStressAndTimeout():
    @pytest.mark.asyncio
    async def test_4000_value_errors(self, session: Session) -> None:
        excel_file = "./tmp/1-test.xlsx"
        excel = generate_excel_template(session=session, form=1)
        df = pd.read_excel(excel)
        random_wrong_rows = []
        random_wrong_values = [
            "Option", "Cianjur", "180,A", "Testing Data 2", 23,
            "Option C|Option D|Option B", "2020"
        ]
        for x in range(1000):
            random_wrong_rows.append(random_wrong_values)
        df = pd.DataFrame(random_wrong_rows, columns=list(df))
        assert df.shape[0] == 1000
        df.to_excel(excel_file, index=False, sheet_name='data')
        start = datetime.now()
        errors = validation.validate(
            session=session, form=1, administration=1, file=excel_file)
        done = datetime.now()
        elapsed = done - start
        assert len(errors) == 5000
        assert elapsed.seconds < 1.5
        os.remove(excel_file)
