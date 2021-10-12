import os
import pandas as pd
from db.truncator import truncate
from db.connection import engine, SessionLocal

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
session = SessionLocal()
action = truncate(session=session, table="organisation")
print(action)
session.close()

data = pd.read_csv('./source/organisation-list.csv')
data.to_sql('organisation', engine, if_exists='append',  index=False)
