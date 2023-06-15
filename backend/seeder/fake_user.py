import os
import sys
from db.connection import SessionLocal, Base, engine
from db import crud_user, crud_administration
import db.crud_organisation as crud_organisation
from faker import Faker
from models.access import Access

if len(sys.argv) < 3:
    print("You should provide number of fake user and organisation name")

if len(sys.argv) == 3:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.append(BASE_DIR)

    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    crud_user.delete_non_admin_user(session=session)
    fake = Faker()
    administration = crud_administration.get_parent_administration(session=session)
    administration = [a.id for a in administration]
    org = crud_organisation.get_organisation_by_name(session=session, name=sys.argv[2])
    if not org:
        org = crud_organisation.add_organisation(
            session=session, name=sys.argv[2], type="iNGO"
        )
        print("Organisation named {} created".format(sys.argv[2]))
    for i in range(int(sys.argv[1])):
        active = fake.pybool()
        user = crud_user.add_user(
            session=session,
            name=fake.name(),
            email=fake.unique.email(),
            role="user",
            active=active,
            organisation=org.id,
        )
        if active:
            access = []
            admin_access = set(fake.random_int(min=1, max=3) for i in administration)
            admin_access = list(admin_access)
            for a in admin_access:
                access.append(Access(user=user.id, administration=a))
            session.add_all(access)
            session.commit()
        print(f"{user.email} added | active: {active}")
    session.close()
