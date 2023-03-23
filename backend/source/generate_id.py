import json
import os
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
    form_id = int(data['id'])
    question_groups = data['question_groups']
    df = pd.DataFrame(columns=['question_group_id', 'question_group'])
    for i, group in enumerate(question_groups):
        group_name = group['question_group']
        group_id = form_id + i + 1
        df = pd.concat([
            df,
            pd.DataFrame({
                'question_group_id': group_id,
                'question_group': group_name
            }, index=[i])])
    for i, group in enumerate(question_groups):
        group['id'] = df.loc[i, 'question_group_id']
    with open(f'{file_path}{file}', 'w') as json_file:
        json.dump(data, json_file)
