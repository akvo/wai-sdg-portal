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
    for file in sorted(files):
        with open(f'{file_path}{file}') as json_file:
            data = json.load(json_file)
        form_dump = db_dump[db_dump["form"] == int(data.get("id"))]
        # question group
        for qg in data.get("question_groups"):
            qgid = qg.get("id")
            qgid = int(qgid) if qgid else None
            qg_dump = form_dump[form_dump["question_group"] == qgid]
            if qgid and len(qg_dump):
                continue
            qg_dump = form_dump[
                form_dump["question_group_name"] == qg.get("question_group")]
            if qgid and not len(qg_dump):
                continue
            qg["id"] = int(qg_dump.head().iloc[0]["question_group"])
            # question
            for q in qg.get("questions"):
                qid = qg.get("id")
                qid = int(qid) if qid else None
                q_dump = form_dump[form_dump["id"] == qid]
                if qid and len(q_dump):
                    continue
                q_dump = form_dump[form_dump["name"] == q.get("question")]
                if qid and not len(q_dump):
                    continue
                q["id"] = int(q_dump.head().iloc[0]["id"])
        # rewrite json
        with open(f'{file_path}{file}', 'w') as json_file:
            json.dump(data, json_file, indent=2)
        print(f"Generating ID from dump Form: {data.get('form')}")
