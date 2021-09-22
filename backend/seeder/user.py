import os
import sys
from db.connection import SessionLocal, Base, engine
from db import crud_user, crud_administration
from faker import Faker
from models.access import Access

if len(sys.argv) < 2:
    print("You should provide number of fake user")

if len(sys.argv) == 2:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.append(BASE_DIR)

    Base.metadata.create_all(bind=engine)
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
                access.append(Access(user=user.id, administration=c['id']))
            session.add_all(access)
            session.commit()
        print(f"{user.email} added | active: {active}")
    session.close()
