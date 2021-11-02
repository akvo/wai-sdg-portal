import os
import pandas as pd
import enum
import humps
import itertools
from db import crud_question, crud_form, crud_administration
from datetime import datetime
from models.question import Question, QuestionType
from sqlalchemy.orm import Session
from string import ascii_uppercase


def generate_administration_sheet(session: Session):
    adm = crud_administration.get_administration(session=session)
    df = pd.DataFrame([a.serialize for a in adm])
    df["parent"] = df["parent"].fillna(0).astype(int)
    dict_id = df.set_index('id').parent.to_dict()

    def get_parent_id(anc):
        anc = [anc] if not isinstance(anc, list) else anc
        if anc[-1] == 0:
            return anc
        else:
            parent = get_parent_id([dict_id[anc[-1]]])
            anc += parent
            return anc

    dict_name = df.set_index('id').name.to_dict()
    df['path_id'] = df.id.apply(get_parent_id)
    df['parent'] = df.apply(
        lambda x:
        [dict_name[id_] for id_ in x.path_id if not (id_ == x.id or id_ == 0)],
        axis=1)
    df['parent'] = df['parent'].apply(lambda x: " | ".join(x))
    return df


def generate_definition_sheet(session: Session, form: int):
    definitions = crud_question.get_definition(session=session, form=form.id)
    df = pd.DataFrame(definitions)
    df["type"] = df["type"].apply(lambda x: str(x).split(".")[1])
    return df.groupby(["id", "question", "type", "option"]).first()


def generate_excel_template(session: Session, form: int):
    form = crud_form.get_form_by_id(session=session, id=form)
    questions = crud_question.get_excel_question(session=session, form=form.id)
    data = pd.DataFrame(columns=[q.to_excel_header for q in questions],
                        index=[0])
    form_name = humps.decamelize(form.name)
    filename = f"{form.id}-{form_name}"
    filepath = f"./tmp/{filename}.xlsx"
    if os.path.exists(filepath):
        os.remove(filepath)
    writer = pd.ExcelWriter(filepath, engine='xlsxwriter')
    data.to_excel(writer,
                  sheet_name='data',
                  startrow=1,
                  header=False,
                  index=False)
    workbook = writer.book
    worksheet = writer.sheets['data']
    header_format = workbook.add_format({
        'bold': True,
        'text_wrap': True,
        'valign': 'top',
        'border': 1
    })
    for col_num, value in enumerate(data.columns.values):
        worksheet.write(0, col_num, value, header_format)
    definitions = generate_definition_sheet(session=session, form=form)
    definitions.to_excel(writer,
                         sheet_name='definitions',
                         startrow=0,
                         header=False)
    administration = pd.read_csv("./source/administration-cascade.csv")
    administration["administration"] = administration[
        "parent"] + "|" + administration["name"]
    administration = administration[["administration"]]
    administration.to_excel(writer,
                            sheet_name='administration',
                            startrow=0,
                            header=False,
                            index=False)
    writer.save()
    return filepath


class ExcelError(enum.Enum):
    header = 'header_name'
    value = 'column_value'


def generate_excel_columns():
    n = 1
    while True:
        yield from (''.join(group)
                    for group in itertools.product(ascii_uppercase, repeat=n))
        n += 1


def validate_header_names(header, col, header_names):
    default = {"error": ExcelError.header, "column": col}
    if "Unnamed:" in header:
        default.update({"message": "Header name is missing"})
        return default
    if "|" not in header:
        default.update({
            "message": f"{header} doesn't have question id",
        })
        return default
    if "|" in header:
        if header not in header_names:
            default.update({
                "message": f"{header} has invalid id",
            })
            return default
    return False


def validate_option(type, options, answer):
    err = []
    for a in answer:
        if a not in options:
            err.append(a)
    if len(err):
        return ", ".join(err)
    return False


def validate_geo(answer):
    try:
        a = int(answer)
        return {"message": "Invalid lat long format"}
    except ValueError:
        pass
    if "," not in answer:
        return {"message": "Invalid lat long format"}
    answer = answer.split(",")
    if len(answer) != 2:
        return {"message": "Invalid lat long format"}
    for a in answer:
        try:
            a = int(a)
        except ValueError:
            return {"message": "Invalid lat long format"}
    return False


def validate_row_data(col, answer, question):
    default = {"error": ExcelError.value, "column": col}
    if answer != answer:
        return False
    if question.type == QuestionType.geo:
        err = validate_geo(answer)
        if err:
            default.update(err)
            return default
    if question.type == QuestionType.number:
        try:
            answer = int(answer)
        except ValueError:
            default.update({"message": "Value should be numeric"})
            return default
    if question.type == QuestionType.date:
        try:
            answer = int(answer)
            default.update({
                "message":
                f"Invalid date format: {answer}. It should be YYYY-MM-DD"
            })
            return default
        except ValueError:
            pass
        try:
            answer = datetime.strptime(answer, "%Y-%m-%d")
        except ValueError:
            default.update({
                "message":
                f"Invalid date format: {answer}. It should be YYYY-MM-DD"
            })
            return default
    if question.type in [QuestionType.option, QuestionType.multiple_option]:
        options = [o.name for o in question.option]
        err = validate_option(question.type, options, answer.split("|"))
        if err:
            default.update({"message": f"Invalid value: {err}"})
            return default
    return False


def validate_excel_data(session: Session, form: int, administration: int,
                        file: str):
    questions = crud_question.get_excel_question(session=session, form=form)
    header_names = [q.to_excel_header for q in questions.all()]
    df = pd.read_excel(file, sheet_name='data')
    excel_head = {}
    excel_cols = list(itertools.islice(generate_excel_columns(), df.shape[1]))
    for index, header in enumerate(list(df)):
        excel_head.update({excel_cols[index]: header})
    header_error = []
    data_error = []
    for col in excel_head:
        header = excel_head[col]
        error = validate_header_names(header, f"{col}1", header_names)
        if error:
            header_error.append(error)
        if not error:
            qid = header.split("|")[0]
            question = questions.filter(Question.id == int(qid)).first()
            answers = list(df[header])
            for i, answer in enumerate(answers):
                ix = i + 2
                error = validate_row_data(f"{col}{ix}", answer, question)
                if error:
                    data_error.append(error)
    return header_error + data_error
