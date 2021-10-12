import os
import sys
from db.connection import Base, SessionLocal, engine
import db.crud_user as crud
import db.crud_organisation as crud_organisation

if len(sys.argv) < 4:
    print("You should provide email address, name and organisation name")

if len(sys.argv) == 4:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.append(BASE_DIR)

    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    org = crud_organisation.get_organisation_by_name(session=session,
                                                     name=sys.argv[3])
    if not org:
        org = crud_organisation.add_organisation(session=session,
                                                 name=sys.argv[3],
                                                 type="iNGO")
        print("Organisation named {} created".format(sys.argv[3]))
    user = crud.add_user(session=session,
                         email=sys.argv[1],
                         name=sys.argv[2],
                         role="admin",
                         active=True,
                         organisation=org.id)
    print(f"{user.email} of {org.name} added")
    session.close()
