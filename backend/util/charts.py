import numpy as np
import collections
import itertools
from typing_extensions import TypedDict
from sqlalchemy.orm import Session
from db.crud_form import get_form_by_name
from db.crud_question import get_question_by_name
from db.crud_answer import get_answer_by_question
from models.question import QuestionType


class ChartType(TypedDict):
    bar = "bar"
    pie = "pie"
    stack = "stack"
    line = "line"


class ChartMethod(TypedDict):
    count = "count"  # Count of submission
    sum = "sum"  # Sum value: Only for number type of question


class ChartDict(TypedDict):
    question = str
    form = str
    type = ChartType
    methood = ChartMethod


class Charts(TypedDict):
    example_charts = {
        "question": "main source of drinking water",
        "form": "hh",
        "type": ChartType.stack,
        "methood": ChartMethod.count
    }
    water_service_level = {
        "question": "water service level",
        "form": "hh",
        "type": ChartType.stack,
        "methood": ChartMethod.count
    }
    get = {
        "example_charts": example_charts,
        "water_service_level": water_service_level,
    }
    list = ["example_charts", "water_service_level"]


def get_chart_value(session: Session, chart: ChartDict):
    form = get_form_by_name(session=session, name=chart["form"])
    question = get_question_by_name(session=session,
                                    form=form.id,
                                    name=chart["question"])
    answer = get_answer_by_question(session=session, question=question.id)
    if question.type == QuestionType.option:
        answer_list = [a.only_value for a in answer]
        answer_list = list(itertools.chain(*answer_list))
        a = np.array(answer_list)
        return dict(collections.Counter(a))
    return [a.only_value for a in answer]
