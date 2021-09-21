import os
import sys
from db.connection import SessionLocal, engine
from db import models
from db import crud_user

if len(sys.argv) < 2:
    print("You should provide email address")

if len(sys.argv) == 2:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.append(BASE_DIR)

    models.Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    user = crud_user.add_user(session=session,
                              email=sys.argv[1],
                              role="admin",
                              active=True)
    print(f"{user.email} added")
    session.close()
