import os
import sys
from db.connection import Base, SessionLocal, engine
import db.crud_user as crud

if len(sys.argv) < 2:
    print("You should provide email address")

if len(sys.argv) == 2:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.append(BASE_DIR)

    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    user = crud.add_user(session=session,
                         email=sys.argv[1],
                         role="admin",
                         active=True)
    print(f"{user.email} added")
    session.close()
