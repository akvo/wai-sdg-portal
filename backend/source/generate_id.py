import json
import os
import time
import numpy as np
import pandas as pd

source_path = os.environ["INSTANCE_NAME"]
SANDBOX_DATA_SOURCE = os.environ.get("SANDBOX_DATA_SOURCE")
if SANDBOX_DATA_SOURCE:
    source_path = SANDBOX_DATA_SOURCE
file_path = f"./source/{source_path}/forms/"

files = list(filter(lambda x: ".bak" not in x, os.listdir(file_path)))


# This will generate id based on form_id for missing id param
for file in sorted(files):
    with open(f"{file_path}{file}") as json_file:
        data = json.load(json_file)
    df = pd.json_normalize(
        data,
        record_path=["question_groups", "questions"],
        meta=["form", "id", ["question_groups", "question_group"]],
        record_prefix="question_",
    )
    # generate unique IDs for question groups and questions
    df = df.replace(np.nan, None)
    qg_length = len(data.get("question_groups"))
    q_length = len(df.index)
    opt_length = df["question_options"].apply(
        lambda row: len(row) if row else 0
    )
    opt_length = sum(list(opt_length))
    df["qgid"] = df.apply(
        lambda row: int(row["id"]) + int(row.name) + 1, axis=1
    )
    df["qid"] = df.apply(
        lambda row: int(row["qgid"]) + int(row.name) + 1 + qg_length
        if not row["question_id"]
        else int(row["question_id"]),
        axis=1,
    )
    # add question group and question id to json
    for i, qg in enumerate(data.get("question_groups")):
        find_qg = df.loc[
            df["question_groups.question_group"] == qg.get("question_group")
        ].head(1)
        qg["id"] = int(find_qg["qgid"].values[0])
        for j, q in enumerate(qg.get("questions")):
            if q.get("options"):
                for k, opt in enumerate(q.get("options")):
                    if opt.get("id"):
                        continue
                    current_time = time.time()
                    current_time = str(current_time)[-5:]
                    opt_id = int(data["id"]) + qg_length + q_length
                    opt_id += opt_length
                    opt_id += int(current_time)
                    opt["id"] = opt_id
            if q.get("id"):
                continue
            find_q = df.loc[df["question_question"] == q.get("question")].head(
                1
            )
            q["id"] = int(find_q["qid"].values[0])
    # write json
    with open(f"{file_path}{file}", "w") as json_file:
        json.dump(data, json_file, indent=2)
    print(f"Transform Form: {data.get('form')}")
