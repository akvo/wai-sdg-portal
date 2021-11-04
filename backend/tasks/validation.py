import pandas as pd
import enum
import itertools
from db import crud_question
from datetime import datetime
from models.question import Question, QuestionType
from sqlalchemy.orm import Session
from string import ascii_uppercase
from util.helper import HText


class ExcelError(enum.Enum):
    sheet = 'sheet_name'
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


def validate_date(answer):
    try:
        answer = int(answer)
        return {
            "message":
            f"Invalid date format: {answer}. It should be YYYY-MM-DD"
        }
    except ValueError:
        pass
    try:
        answer = datetime.strptime(answer, "%Y-%m-%d")
    except ValueError:
        return {
            "message":
            f"Invalid date format: {answer}. It should be YYYY-MM-DD"
        }
    return False


def validate_option(options, answer):
    options = [o.name for o in options]
    lower_options = [o.lower() for o in options]
    answer = answer.split("|")
    invalid_value = []
    invalid_case = []
    invalid = False
    for a in answer:
        if a not in options and a.lower() not in lower_options:
            invalid = True
            invalid_value.append(a)
        if a not in options and a.lower() in lower_options:
            invalid = True
            invalid_case.append(a)
    if invalid:
        message = ""
        if len(invalid_case):
            invalid_list = ", ".join(invalid_case)
            message += f"Invalid case: {invalid_list}"
        if len(invalid_case) and len(invalid_value):
            message += " and "
        if len(invalid_value):
            invalid_list = ", ".join(invalid_value)
            message += f"Invalid value: {invalid_list}"
        return {"message": message}
    return False


def validate_row_data(col, answer, question):
    default = {"error": ExcelError.value, "column": col}
    if answer != answer:
        return False
    if isinstance(answer, str):
        answer = HText(answer).clean
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
        err = validate_date(answer)
        if err:
            default.update(err)
            return default
    if question.type in [QuestionType.option, QuestionType.multiple_option]:
        err = validate_option(question.option, answer)
        if err:
            default.update(err)
            return default
    return False


def validate_sheet_name(file: str):
    xl = pd.ExcelFile(file)
    return xl.sheet_names


def validate(session: Session, form: int, administration: int, file: str):
    sheet_names = validate_sheet_name(file)
    if 'data' not in sheet_names:
        return [{
            "error": ExcelError.sheet,
            "message": "Wrong sheet name, there should be sheet named data",
            "sheets": ",".join(sheet_names)
        }]
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
