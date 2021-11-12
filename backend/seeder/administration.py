import os
import pandas as pd
from db.truncator import truncate
from db.connection import engine, SessionLocal

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
session = SessionLocal()
source_path = os.environ["WEBDOMAIN"].replace("https://", "").split(".")[0]
source_file = f"./source/{source_path}/data/administration.csv"
action = truncate(session=session, table="administration")
print(action)
session.close()

data = pd.read_csv(source_file)
parents = list(data['UNIT_TYPE'].unique())
parents = pd.DataFrame(parents, columns=['name'])
parents['parent'] = None
parents['id'] = parents.index + 1
data['parent'] = data['UNIT_TYPE'].apply(
    lambda x: parents[parents['name'] == x].id.values[0])
data = data.rename(columns={'UNIT_NAME': 'name'})[['name', 'parent']]
results = parents[['name', 'parent'
                   ]].append(data).reset_index()[['name', 'parent']]
results['id'] = results.index + 1
results.to_sql('administration', engine, if_exists='append',  index=False)
