from sqlalchemy.orm import Session, aliased
from sqlalchemy import and_, func
from models.answer import Answer
from models.data import Data
from models.option import Option
from models.views.view_data import ViewData
from models.views.view_data_score import ViewDataScore
from db import crud_question
import collections
from itertools import groupby
from typing import List

default_color_config = {"yes": "#91cc75", "no": "#ee6666"}


def filter_datapoint(session: Session,
                     form: int,
                     administration: List[str] = None,
                     options: List[str] = None):
    # get list of data ids
    data = session.query(Data.id).filter(Data.form == form)
    if options:
        data_id = session.query(ViewData.data).filter(
            ViewData.options.contains(options)).all()
        data = data.filter(Data.id.in_([d.data for d in data_id]))
    if administration:
        data = data.filter(Data.administration.in_(administration))
    data = [d.id for d in data.all()]
    return data


def get_chart_data(session: Session,
                   form: int,
                   question: int,
                   stack: int = None,
                   administration: List[str] = None,
                   options: List[str] = None):
    data = filter_datapoint(session=session,
                            form=form,
                            administration=administration,
                            options=options)
    # chart query
    type = "BAR"
    if stack:
        type = "BARSTACK"
        answerStack = aliased(Answer)
        answer = session.query(Answer.options, answerStack.options,
                               func.count())
        # filter
        answer = answer.filter(Answer.data.in_(data))
        answer = answer.join((answerStack, Answer.data == answerStack.data))
        answer = answer.filter(
            and_(Answer.question == question, answerStack.question == stack))
        answer = answer.group_by(Answer.options, answerStack.options)
        answer = answer.all()
        answer = [{
            "axis": a[0][0].lower(),
            "stack": a[1][0].lower(),
            "value": a[2]
        } for a in answer]
        temp = []
        answer.sort(key=lambda x: x["axis"])
        for k, v in groupby(answer, key=lambda x: x["axis"]):
            child = [{x["stack"]: x["value"]} for x in list(v)]
            counter = collections.Counter()
            for d in child:
                counter.update(d)
            child = [{
                "name": key,
                "value": val
            } for key, val in dict(counter).items()]
            temp.append({"group": k, "child": child})
        answer = temp
    else:
        answer = session.query(Answer.options, func.count(Answer.id))
        # filter
        answer = answer.filter(Answer.data.in_(data))
        answer = answer.filter(Answer.question == question)
        answer = answer.group_by(Answer.options)
        answer = answer.all()
        answer = [{a[0][0].lower(): a[1]} for a in answer]
        counter = collections.Counter()
        for d in answer:
            counter.update(d)
        answer = [{"name": k, "value": v} for k, v in dict(counter).items()]
    return {"type": type, "data": answer}


def get_jmp_chart_data(session: Session,
                       form: int,
                       question: int,
                       parent_administration=bool,
                       administration: List[str] = None,
                       options: List[str] = None):
    data = filter_datapoint(session=session,
                            form=form,
                            administration=administration,
                            options=options)
    result = session.query(
        ViewDataScore.administration, ViewDataScore.option,
        func.count(ViewDataScore.data).label('count')).filter(
            ViewDataScore.form == form).filter(
                ViewDataScore.question == question).filter(
                    ViewDataScore.administration.in_(administration)).filter(
                        ViewDataScore.data.in_(data)).group_by(
                            ViewDataScore.administration).group_by(
                                ViewDataScore.option).all()
    result = [ViewDataScore.group_serialize(t) for t in result]
    if parent_administration:
        for p in parent_administration:
            for r in result:
                if r["administration"] in p['children']:
                    r.update({"administration": p["id"]})

    temp = []
    result.sort(key=lambda x: x["administration"])
    options = session.query(Option).filter(Option.question == question).all()
    scores = [o.scores for o in options]
    for k, v in groupby(result, key=lambda x: x["administration"]):
        score = 0
        child = []
        for x in list(v):
            child.append({"option": x['option'], "count": x["count"]})

        child_group = []
        child.sort(key=lambda x: x["option"])
        for kc, vc in groupby(child, key=lambda x: x["option"]):
            child_group.append({
                "option": kc,
                "count": sum([x["count"] for x in list(vc)])
            })
        for c in child_group:
            percent = c["count"] / sum([x["count"] for x in list(child_group)])
            this_score = list(
                filter(lambda s: s["name"] == c["option"], scores))
            if (len(this_score)):
                score += this_score[0]["score"] * percent
            c.update({"percent": percent * 100})
        temp.append({
            "administration": k,
            "score": score,
            "child": child_group,
        })
    temp.sort(key=lambda x: x["score"], reverse=True)
    return {"form": form, "question": question, "data": temp}


def get_pie_chart_data(session: Session,
                       form: int,
                       question: int,
                       administration: List[str] = None,
                       options: List[str] = None):
    data = filter_datapoint(session=session,
                            form=form,
                            administration=administration,
                            options=options)
    answer = session.query(Answer.options,
                           func.count(Answer.id).label('count')).filter(
                               Answer.data.in_(data)).filter(
                                   Answer.question == question).group_by(
                                       Answer.options).all()
    options = session.query(
        Option.name, Option.color).filter(Option.question == question).all()
    options = [{"name": o[0], "color": o[1]} for o in options]
    temp = []
    total = sum([a.count for a in answer])
    for a in answer:
        color = default_color_config[a.options[0].lower(
        )] if a.options[0].lower() in default_color_config else None
        option = list(
            filter(lambda x: x["name"].lower() == a.options[0].lower(),
                   options))
        if len(option):
            if option[0]["color"]:
                color = option[0]["color"]
        data = {
            "name": a.options[0],
            "count": a.count,
            "total": total,
            "value": round((a.count / total) * 100, 2),
        }
        if color:
            data.update({"itemStyle": {"color": color}})
        temp.append(data)
    return {"form": form, "question": question, "data": temp}


def get_overviews_visualization(session: Session, form: int, question: int,
                                option: str):
    answer = session.query(Answer.options,
                           func.count(Answer.id).label('count')).filter(
                               Answer.question == question).group_by(
                                   Answer.options).all()

    findQuestion = crud_question.get_question_by_id(
        session=session, id=question)
    options = session.query(
        Option.name, Option.color).filter(Option.question == question).all()
    options = [{"name": o[0], "color": o[1]} for o in options]

    chart_data = []
    info_data = None
    total = sum([a.count for a in answer])
    for a in answer:
        opt = a.options[0]

        color = default_color_config[opt.lower(
            )]if opt.lower() in default_color_config else None
        findOption = list(
            filter(lambda x: x["name"].lower() == opt.lower(),
                   options))
        if len(findOption):
            if findOption[0]["color"]:
                color = findOption[0]["color"]

        value = {
            "name": opt,
            "count": a.count,
            "total": total,
            "value": round((a.count / total) * 100, 2),
        }

        if color:
            value.update({"itemStyle": {"color": color}})
        if opt.lower() == option.lower():
            info_data = value
        chart_data.append(value)
    data = [{
        "type": "info",
        "data": info_data
    }, {
        "type": "chart",
        "data": chart_data
    }]
    return {
        "form": form,
        "question": question,
        "question_name": findQuestion.name if findQuestion else None,
        "data": data
    }
