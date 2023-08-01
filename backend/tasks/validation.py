import pandas as pd
import os
import enum
import itertools
import gc
from db import crud_question
from db import crud_administration
from db import crud_data
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
        yield from (
            "".join(group) for group in itertools.product(ascii_uppercase, repeat=n)
        )
        n += 1


def validate_header_names(header, col, header_names):
    default = {"error": ExcelError.header, "cell": col}
    if "Unnamed:" in header:
        default.update({"error_message": ValidationText.header_name_missing.value})
        return default
    if "|" not in header:
        default.update(
            {
                "error_message": f"{header} {ValidationText.header_no_question_id.value}",
            }
        )
        return default
    if "|" in header:
        if header not in header_names:
            default.update(
                {
                    "error_message": f"{header} {ValidationText.header_invalid_id.value}",
                }
            )
            return default
    return False


def validate_number(answer, question):
    try:
        answer = float(answer)
    except ValueError:
        return {"error_message": ValidationText.numeric_validation.value}
    try:
        if question.rule:
            rule = question.rule
            qname = question.name
            for r in rule:
                if r == "max" and float(rule[r]) < float(answer):
                    return {
                        "error_message": ValidationText.numeric_max_rule.value.replace(
                            "--question--", qname
                        ).replace("--rule--", str(rule[r]))
                    }
                if r == "min" and float(rule[r]) > float(answer):
                    return {
                        "error_message": ValidationText.numeric_min_rule.value.replace(
                            "--question--", qname
                        ).replace("--rule--", str(rule[r]))
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
        return {"error_message": ValidationText.lat_long_validation.value}
    if "," not in answer:
        return {"error_message": ValidationText.lat_long_validation.value}
    answer = str(answer).split(",")
    if len(answer) != 2:
        return {"error_message": ValidationText.lat_long_validation.value}
    for a in answer:
        try:
            a = float(a.strip())
        except ValueError:
            return {"error_message": ValidationText.lat_long_validation.value}
    return False


def validate_administration(session, answer, adm):
    if adm["name"] not in answer:
        return {
            "error_message": ValidationText.administration_not_part_of.value.replace(
                "--answer--", answer
            ).replace("--administration--", adm["name"])
        }
    adm_match = crud_administration.verify_administration(
        session=session, long_name=answer
    )
    if not adm_match:
        return {
            "error_message": f"{ValidationText.administration_not_valid.value} {answer}"
        }
    return False


def validate_date(answer):
    try:
        answer = (
            answer.strftime("%Y-%m-%d")
            if isinstance(answer, pd.Timestamp)
            else str(answer)
        )
        answer = datetime.strptime(answer, "%Y-%m-%d")
    except ValueError:
        return {
            "error_message": f"Invalid date format: {answer}. It should be YYYY-MM-DD"
        }
    return False


def validate_option(options, answer):
    options = [o.name for o in options]
    lower_options = [o.lower() for o in options]
    answer = str(answer).split("|")
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
        return {"error_message": message}
    return False


def validate_row_data(session, col, answer, question, adm, valid_deps, answer_deps):
    default = {"error": ExcelError.value, "cell": col}
    invalid_deps = question.dependency and not valid_deps
    if (answer == answer) and invalid_deps and answer_deps:
        error_deps = [
            (f"question: {ad['id']} with {ad['answer']} in cell" f" {ad['cell']}")
            for ad in answer_deps
        ]
        error_msg = f"{question.name} should be empty because you answered "
        error_msg += " and ".join(error_deps)
        default.update({"error_message": error_msg})
        return default
    if answer != answer:
        if (question.required and not question.dependency) or (
            question.required and question.dependency and valid_deps
        ):
            default.update(
                {"error_message": f"{question.name} {ValidationText.is_required.value}"}
            )
            return default
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
    if question.type == QuestionType.answer_list:
        aw_text = str(int(answer))
        parent = crud_data.get_data_by_name(session=session, name=aw_text)
        if not parent:
            default.update(
                {"error_message": f"{question.name} Invalid project code"}
            )
            print("default", default)
            return default
    return False


def validate_sheet_name(file: str):
    xl = pd.ExcelFile(file)
    return xl.sheet_names


def dependency_checker(qs, answered, index):
    matched = []
    answer_deps = []
    for q in qs:
        fa = list(
            filter(lambda a: a["id"] == q["id"] and a["index"] == index, answered)
        )
        if len(fa):
            answer_deps.append(fa[0])
            answers = str(fa[0]["answer"]).split("|")
            intersection = list(set(answers).intersection(q["options"]))
            if len(intersection):
                matched.append(intersection[0])
    valid_deps = len(matched) == len(qs)
    return valid_deps, answer_deps


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
                    "error": ExcelError.sheet,
                    "error_message": ValidationText.template_validation.value,
                    "sheets": ",".join(sheet_names),
                }]
        questions = crud_question.get_excel_question(session=session, form=form)
        header_names = [q.to_excel_header for q in questions.all()]
        df = pd.read_excel(file, sheet_name="data")
        if df.shape[0] == 0:
            return [{
                "error": ExcelError.sheet,
                "error_message": ValidationText.file_empty_validation.value,
            }]
        excel_head = {}
        excel_cols = list(itertools.islice(generate_excel_columns(), df.shape[1]))
        for index, header in enumerate(list(df)):
            excel_head.update({excel_cols[index]: header})
        header_error = []
        data_error = []
        childs = crud_administration.get_all_childs(
            session=session, parents=[administration], current=[]
        )
        adm = crud_administration.get_administration_by_id(
            session=session, id=administration
        )
        adm = {"id": adm.id, "name": adm.name, "childs": childs}
        answered = []
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
                    valid_deps = False
                    answer_deps = None
                    answered.append(
                        {
                            "id": question.id,
                            "answer": answer,
                            "cell": f"{col}{ix}",
                            "index": ix,
                        }
                    )
                    if question.dependency:
                        valid_deps, answer_deps = dependency_checker(
                            qs=question.dependency, answered=answered, index=ix
                        )
                    error = validate_row_data(
                        session,
                        f"{col}{ix}",
                        answer,
                        question,
                        adm,
                        valid_deps,
                        answer_deps,
                    )
                    if error:
                        data_error.append(error)
                del question
            del header
            del error
        del df
        del adm
        del excel_head
        del answered
        gc.collect()
        return header_error + data_error
    except Exception as e:
        print("VALIDATION ERROR", str(e))
        return [{"error": str(e), "cell": None}]
