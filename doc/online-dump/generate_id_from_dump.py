import json
import os
from datetime import date
import pandas as pd

today = date.today().strftime("%Y-%m-%d")
dump_path = "./"
dump_files = [f for f in os.listdir(dump_path) if f.endswith('.csv')]

# This will generate id based on data dump
for f in dump_files:
    source_path = f.split("_")[0]
    file_path = f"../../backend/source/{source_path}/forms/"
    try:
        files = list(filter(lambda x: ".bak" not in x, os.listdir(file_path)))
    except FileNotFoundError:
        print("Location not found ", file_path)
        continue
    # generate id
    db_dump = pd.read_csv(f)
    db_dump["question_group_name"] = db_dump["question_group_name"].str.lower()
    db_dump["question_name"] = db_dump["question_name"].str.lower()
    last_qid = 0
    for file in sorted(files):
        with open(f'{file_path}{file}') as json_file:
            data = json.load(json_file)
        form_dump = db_dump[db_dump["form"] == int(data.get("id"))]
        # question group
        for i, qg in enumerate(data.get("question_groups")):
            # question
            for j, q in enumerate(qg.get("questions")):
                qid = q.get("id")
                qid = int(qid) if qid else None
                q_dump = form_dump[form_dump["question"] == qid]
                if qid and len(q_dump):
                    continue
                q_dump = form_dump[
                    form_dump["question_name"] == q.get("question").lower()]
                if qid and not len(q_dump.head()):
                    continue
                if not qid and not len(q_dump.head()):
                    # use latest question id on that dump + i
                    q["id"] = int(db_dump.iloc[-1]["question"] + i + j + 1)
                    continue
                q["id"] = int(q_dump.head().iloc[0]["question"])
            # question group
            qgid = qg.get("id")
            qgid = int(qgid) if qgid else None
            qg_dump = form_dump[form_dump["question_group"] == qgid]
            if qgid and len(qg_dump):
                continue
            qg_dump = form_dump[
                form_dump[
                    "question_group_name"] == qg.get("question_group").lower()]
            if qgid and not len(qg_dump.head()):
                continue
            if not qgid and not len(qg_dump.head()):
                # use latest group id on that dump + i
                last_qid = int(
                    db_dump.iloc[-1]["question_group"] + 1
                ) if not last_qid else last_qid + 1
                qg["id"] = last_qid
                continue
            qg["id"] = int(qg_dump.head().iloc[0]["question_group"])
        # rewrite json
        with open(f'{file_path}{file}', 'w') as json_file:
            json.dump(data, json_file, indent=2)
        print(f"{source_path}: Generating ID Form: {data.get('form')}")
