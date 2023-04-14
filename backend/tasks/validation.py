import pandas as pd
from pandas.core.series import Series
import os
import enum
import itertools
import gc
from db import crud_question
from db import crud_administration
from datetime import datetime
from models.question import Question, QuestionType
from sqlalchemy.orm import Session
from string import ascii_uppercase
from util.helper import HText
from util.i18n import ValidationText
from util.log import write_log
# from memory_profiler import profile as memory


class ExcelError(enum.Enum):
    sheet = "sheet_name"
    header = "header_name"
    value = "column_value"


def generate_excel_columns():
    n = 1
    while True:
        yield from ("".join(group)
                    for group in itertools.product(ascii_uppercase, repeat=n))
        n += 1


def validate_header_names(header, col, header_names):
    default = {"E": ExcelError.header, "C": col}
    if "Unnamed:" in header:
        default.update({"M": ValidationText.header_name_missing.value})
        return default
    if "|" not in header:
        default.update({
            "M":
            f"{header} {ValidationText.header_no_question_id.value}",
        })
        return default
    if "|" in header:
        if header not in header_names:
            default.update({
                "M":
                f"{header} {ValidationText.header_invalid_id.value}",
            })
            return default
    return False


def validate_number(answer, question):
    try:
        answer = float(answer)
    except ValueError:
        return {"M": ValidationText.numeric_validation.value}
    try:
        if question.rule:
            rule = question.rule
            qname = question.name
            for r in rule:
                if r == "max" and float(rule[r]) < float(answer):
                    return {
                        "M":
                        ValidationText.numeric_max_rule.value.replace(
                            "--question--",
                            qname).replace("--rule--", str(rule[r]))
                    }
                if r == "min" and float(rule[r]) > float(answer):
                    return {
                        "M":
                        ValidationText.numeric_min_rule.value.replace(
                            "--question--",
                            qname).replace("--rule--", str(rule[r]))
                    }
    except Exception as e:
        write_log("ERROR", e)
    return False


def validate_geo(answer):
    answer = str(answer)
    answer = answer.replace("(", "")
    answer = answer.replace(")", "")
    answer = answer.strip()
    try:
        for a in answer.split(","):
            float(a.strip())
    except ValueError:
        return {"M": ValidationText.lat_long_validation.value}
    if "," not in answer:
        return {"M": ValidationText.lat_long_validation.value}
    answer = answer.split(",")
    if len(answer) != 2:
        return {"M": ValidationText.lat_long_validation.value}
    for a in answer:
        try:
            a = float(a.strip())
        except ValueError:
            return {"M": ValidationText.lat_long_validation.value}
    return False


def validate_administration(session, answer, adm):
    aw = answer.split("|")
    name = adm["name"]
    if len(aw) < 2:
        return {"M": ValidationText.administration_validation.value}
    if aw[0] != adm["name"]:
        return {"M": f"{ValidationText.administration_not_valid.value} {name}"}
    children = crud_administration.get_administration_by_name(session=session,
                                                              name=aw[-1],
                                                              parent=adm["id"])
    if not children:
        return {
            "M":
            ValidationText.administration_not_part_of.value.replace(
                "--answer--", str(aw[-1])).replace("--administration--", name)
        }
    return False


def validate_date(answer):
    try:
        answer = int(answer)
        return {"M": f"Invalid date format: {answer}. It should be YYYY-MM-DD"}
    except ValueError:
        pass
    try:
        answer = datetime.strptime(answer, "%Y-%m-%d")
    except ValueError:
        return {"M": f"Invalid date format: {answer}. It should be YYYY-MM-DD"}
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
        return {"M": message}
    return False


def validate_row_data(session, col, answer, question, adm):
    default = {"E": ExcelError.value, "C": col}
    if not answer:
        return False
    if isinstance(answer, str):
        answer = HText(answer).clean
    if question.type == QuestionType.administration:
        err = validate_administration(session, answer, adm)
        if err:
            default.update(err)
            return default
    if question.type == QuestionType.geo:
        err = validate_geo(answer)
        if err:
            default.update(err)
            return default
    if question.type == QuestionType.number:
        err = validate_number(answer, question)
        if err:
            default.update(err)
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


def validate_dependency(answer, col: str, ix: int, row: Series,
                        question: Question, excel_head):
    errors = []
    for qd in question.dependency:
        dep_answer = row[str(qd["id"])]
        if dep_answer:
            dep_answer = set(dep_answer.split("|")).intersection(
                set(qd["options"]))
        if not answer and dep_answer and question.required:
            errors.append({
                "E": ExcelError.value,
                "C": f"{col}{ix}",
                "M": f"{col}{ix} {ValidationText.is_required.value}"
            })
        if answer and not dep_answer:
            col_dep = next(
                (k for k, v in excel_head.items() if v == str(qd["id"])), None)
            msg = f"Cell {col}{ix} should be empty because"
            msg += f" of dependency answer in {col_dep}{ix}"
            errors.append({"E": ExcelError.value, "C": f"{col}{ix}", "M": msg})
    return errors


# @memory
def validate(session: Session, form: int, administration: int, file: str):
    try:
        sheet_names = validate_sheet_name(file)
        template_sheets = ["data", "definitions", "administration"]
        TESTING = os.environ.get("TESTING")
        if TESTING:
            template_sheets = ["data"]
        for sheet_tab in template_sheets:
            if sheet_tab not in sheet_names:
                return [{
                    "E": ExcelError.sheet,
                    "C": ValidationText.template_validation.value,
                    "M": ",".join(sheet_names),
                }]
        questions = crud_question.get_excel_question(session=session,
                                                     form=form)
        header_names = [q.to_excel_header for q in questions.all()]
        df = pd.read_excel(file, sheet_name="data")
        if df.shape[0] == 0:
            return [{
                "E": ExcelError.sheet,
                "C": ValidationText.file_empty_validation.value,
            }]
        excel_head = {}
        excel_cols = list(
            itertools.islice(generate_excel_columns(), df.shape[1]))
        errors = []
        for index, header in enumerate(list(df)):
            try:
                qid = header.split("|")[0].strip()
                df = df.rename(columns={header: qid})
                excel_head.update({excel_cols[index]: qid})
                error = validate_header_names(header, excel_cols[index],
                                              header_names)
                if error:
                    errors.append(error)
            except AttributeError:
                errors.append({
                    "E": ExcelError.header,
                    "C": excel_cols[index],
                    "M": ValidationText.header_is_wrong.value
                })
        if errors:
            return errors
        childs = crud_administration.get_all_childs(session=session,
                                                    parents=[administration],
                                                    current=[])
        adm = crud_administration.get_administration_by_id(session=session,
                                                           id=administration)
        adm = {"id": adm.id, "name": adm.name, "childs": childs}
        for i, row in df.iterrows():
            ix = i + 2
            for col in excel_head:
                qid = excel_head[col]
                question = questions.filter(Question.id == int(qid)).first()
                answer = row[qid] if row[qid] == row[qid] else None
                if question.dependency:
                    error = validate_dependency(answer=answer,
                                                col=col,
                                                ix=ix,
                                                row=row,
                                                question=question,
                                                excel_head=excel_head)
                    if error:
                        errors += error
                error = validate_row_data(session, f"{col}{ix}", answer,
                                          question, adm)
                if error:
                    errors.append(error)
        del df
        del adm
        del excel_head
        gc.collect()
        return errors
    except Exception as e:
        print("VALIDATION ERROR", str(e))
        return None
