import json
import os
import time
from datetime import timedelta
from db import crud_form
from db import crud_question_group
from db import crud_question
from db.connection import Base, SessionLocal, engine
from db.truncator import truncate

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()

source_path = os.environ["WEBDOMAIN"].replace("https://", "").split(".")[0]
file_path = f"./source/{source_path}/forms/"

files = os.listdir(file_path)
start_time = time.process_time()

for table in ["form", "question_group", "question", "option"]:
    action = truncate(session=session, table=table)
    print(action)

for file in sorted(files):
    form_name = file.replace(".json", "")
    form_name = form_name.split("-")[1]
    form = crud_form.add_form(session=session, name=form_name.upper())
    question_group = crud_question_group.add_question_group(
        session=session, name="Registration", form=form.id)
    print(f"Form: {form.name}")
    print(f"Question Group: {question_group.name}")
    with open(f'{file_path}{file}') as json_file:
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
                required=q["required"] if "required" in q else True,
                rule=q["rule"] if "rule" in q else None,
                option=q["options"])
            print(f"{i}.{question.name}")
    print("------------------------------------------")

elapsed_time = time.process_time() - start_time
elapsed_time = str(timedelta(seconds=elapsed_time)).split(".")[0]
print(f"\n-- DONE IN {elapsed_time}\n")
