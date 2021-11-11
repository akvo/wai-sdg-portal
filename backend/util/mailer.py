import os
import mimetypes
from bs4 import BeautifulSoup
import enum
from typing import List, Optional
from models.user import UserRecipient
from mailjet_rest import Client

mjkey = os.environ['MAILJET_APIKEY']
mjsecret = os.environ['MAILJET_SECRET']

mailjet = Client(auth=(mjkey, mjsecret))


def send(data):
    res = mailjet.send.create(data=data)
    res = res.json()
    return res


def html_to_text(html):
    soup = BeautifulSoup(html)
    return soup.get_text("\n")


def format_attachment(file):
    try:
        open(file)
    except (OSError, IOError) as e:
        print(e)
        return None
    return {
        "ContentType": mimetypes.guess_type(file),
        "Filename": file.split("/")[:-1],
        "content": open(file, "rb")
    }


class MailSubject(enum.Enum):
    form_submission = "New Form Submission"
    data_upload = "Data Upload"
    data_validation = "Data Validation"
    data_updates = "Data Updates"
    data_download = "Data Download"
    user_reg_approved = "Your Registration is Approved"
    user_reg_declined = "Your Registration is Declined"
    user_access_changed = "User Access"


class Mail:
    def __init__(self,
                 recipients: List[UserRecipient],
                 subject: MailSubject,
                 html: str,
                 bcc: Optional[List[UserRecipient]] = None,
                 attachment: Optional[str] = None):
        self.subject = subject
        self.recipients = recipients
        self.html = html
        self.bcc = bcc
        self.attachment = attachment

    @property
    def data(self):
        payload = {
            "FromEmail": "noreply@akvo.org",
            "FromName": "Akvo",
            "Subject": self.subject,
            "Html-part": self.html,
            "Text-part": html_to_text(self.html),
            "Recipients": self.recipients,
        }
        if self.bcc:
            payload.update({"Bcc": self.bcc})
        if self.attachment:
            attachment = format_attachment(self.attachment)
            payload.update({"Attachments": [attachment]})
        return payload
