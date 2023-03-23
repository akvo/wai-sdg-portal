import json
import os
import time
import sys
from datetime import timedelta
from db import crud_form
from db import crud_question_group
from db import crud_question
from db.connection import Base, SessionLocal, engine
from db.truncator import truncate

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()

source_path = os.environ["INSTANCE_NAME"]
SANDBOX_DATA_SOURCE = os.environ.get("SANDBOX_DATA_SOURCE")
if SANDBOX_DATA_SOURCE:
    source_path = SANDBOX_DATA_SOURCE
file_path = f"./source/{source_path}/forms/"

files = list(filter(lambda x: ".bak" not in x, os.listdir(file_path)))
start_time = time.process_time()

# check if form init or updater
updater = False
if len(sys.argv) == 2 and sys.argv[1] == "update":
    updater = True

for table in ["form", "question_group", "question", "option"]:
    if not updater:
        # truncate only for init form seeder
        action = truncate(session=session, table=table)
        print(action)

for file in sorted(files):
    with open(f'{file_path}{file}') as json_file:
        json_form = json.load(json_file)
    # check form exist
    find_form = crud_form.get_form_by_id(
        session=session, id=json_form["id"])
    # updater
    if updater and find_form:
        form = crud_form.update_form(
            session=session,
            id=json_form["id"],
            name=json_form["form"],
            version=find_form.version + 1,
            description=json_form.get('description'),
            default_language=json_form.get('defaultLanguage'),
            languages=json_form.get('languages'),
            translations=json_form.get('translations'))
    # init
    if not updater and not find_form:
        form = crud_form.add_form(
            session=session,
            name=json_form["form"],
            id=json_form["id"],
            version=json_form.get('version') if 'version' in json_form else 1.0,
            description=json_form.get('description'),
            default_language=json_form.get('defaultLanguage'),
            languages=json_form.get('languages'),
            translations=json_form.get('translations'))
    print(f"Form: {form.name}")
    sys.exit()
    for qg in json_form["question_groups"]:
        question_group = crud_question_group.add_question_group(
            session=session,
            name=qg["question_group"],
            form=form.id,
            description=qg.get('description'),
            repeatable=qg.get('repeatable'),
            repeat_text=qg.get('repeatText'),
            translations=qg.get('translations'))
        print(f"Question Group: {question_group.name}")
        for i, q in enumerate(qg["questions"]):
            # get addons
            addons = {}
            if "allowOther" in q:
                addons.update({'allowOther': q.get('allowOther')})
            if "allowOtherText" in q:
                addons.update({'allowOtherText': q.get('allowOtherText')})
            question = crud_question.add_question(
                session=session,
                name=q["question"],
                id=q["id"] if "id" in q else None,
                form=form.id,
                question_group=question_group.id,
                type=q["type"],
                meta=q["meta"],
                order=q["order"],
                required=q["required"] if "required" in q else False,
                rule=q["rule"] if "rule" in q else None,
                dependency=q["dependency"] if "dependency" in q else None,
                tooltip=q.get('tooltip'),
                translations=q.get('translations'),
                api=q.get('api'),
                addons=addons if addons else None,
                option=q["options"] if "options" in q else [])
            print(f"{i}.{question.name}")
    print("------------------------------------------")

elapsed_time = time.process_time() - start_time
elapsed_time = str(timedelta(seconds=elapsed_time)).split(".")[0]
print(f"\n-- DONE IN {elapsed_time}\n")
