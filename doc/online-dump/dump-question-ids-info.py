import os
from datetime import date
import psycopg2
import pandas as pd
import re

secret_path = "../../../akvo-config/k8s-secrets/test"
today = date.today().strftime("%Y-%m-%d")

items = os.listdir(secret_path)
directories = [item for item in items if os.path.isdir(
    os.path.join(secret_path, item))]
instances = list(filter(lambda x: "wai" in x, directories))

for secret in instances:
    f = f"{secret_path}/{secret}/database-url"
    with open(f, "r") as file:
        database_url = file.read()
        database_url = re.split("\\//|@|:5432|:|\\/|\\?", database_url)
        # print(database_url)
        database = list(filter(lambda x: len(x) > 0, database_url))
        conn = psycopg2.connect(
            host=database[3],
            database=database[4],
            user=database[1],
            password=database[2],
        )
        sql_query = """
        SELECT q.id as question, q.question_group, q.form,
        qg.name as question_group_name,
        q.name as question_name, q.type
        FROM question q
        LEFT JOIN question_group qg
        ON q.question_group = qg.id
        ORDER BY q.form, qg.order, q.order
        """
        df = pd.read_sql_query(sql_query, conn)
        filename = f"./{database[1]}_db-backup-{today}.csv"
        df.to_csv(filename, index=False)
        print(filename)
        conn.close()
