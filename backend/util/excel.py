import pandas as pd
import humps
from datetime import datetime
from db import crud_question
from db import crud_form
from db import crud_administration
from sqlalchemy.orm import Session


def generate_excel_template(session: Session, form: int, adm: int):
    form = crud_form.get_form_by_id(session=session, id=form)
    today = datetime.today().strftime("%y%m%d")
    adm = crud_administration.get_administration_by_id(session=session, id=adm)
    if not adm.parent:
        raise ValueError("Wrong administration level")
    parent = crud_administration.get_administration_by_id(session=session,
                                                          id=adm.parent)
    questions = crud_question.get_question(session=session, form=form.id)
    df = pd.DataFrame(columns=[q.to_excel_header for q in questions],
                      index=[0])
    form_name = humps.decamelize(form.name)
    location_name = parent.name.replace(" ", "_").lower()
    location_name += "_"
    location_name += adm.name.replace(" ", "_").lower()
    file_name = f"{form.id}_{adm.id}_{today}-{form_name}_{location_name}"
    df.to_excel(f"./tmp/{file_name}.xls", index=False)
    return f"./tmp/{file_name}.xls"
