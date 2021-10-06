import numpy as np
import collections
import itertools
from typing_extensions import TypedDict
from sqlalchemy.orm import Session
from db.crud_form import get_form_by_name
from db.crud_question import get_question_by_name
from db.crud_answer import get_answer_by_question
from models.question import QuestionType

# CHART TYPE
# bar: number, option, multiple options
#   axis: when number -> administration level, else unique answer
# pie: number, option, multiple options
#   category : when number -> administration level, else unique answer
# stack: option and multiple option question only
#   axis : administration
#   stack: unique answer
# line: number only
#   axis: date of submission
#   stack: administration


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
    water_point_functionality = {
        "question": "Functionality Status",
        "form": "wp",
        "type": ChartType.stack,
        "methood": ChartMethod.count
    }
    water_service_level_households = {
        "question": "water service level",
        "form": "hh",
        "type": ChartType.stack,
        "methood": ChartMethod.count
    }
    water_service_level_health_facility = {
        "question": "water",
        "form": "health",
        "type": ChartType.stack,
        "methood": ChartMethod.count
    }
    water_service_level_school = {
        "question": "water",
        "form": "school",
        "type": ChartType.stack,
        "methood": ChartMethod.count
    }
    get = {
        "example_charts": example_charts,
        "water_point_functionality": water_point_functionality,
        "water_service_level_households": water_service_level_households,
        "water_service_level_health_facility":
        water_service_level_health_facility,
        "water_service_level_school": water_service_level_school,
    }
    list = list(get)


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
