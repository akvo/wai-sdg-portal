import json
import os
import numpy as np
import pandas as pd

source_path = os.environ["INSTANCE_NAME"]
SANDBOX_DATA_SOURCE = os.environ.get("SANDBOX_DATA_SOURCE")
if SANDBOX_DATA_SOURCE:
    source_path = SANDBOX_DATA_SOURCE
file_path = f"./source/{source_path}/forms/"

files = list(filter(lambda x: ".bak" not in x, os.listdir(file_path)))

for file in sorted(files):
    with open(f'{file_path}{file}') as json_file:
        data = json.load(json_file)
    df = pd.json_normalize(
        data,
        record_path=['question_groups', 'questions'],
        meta=[
            'form', 'id',
            ['question_groups', 'question_group']],
        record_prefix='question_')
    # generate unique IDs for question groups and questions
    qg_length = len(data.get("question_groups"))
    df = df.replace(np.nan, None)
    df['qgid'] = df.apply(lambda row: int(row['id'] + row.name + 1), axis=1)
    df['qid'] = df.apply(
        lambda row: int(row['qgid'] + row.name + 1 + qg_length)
        if not row["question_id"] else int(row["question_id"]),
        axis=1)
    # add question group and question id to json
    for i, qg in enumerate(data.get("question_groups")):
        find_qg = df.loc[
            df["question_groups.question_group"] == qg.get("question_group")
        ].head(1)
        qg["id"] = int(find_qg["qgid"].values[0])

        for i, q in enumerate(qg.get("questions")):
            if "id" in q:
                continue
            find_q = df.loc[
                df["question_question"] == q.get("question")
            ].head(1)
            q["id"] = int(find_q["qid"].values[0])
    # write json
    with open(f'{file_path}{file}', 'w') as json_file:
        json.dump(data, json_file, indent=2)
    print(f"Transform Form: {data.get('form')}")
