import os
import sys
import pytest
from mailjet_rest import Client as MailClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session
from db.crud_user import get_user_by_email
from util.mailer import Email, MailSubject

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(True)

html_example = """
    <html>
      <head style="-webkit-text-size-adjust: 100%">
        <meta charset="utf-8" style="-webkit-text-size-adjust: 100%"/>
        <link
          href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700"
          rel="stylesheet"
          style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%"
        />
        </head>
    <style>
        html, body {
            width: 100%;
        }
    </style>
        <body>
            <table>
                <tbody>
                    <tr style="color:rgb(0,0,0);text-align:right;">
                        <td colspan=4>Hello!</td>
                    </tr>
                    <tr>
                        <td colspan=4>Welcome to Garut</td>
                    </tr>
                    <tr>
                        <td><a href="https://akvo.org">Link A</a></td>
                        <td><a href="https://akvo.org">Link B</a></td>
                    </tr>
                </tbody>
            </table>
        </body>
    </html>
"""


class TestMailer():
    @pytest.mark.asyncio
    async def test_email_recipient(self, session: Session) -> None:
        user = get_user_by_email(session=session, email=account.data["email"])
        user = user.recipient
        assert user == {"Email": "support@akvo.org", "Name": "Akvo Support"}

    @pytest.mark.asyncio
    async def test_email_data(self, session: Session) -> None:
        user = get_user_by_email(session=session, email=account.data["email"])
        email = Email(recipients=[user.recipient],
                      subject=MailSubject.data_download,
                      html=html_example)
        assert email.data == {
            "FromEmail": "noreply@akvo.org",
            "Recipients": [{
                "Email": "support@akvo.org",
                "Name": "Akvo Support"
            }],
            "Subject": "Data Download",
            "FromEmail": "noreply@akvo.org",
            "Text-part":
            "\n\n\n\nHello!\n\n\nWelcome to Garut\n\n\nLink A\nLink B\n\n\n\n",
            "Html-part": html_example,
        }
        assert email.send is True
