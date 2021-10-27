import pytest
import os
import requests as r
import util.storage as storage
from sqlalchemy.orm import Session
from util.excel import generate_excel_template


class TestStorage():
    @pytest.mark.asyncio
    async def test_upload_template_file(self, session: Session) -> None:
        if 'GOOGLE_APPLICATION_CREDENTIALS' in os.environ:
            excel_file = generate_excel_template(session=session, form=1)
            uploaded_file = storage.upload(excel_file, "test", "testing.xls")
            assert uploaded_file.split("/")[-1] == "testing.xls"
            assert uploaded_file.split("/")[-2] == "test"
            res = r.get(uploaded_file)
            assert res.status_code == 200
            os.remove(excel_file)
        else:
            print("SKIPPING STORAGE UPLOAD TEST")
            assert True is True
