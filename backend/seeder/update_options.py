import json
import os
import time
from datetime import timedelta
from db import crud_form
from db import crud_option
from db.connection import Base, SessionLocal, engine

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

for file in sorted(files):
    with open(f"{file_path}{file}") as json_file:
        json_form = json.load(json_file)
    # check form
    form = crud_form.get_form_by_id(session=session, id=json_form["id"])
    if not form:
        continue
    print(f"Form: {form.name}")
    for qg in json_form["question_groups"]:
        # print(f"> Question Group: {qg['question_group']}")
        for i, q in enumerate(qg["questions"]):
            if "options" not in q:
                continue
            if not q["options"]:
                continue
            # print(f"# Question-{i}.{q['question']}")
            for oi, o in enumerate(q["options"]):
                opt = crud_option.get_option_by_question_and_name(
                    session=session,
                    name=str(o["name"]),
                    question=q["id"] if "id" in q else None,
                )
                if not opt:
                    continue
                # update
                name = str(o["name"])
                order = None
                color = None
                score = None
                if "order" in o:
                    order = o["order"]
                if "color" in o:
                    color = o["color"]
                if "score" in o:
                    score = o["score"]
                optDict = opt.serializeWithId
                odname = optDict["name"]
                odorder = optDict["order"]
                odcolor = optDict["color"]
                odscore = optDict["score"]
                if (
                    name != odname
                    or order != odorder
                    or color != odcolor
                    or score != odscore
                ):
                    option = crud_option.update_option(
                        session=session,
                        id=opt.id,
                        name=name,
                        order=order,
                        color=color,
                        score=score,
                    )
                    print(f"*** Option-{oi}.{o['name']}")
    print("------------------------------------------")

elapsed_time = time.process_time() - start_time
elapsed_time = str(timedelta(seconds=elapsed_time)).split(".")[0]
print(f"\n-- DONE IN {elapsed_time}\n")
