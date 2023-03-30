import json
import os
import time
import sys
from models.question import Question
from models.answer import Answer
from models.data import Data
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
updater = True
if len(sys.argv) == 2 and sys.argv[1] == "--truncate":
    updater = False

for table in ["form", "question_group", "question", "option"]:
    if not updater:
        # truncate only for init form seeder
        action = truncate(session=session, table=table)
        print(action)


def print_validation(fid, name, itype, message, is_error=True):
    emsg = "ERROR" if is_error else "WARNING"
    print(f"{emsg}: `{name}` {itype} in form {fid} {message}")


def cleanup_form(json_form, qids):
    questions = crud_question.get_question_by_form_id(session=session,
                                                      fid=json_form["id"])
    for q in questions:
        if q.id not in qids:
            session.query(Question).filter(Question.id == q.id).delete()
            session.commit()
            print_validation(json_form["id"], q.name, "question",
                             "is removed from the database", False)


def validate_form(json_form):
    validated = True
    fid = json_form["id"]
    qids = []
    for qg in json_form["question_groups"]:
        if not qg.get("id"):
            print_validation(fid, qg["question_group"], "QUESTION GROUP",
                             "ID is not defined in the json")
            validated = False
        for q in qg["questions"]:
            if not q.get("id"):
                print_validation(fid, q["question"], "QUESTION",
                                 "ID is not defined in the json")
                validated = False
            qids.append(q.get("id"))
    return validated, qids


for file in sorted(files):
    with open(f'{file_path}{file}') as json_file:
        json_form = json.load(json_file)
    # check form exist
    valid, qids = validate_form(json_form)
    if not valid:
        exit(1)
    find_form = crud_form.get_form_by_id(session=session, id=json_form["id"])
    if updater and find_form:
        # check if form has question id and question group id
        # remove question if not available in json
        cleanup_form(json_form, qids)
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
        print(f"Updating Form: {form.id} - {form.name}")
    # init
    if not updater or not find_form:
        form = crud_form.add_form(
            session=session,
            name=json_form["form"],
            id=json_form["id"],
            version=json_form.get('version')
            if 'version' in json_form else 1.0,
            description=json_form.get('description'),
            default_language=json_form.get('defaultLanguage'),
            languages=json_form.get('languages'),
            translations=json_form.get('translations'))
        print(f"Added Form: {form.name}\n")
    for qg in json_form["question_groups"]:
        # check question group exist
        find_group = crud_question_group.get_question_group_by_id(
            session=session, id=qg.get("id"))
        # add new question group
        if not updater or not find_group:
            question_group = crud_question_group.add_question_group(
                session=session,
                name=qg["question_group"],
                form=form.id,
                id=qg.get("id"),
                order=qg.get("order"),
                description=qg.get('description'),
                repeatable=qg.get('repeatable'),
                repeat_text=qg.get('repeatText'),
                translations=qg.get('translations'))
            print(f"\nAdded Question Group: {question_group.name}")
        # updater
        if updater and find_group:
            oqg = crud_question_group.get_question_group_by_id(session=session,
                                                               id=qg.get("id"))
            oname = oqg.name
            question_group = crud_question_group.update_question_group(
                session=session,
                form=form.id,
                name=qg["question_group"],
                id=find_group.id,
                order=qg.get("order") or find_group.order
                if find_group else None,
                description=qg.get('description'),
                repeatable=qg.get('repeatable'),
                repeat_text=qg.get('repeatText'),
                translations=qg.get('translations'))
            if question_group.name != oname:
                print(f"\nUpdated Group: {oname} -> {question_group.name}")
        for i, q in enumerate(qg["questions"]):
            # check question exist
            find_question = crud_question.get_question_by_id(session=session,
                                                             id=q.get('id'))
            # get addons
            addons = {}
            if "allowOther" in q:
                addons.update({'allowOther': q.get('allowOther')})
            if "allowOtherText" in q:
                addons.update({'allowOtherText': q.get('allowOtherText')})
            # add new question
            if not updater or not find_question:
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
                print(f"Added: {question.id}|{question.name}")
            # updater
            if updater and find_question:
                old_question = crud_question.get_question_by_id(
                    session=session, id=q.get("id"))
                oname = old_question.name
                otype = old_question.type
                question = crud_question.update_question(
                    session=session,
                    name=q.get("question"),
                    form=form.id,
                    question_group=find_group.id,
                    type=q.get("type"),
                    meta=q.get("meta"),
                    id=find_question.id,
                    order=q.get("order"),
                    required=q.get("required"),
                    rule=q.get("rule"),
                    dependency=q.get("dependency"),
                    tooltip=q.get("tooltip"),
                    translations=q.get("translations"),
                    api=q.get("api"),
                    addons=addons if addons else None,
                    option=q["options"] if "options" in q else [])
                if question.name != oname:
                    print(f"Updated: {question.id}|{oname} -> {question.name}")
                if question.type != otype:
                    print(f"Updated: {question.id}|{otype} -> {question.type}")
    print("------------------------------------------")

elapsed_time = time.process_time() - start_time
elapsed_time = str(timedelta(seconds=elapsed_time)).split(".")[0]
print(f"\n-- DONE IN {elapsed_time}\n")
