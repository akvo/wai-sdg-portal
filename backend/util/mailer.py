import os
from bs4 import BeautifulSoup
import enum
from typing import List, Optional
from models.user import UserRecipient
from mailjet_rest import Client
from jinja2 import Environment, FileSystemLoader
import base64

mjkey = os.environ['MAILJET_APIKEY']
mjsecret = os.environ['MAILJET_SECRET']
webdomain = os.environ["WEBDOMAIN"]
image_url = f"{webdomain}/email-icons"
instance_name = os.environ["INSTANCE_NAME"]

mailjet = Client(auth=(mjkey, mjsecret))
loader = FileSystemLoader('.')
env = Environment(loader=loader)
html_template = env.get_template("./templates/main.html")
ftype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
ftype += ';base64'


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
        open(file, "r")
    except (OSError, IOError) as e:
        print(e)
        return None
    return {
        "ContentType": ftype,
        "Filename": file.split("/")[2],
        "content": base64.b64encode(open(file, "rb").read()).decode('UTF-8')
    }


class MailTypeEnum(enum.Enum):
    data_validation_success = "data_validation_success"
    data_validation_failed = "data_validation_failed"
    data_submission_success = "data_submission_success"
    data_submission_failed = "data_submission_failed"  # Seeder issue
    data_updates = "data_updates"
    data_download_success = "data_download_success"
    data_download_failed = "data_download_failed"
    user_reg_new = "user_reg_new"
    user_reg_approved = "user_reg_approved"
    user_acc_changed = "user_acc_changed"


class MailType(enum.Enum):
    data_validation_success = {
        "title": "Data Validation Success",
        "subject": "Data Validation",
        "body": "filename",
        "message": '''
                    <div style="color: #11A840;">
                        Data Validation have passed successfully!
                    </div>
                    ''',
        "image": f"{image_url}/check-circle.png"
    }
    data_validation_failed = {
        "title": "Data Validation Failed",
        "subject": "Data Validation",
        "body": "filename",
        "message": '''
                    <div style="color: #9F0031;">
                        There were some errors during the data processing.
                    </div>
                    ''',
        "image": f"{image_url}/exclamation-circle.png"
    }
    data_submission_success = {
        "title": "Data Upload Completed",
        "subject": "Data Upload",
        "body": "filename",
        "message": '''
                    <div style="color: #11A840;">
                        Data have uploaded successfully!
                    </div>
                    ''',
        "image": f"{image_url}/check-circle.png"
    }
    data_submission_failed = {
        "title": "Data Upload Failed",
        "subject": "Data Upload",
        "body": "filename",
        "message": '''
                    <div style="color: #9F0031;">
                        There were some errors during the data processing.
                    </div>
                    ''',
        "image": f"{image_url}/exclamation-circle.png"
    }
    data_updates = {
        "title": "Data Updated",
        "subject": "Data Updates",
        "body": None,
        "message": None,
        "image": f"{image_url}/check-circle.png"
    }
    data_download_success = {
        "title": "Data Download Completed",
        "subject": "Data Download",
        "body": "Your data are ready to download.",
        "message": None,
        "image": f"{image_url}/file-excel-green.png"
    }
    data_download_failed = {
        "title": "Data Download Failed",
        "subject": "Data Download",
        "body": None,
        "message": '''
                    <div style="color: #9F0031;">
                        There were some errors during the data processing.
                    </div>
                    ''',
        "image": f"{image_url}/file-excel-red.png"
    }
    user_reg_new = {
        "title": "New Account Registration",
        "subject": "Registration",
        "body": "User waiting for approval",
        "message": None,
        "image": f"{image_url}/user.png"
    }
    user_reg_approved = {
        "title": "Approved",
        "subject": "Registration",
        "body": '''
                Congratulations!! You are now a verified user, with great
                power comes great responsibility.
                ''',
        "message": None,
        "image": f"{image_url}/check-circle.png"
    }
    user_acc_changed = {
        "title": "Access Changed",
        "subject": "User Access",
        "body": "Your access have been updated.",
        "message": None,
        "image": f"{image_url}/user-switch.png"
    }


class Email:
    def __init__(self,
                 recipients: List[UserRecipient],
                 type: MailTypeEnum,
                 bcc: Optional[List[UserRecipient]] = None,
                 attachment: Optional[str] = None,
                 context: Optional[str] = None,
                 body: Optional[str] = None):
        self.type = MailType[type.value]
        self.recipients = recipients
        self.bcc = bcc
        self.attachment = attachment
        self.context = context
        self.body = body

    @property
    def data(self):
        type = self.type.value
        body = type["body"]
        if self.body:
            body = self.body
        # instance name based on env
        instance = instance_name.split("-")
        instance = [a.title() for a in instance]
        instance[0] = instance[0].upper()
        instance = " ".join(instance)
        html = html_template.render(logo=f"{webdomain}/wai-logo.png",
                                    instance_name=instance,
                                    title=type["title"],
                                    body=body,
                                    image=type["image"],
                                    message=type["message"],
                                    context=self.context)
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
