from typing import List, Optional
from fastapi import Request, APIRouter, HTTPException, Query
from fastapi import Depends
from sqlalchemy.orm import Session
from db.connection import get_session
from util.charts import Charts
from util.charts import get_chart_value
import db.crud_charts as crud_charts
import db.crud_administration as crud_administration
from middleware import check_query
from itertools import groupby
from db.crud_jmp import get_jmp_overview

chart_route = APIRouter()


@chart_route.get("/chart/",
                 name="charts:get",
                 summary="get chart list",
                 tags=["Charts"])
def get(req: Request, session: Session = Depends(get_session)) -> List[str]:
    return Charts.list


@chart_route.get("/chart/data/{form_id:path}",
                 name="charts:get_aggregated_chart_data",
                 summary="get chart aggregate data",
                 tags=["Charts"])
def get_aggregated_chart_data(req: Request,
                              form_id: int,
                              question: int,
                              stack: Optional[int] = None,
                              administration: Optional[int] = None,
                              q: Optional[List[str]] = Query(None),
                              session: Session = Depends(get_session)):
    options = check_query(q) if q else None
    administration_ids = False
    if administration:
        administration_ids = crud_administration.get_all_childs(
            session=session, parents=[administration], current=[])
        if not len(administration_ids):
            raise HTTPException(status_code=404, detail="Not found")
    if question == stack:
        raise HTTPException(status_code=406, detail="Not Acceptable")
    value = crud_charts.get_chart_data(session=session,
                                       form=form_id,
                                       question=question,
                                       stack=stack,
                                       administration=administration_ids,
                                       options=options)
    return value


@chart_route.get("/chart/pie-data/{form_id:path}/{question_id:path}",
                 name="charts:get_aggregated_pie_chart_data",
                 summary="get pie chart aggregate data",
                 tags=["Charts"])
def get_aggregated_pie_chart_data(req: Request,
                                  form_id: int,
                                  question_id: int,
                                  administration: Optional[int] = None,
                                  q: Optional[List[str]] = Query(None),
                                  session: Session = Depends(get_session)):
    options = check_query(q) if q else None
    administration_ids = False
    if administration:
        administration_ids = crud_administration.get_all_childs(
            session=session, parents=[administration], current=[])
        if not len(administration_ids):
            raise HTTPException(status_code=404, detail="Not found")
    value = crud_charts.get_pie_chart_data(session=session,
                                           form=form_id,
                                           question=question_id,
                                           administration=administration_ids,
                                           options=options)
    return value


def group_children(p, values):
    data = list(
        filter(lambda d: (d["administration"] in p["children"]), values)
    )
    data = [{"category": d["category"], "data": d["data"]} for d in data]
    total = len(data)
    obj = {}
    childs = []
    groups = groupby(data, key=lambda d: d["category"])
    for k, values in groups:
        obj[k] = list(values)
    for k, v in obj.items():
        count = len(v)
        percent = count / total * 100
        childs.append({
            "option": k,
            "count": count,
            "percent": percent
        })
    return {"administration": p["id"], "score": 0, "child": childs}


@chart_route.get(
    "/chart/jmp-data/{form_id:path}/{cname:path}",
    name="charts:get_aggregated_jmp_chart_data",
    summary="get jmp chart aggregate data",
    tags=["Charts"],
)
def get_aggregated_jmp_chart_data(
    req: Request,
    form_id: int,
    cname: str,
    administration: Optional[int] = None,
    q: Optional[List[str]] = Query(None),
    session: Session = Depends(get_session),
):
    # options = check_query(q) if q else None
    parent_administration = crud_administration.get_parent_administration(
        session=session
    )
    parent_administration = [
        x.simplify_serialize_with_children for x in parent_administration
    ]
    data = get_jmp_overview(
        session=session, form=form_id, name=cname
    )
    group = list(
        map(
            lambda p: group_children(p, data),
            parent_administration,
        )
    )
    return {"form": form_id, "question": cname, "data": group}


@chart_route.get(
    "/chart/overviews/{form_id:path}/{question_id:path}/{option:path}",
    name="charts:get_overviews_chart_and_info",
    summary="get overviews chart and info data",
    tags=["Charts"])
def get_overviews_chart_and_info_data(req: Request,
                                      form_id: int,
                                      question_id: int,
                                      option: str,
                                      session: Session = Depends(get_session)):
    value = crud_charts.get_overviews_visualization(
        session=session,
        form=form_id,
        question=question_id,
        option=option)
    return value


@chart_route.get("/chart/{name:path}",
                 name="charts:get_by_name",
                 summary="get chart by name",
                 tags=["Charts"])
def get_by_name(req: Request,
                name: str,
                session: Session = Depends(get_session)):
    chart = Charts.get[name]
    value = get_chart_value(session=session, chart=chart)
    return value
