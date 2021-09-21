import os
import sys
from db.connection import SessionLocal, engine
from db import models
from db import crud_user
from faker import Faker

if len(sys.argv) < 2:
    print("You should provide number of fake user")

if len(sys.argv) == 2:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.append(BASE_DIR)

    models.Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    fake = Faker()
    administration = crud_administration.get_administration(session=session)
    administration = [c.serialize for c in administration]
    for i in range(int(sys.argv[1])):
        active = fake.pybool()
        user = crud_user.add_user(session=session,
                                  email=fake.unique.email(),
                                  role="user",
                                  active=active)
        if active:
            access = []
            for c in administration:
                access.append(models.Access(user=user.id, administration=c['id']))
            session.add_all(access)
            session.commit()
        print(f"{user.email} added | active: {active}")
    session.close()
