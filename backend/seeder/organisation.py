import os
import pandas as pd
from db.connection import SessionLocal
from models.organisation import OrganisationType
import db.crud_organisation as crud

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
source_path = os.environ["INSTANCE_NAME"]
source_file = f"./source/{source_path}/data/organisation.csv"
session = SessionLocal()
data = pd.read_csv(source_file)
data = data.to_dict("records")

for d in data:
    organisation = crud.get_organisation_by_id(session=session,
                                               id=d.get("id"))
    organisation_name = d.get("name")
    if organisation:
        print(f"{organisation_name} Exists")
    if not organisation:
        organisation_type = getattr(OrganisationType, d.get("type"))
        crud.add_organisation(session=session,
                              id=d.get("id"),
                              name=organisation_name,
                              type=organisation_type)
        print(f"{organisation_name} Added")
