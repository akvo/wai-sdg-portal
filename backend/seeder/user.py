import os
import sys
from db.connection import Base, SessionLocal, engine
import db.crud_user as crud
import db.crud_organisation as crud_organisation

inputs = [
    {"value": "name", "question": "Full Name"},
    {"value": "email", "question": "Email Address"},
    {"value": "organisation", "question": "Organisation Name"},
    {"value": "role", "question": "Role", "options": ["admin", "editor"]},
]

payload = {}
for i in inputs:
    v = i.get("value")
    q = i.get("question") or i.get("value")
    opt = i.get("options")
    if opt:
        q += " ["
        for oi, o in enumerate(opt):
            q += f"{o}"
            if (oi + 1) < len(opt):
                q += ", "
        q += "]"
    a = input(f"{q}: ")
    if opt:
        a = a.lower()
        if a not in opt:
            print("Invalid input")
            exit()
    if not len(a):
        print("Required")
        exit()
    payload.update({v: a})

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

Base.metadata.create_all(bind=engine)
session = SessionLocal()
org = crud_organisation.get_organisation_by_name(
    session=session, name=payload["organisation"]
)
if not org:
    org = crud_organisation.add_organisation(
        session=session, name=payload["organisation"], type="iNGO"
    )
    print("Organisation named {} created".format(payload["organisation"]))
user = crud.get_user_by_email(session=session, email=payload["email"])
manage_form_passcode = True if payload["role"] == "admin" else False
if user:
    user = crud.update_user_by_id(
        session=session,
        id=user.id,
        name=payload["name"],
        role=payload["role"],
        active=1,
        organisation=org.id,
        manage_form_passcode=manage_form_passcode
    )
    print(f"{user.email} of {org.name} updated")
    session.close()
    sys.exit()
user = crud.add_user(
    session=session,
    email=payload["email"],
    name=payload["name"],
    role=payload["role"],
    active=True,
    organisation=org.id,
    manage_form_passcode=manage_form_passcode
)
print(f"{user.email} of {org.name} added")
session.close()
