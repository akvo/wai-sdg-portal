import os
import mimetypes
from bs4 import BeautifulSoup
import enum
from typing import List, Optional
from models.user import UserRecipient
from mailjet_rest import Client
from jinja2 import Environment, FileSystemLoader

mjkey = os.environ['MAILJET_APIKEY']
mjsecret = os.environ['MAILJET_SECRET']
webdomain = os.environ["WEBDOMAIN"]

mailjet = Client(auth=(mjkey, mjsecret))
loader = FileSystemLoader('.')
env = Environment(loader=loader)
html_template = env.get_template("./templates/main.html")


def send(data):
    res = mailjet.send.create(data=data)
    res = res.json()
    return res


def generate_icon(icon: str, color: Optional[str] = None):
    svg_path = f"./templates/icons/{icon}.svg"
    try:
        open(svg_path)
    except (OSError, IOError):
        return None
    soup = BeautifulSoup(open(svg_path, "r"), "lxml")
    if color:
        for spath in soup.findAll("path"):
            spath['style'] = f"fill: {color};"
    return soup


def html_to_text(html):
    soup = BeautifulSoup(html, "lxml")
    body = soup.find('body')
    return "".join(body.get_text())


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


class MailTypeEnum(enum.Enum):
    # data_upload = "Data Upload"
    data_validation_success = "data_validation_success"


class MailType(enum.Enum):
    # data_upload = "Data Upload"
    data_validation_success = {
        "title": "Data Validation Success",
        "subject": "Data Validation",
        "body": "Testing Body of Html",
        "message": "Extra message",
        "image": None
    }
    # data_validation_failed = "Data Validation"
    # data_submission_success = "Data Upload Completed"
    # data_submission_failed = "Data Upload Failed"  # Seeder issue
    # data_updates = "Data Updates"
    # data_download = "Data Download"
    # user_reg_new = "New Account Registration"
    # user_reg_approved = "Your Registration is Approved"
    # user_acc_changed = "User Access"


class Email:
    def __init__(self,
                 recipients: List[UserRecipient],
                 type: MailTypeEnum,
                 bcc: Optional[List[UserRecipient]] = None,
                 attachment: Optional[str] = None):
        self.type = MailType[type.value]
        self.recipients = recipients
        self.bcc = bcc
        self.attachment = attachment

    @property
    def data(self):
        type = self.type.value
        html = html_template.render(logo=f"{webdomain}/wai-logo.png",
                                         title=type["title"],
                                         body=type["body"],
                                         image=type["image"],
                                         message=type["message"])
        payload = {
            "FromEmail": "noreply@akvo.org",
            "Subject": type["subject"],
            "Html-part": html,
            "Text-part": html_to_text(html),
            "Recipients": self.recipients,
        }
        if self.bcc:
            payload.update({"Bcc": self.bcc})
        if self.attachment:
            attachment = format_attachment(self.attachment)
            payload.update({"Attachments": [attachment]})
        return payload

    @property
    def send(self) -> int:
        TESTING = os.environ.get("TESTING")
        if TESTING:
            return True
        res = mailjet.send.create(data=self.data)
        return res.status_code == 200
