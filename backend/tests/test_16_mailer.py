import sys
import pytest
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session
from db.crud_user import get_user_by_email
from util.mailer import Email, MailTypeEnum

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(True)


class TestMailer:
    @pytest.mark.asyncio
    async def test_email_recipient(self, session: Session) -> None:
        user = get_user_by_email(session=session, email=account.data["email"])
        user = user.recipient
        assert user == {"Email": "support@akvo.org", "Name": "Akvo Support"}

    @pytest.mark.asyncio
    async def test_email_data(self, session: Session) -> None:
        user = get_user_by_email(session=session, email=account.data["email"])
        email = Email(
            recipients=[user.recipient],
            type=MailTypeEnum.data_validation_success,
        )
        data = email.data
        assert data["Recipients"] == [
            {"Email": "support@akvo.org", "Name": "Akvo Support"}
        ]
        assert data["FromEmail"] == "noreply@akvo.org"
        assert data["Subject"] == "Data Validation"
        assert email.send is True
