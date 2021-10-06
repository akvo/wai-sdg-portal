import json
import os
from db import crud_form
from db import crud_question_group
from db import crud_question
from db.connection import Base, SessionLocal, engine

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()
path = './source/'
file_prefix = "form_eth"

files = os.listdir(path)
files = list(filter(lambda x: file_prefix in x, files))

for file in files:
    form_name = file
    for s in [file_prefix, "_", ".json"]:
        form_name = form_name.replace(s, "")
    form = crud_form.add_form(session=session, name=form_name.upper())
    question_group = crud_question_group.add_question_group(session=session,
                                                            name="Base Data",
                                                            form=form.id)
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
