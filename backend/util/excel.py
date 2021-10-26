import pandas as pd
import humps
from db import crud_question
from db import crud_form
from sqlalchemy.orm import Session


def generate_excel_template(session: Session, form: int):
    form = crud_form.get_form_by_id(session=session, id=form)
    questions = crud_question.get_excel_question(session=session, form=form.id)
    df = pd.DataFrame(columns=[q.to_excel_header for q in questions],
                      index=[0])
    form_name = humps.decamelize(form.name)
    file_name = f"{form.id}-{form_name}"
    df.to_excel(f"./tmp/{file_name}.xls", index=False)
    return f"./tmp/{file_name}.xls"
