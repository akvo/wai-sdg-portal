import pandas as pd
import humps
import itertools
from db import crud_question
from db import crud_form
from sqlalchemy.orm import Session
from string import ascii_uppercase


def generate_excel_template(session: Session, form: int):
    form = crud_form.get_form_by_id(session=session, id=form)
    questions = crud_question.get_excel_question(session=session, form=form.id)
    df = pd.DataFrame(columns=[q.to_excel_header for q in questions],
                      index=[0])
    form_name = humps.decamelize(form.name)
    file_name = f"{form.id}-{form_name}"
    df.to_excel(f"./tmp/{file_name}.xls", index=False)
    return f"./tmp/{file_name}.xls"


def generate_excel_columns():
    n = 1
    while True:
        yield from (''.join(group)
                    for group in itertools.product(ascii_uppercase, repeat=n))
        n += 1


def validate_excel_data(session: Session, form: int, administration: int,
                        file: str):
    questions = crud_question.get_excel_question(session=session, form=form)
    header_names = [q.to_excel_header for q in questions]
    df = pd.read_excel(file)
    excel_head = {}
    excel_cols = list(itertools.islice(generate_excel_columns(), df.shape[1]))
    for index, header in enumerate(list(df)):
        excel_head.update({excel_cols[index]: header})
    messages = []
    for col in excel_head:
        header = excel_head[col]
        if "|" not in header:
            messages.append({
                "error": "column_name",
                "message": f"{col}1:{header} doesn't includes question id"
            })
    return messages
