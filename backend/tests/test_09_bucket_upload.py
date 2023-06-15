import pytest
import os
import util.storage as storage
from sqlalchemy.orm import Session
from util.excel import generate_excel_template


class TestStorage:
    @pytest.mark.asyncio
    async def test_upload_file_to_bucket(self, session: Session) -> None:
        if "GOOGLE_APPLICATION_CREDENTIALS" in os.environ:
            excel_file = generate_excel_template(session=session, form=1)
            uploaded_file = storage.upload(excel_file, "test")
            assert storage.check(uploaded_file) is True
        else:
            print("SKIPPING STORAGE UPLOAD TEST")
            assert True is True

    @pytest.mark.asyncio
    async def test_delete_file_from_bucket(self, session: Session) -> None:
        if "GOOGLE_APPLICATION_CREDENTIALS" in os.environ:
            excel_file = generate_excel_template(session=session, form=1)
            uploaded_file = storage.upload(excel_file, "test")
            storage.delete(url=uploaded_file)
            assert storage.check(uploaded_file) is False
        else:
            print("SKIPPING STORAGE DELETE TEST")
            assert True is True
