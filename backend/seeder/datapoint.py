import os
import sys
import pandas as pd
from datetime import datetime
from openpyxl import load_workbook
from db import crud_administration
from db import crud_form
from db import crud_question
from db import crud_user
from db import crud_data
from models.question import QuestionType
from models.answer import Answer
from models.user import UserRole
from db.connection import Base, SessionLocal, engine

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()
source = './source/data-input.xlsx'
sheet_prefix = 'Eth'
all_sheets = load_workbook(source, read_only=True).sheetnames
sheets = list(filter(lambda x: sheet_prefix in x, all_sheets))
administration_level = ['Woreda', 'Kebele']
lat_long = ["Latitude", "Longitude"]

corrections = {
    "Jigessa Korke": "Jegesa Korke",
    "Kersa Maja": "Kersa Meja",
    "Bute Filicha": "Bute Felicha"
}

if len(sys.argv) < 2:
    print("You should provide admin address")
    sys.exit()

user = crud_user.get_user_by_email(session=session, email=sys.argv[1])
if not user:
    print("{} user is not available")
    sys.exit()

if user.role != UserRole.admin:
    print("{} user is not admin")
    sys.exit()


def get_location(x):
    parent_name = x[administration_level[0]]
    child_name = x[administration_level[1]]
    if child_name in list(corrections):
        child_name = corrections[child_name]
    parent = crud_administration.get_administration_by_name(session=session,
                                                            name=parent_name)
    message = ""
    if not parent:
        message = "{} Not Found".format(parent_name)
        for pname in parent_name.split(" "):
            parent = crud_administration.get_administration_by_keyword(
                session=session, name=pname)
            if parent and not message:
                message = "{} Not Found, perhaps {} ?".format(
                    parent_name, " / ".join([p.name for p in parent]))
        raise ValueError(message)
    children = crud_administration.get_administration_by_name(session=session,
                                                              name=child_name,
                                                              parent=parent.id)
    if children:
        return children.id
    message = ""
    for cname in child_name.split(" "):
        children = crud_administration.get_administration_by_keyword(
            session=session, name=cname, parent=parent.id)
        if children and not len(message):
            message = "{} Not Found, perhaps {} ?".format(
                child_name, " / ".join([c.name for c in children]))
    if not len(message):
        message = "{} Not Found".format(child_name)
    raise ValueError(message)


def record(answers, form, user):
    administration = None
    geo = None
    answerlist = []
    names = []
    for a in answers:
        # Only get all non np.NaN value
        if answers[a] == answers[a]:
            q = crud_question.get_question_by_name(session=session,
                                                   name=a,
                                                   form=form.id)
            answer = Answer(question=q.id,
                            created_by=user.id,
                            created=datetime.now())
            if q.type == QuestionType.administration:
                administration = answers[a]
                answer.value = answers[a]
                if q.meta:
                    adm_name = crud_administration.get_administration_by_id(
                        session, id=administration)
                    names.append(adm_name.name)
            if q.type == QuestionType.geo:
                geo = answers[a]
                answer.text = ("{}|{}").format(answers[a][0], answers[a][1])
            if q.type == QuestionType.text:
                answer.text = answers[a]
                if q.meta:
                    names.append(answers[a])
            if q.type == QuestionType.number:
                answer.value = answers[a]
                if q.meta:
                    names.append(str(answers[a]))
            if q.type == QuestionType.option:
                answer.options = [answers[a]]
            if q.type == QuestionType.multiple_option:
                answer.options = answers[a]
            answerlist.append(answer)
    name = " - ".join([str(n) for n in names])
    data = crud_data.add_data(session=session,
                              form=form.id,
                              name=name,
                              geo=geo,
                              administration=administration,
                              created_by=user.id,
                              answers=answerlist)
    return data


# TODO: Add forloop
sheet = sheets[0]
data = pd.read_excel(source, sheet)
data.drop(data.filter(regex="Unnamed"), axis=1, inplace=True)
data['location'] = data.apply(lambda x: get_location(x), axis=1)
for adm in administration_level:
    data.drop(data.filter(regex=adm), axis=1, inplace=True)
geo = False
for g in lat_long:
    if g not in list(data):
        geo = False
if geo:
    data['geolocation'] = data.apply(lambda x: [x["Latitude"], x["Longitude"]],
                                     axis=1)
    for g in lat_long:
        data.drop(data.filter(regex=g), axis=1, inplace=True)

form_name = sheet.replace(sheet_prefix, '').strip().upper()
form = crud_form.get_form_by_name(session=session, name=form_name)
data = data.to_dict("records")
for d in data:
    rec = record(d, form, user)
