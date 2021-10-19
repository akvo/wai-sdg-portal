import json
import os
import sys
from db import crud_form
from db import crud_question_group
from db import crud_question
from db.connection import Base, SessionLocal, engine
from db.truncator import truncate

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()
path = './source/'
file_prefix = "form_eth"

files = os.listdir(path)
files = list(filter(lambda x: file_prefix in x, files))

for table in ["form", "question_group", "question", "option"]:
    action = truncate(session=session, table=table)
    print(action)

for file in sorted(files):
    form_name = file
    for s in [file_prefix, "_", ".json"]:
        form_name = form_name.replace(s, "")
    form_name = form_name.split("-")[1]
    form = crud_form.add_form(session=session, name=form_name.upper())
    question_group = crud_question_group.add_question_group(
        session=session, name="Registration", form=form.id)
    print(f"Form: {form.name}")
    print(f"Question Group: {question_group.name}")
    with open(f'{path}{file}') as json_file:
        json_form = json.load(json_file)
        for i, q in enumerate(json_form):
            question = crud_question.add_question(
                session=session,
                name=q["question"],
                form=form.id,
                question_group=question_group.id,
                type=q["type"],
                meta=q["meta"],
                order=q["order"],
                option=q["options"])
            print(f"{i}.{question.name}")
    print("------------------------------------------")
