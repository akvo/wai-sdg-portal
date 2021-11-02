import pandas as pd
import enum
import itertools
from db import crud_question
from datetime import datetime
from models.question import Question, QuestionType
from sqlalchemy.orm import Session
from string import ascii_uppercase


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


def validate(session: Session, form: int, administration: int, file: str):
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
