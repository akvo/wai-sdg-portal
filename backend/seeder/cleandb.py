import os
from db.truncator import truncate
from db.connection import SessionLocal

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
source_path = os.environ["INSTANCE_NAME"]
SANDBOX_DATA_SOURCE = os.environ.get("SANDBOX_DATA_SOURCE")
if SANDBOX_DATA_SOURCE:
    source_path = SANDBOX_DATA_SOURCE
session = SessionLocal()

tables = [
    "history", "answer", "data", "option", "question", "question_group",
    "form", "access", "public.user", "organisation", "administration"
]


for t in tables:
    print(f"{t} CLEANED")
    action = truncate(session=session, table=t)
exit(0)
