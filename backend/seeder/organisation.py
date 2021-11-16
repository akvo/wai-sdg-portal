import os
import pandas as pd
from db.truncator import truncate
from db.connection import engine, SessionLocal

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
session = SessionLocal()
source_path = os.environ["INSTANCE_NAME"]
source_file = f"./source/{source_path}/data/organisation.csv"
action = truncate(session=session, table="organisation")
print(action)
session.close()

data = pd.read_csv(source_file)
data.to_sql('organisation', engine, if_exists='append',  index=False)
