from typing import List
from fastapi import Request, APIRouter, HTTPException
from fastapi import Depends
from sqlalchemy.orm import Session
from db.connection import get_session
from util.charts import Charts
from util.charts import get_chart_value
from db.crud_charts import get_chart_data

chart_route = APIRouter()


@chart_route.get("/chart/", name="charts:get",
                 summary="get chart list", tags=["Charts"])
def get(req: Request, session: Session = Depends(get_session)) -> List[str]:
    return Charts.list


@chart_route.get("/chart/data/{question_id:path}",
                 name="charts:get_aggregated_chart_data",
                 summary="get chart aggregate data",
                 tags=["Charts"])
def get_aggregated_chart_data(
        req: Request, question_id: int, stack: int = None,
        session: Session = Depends(get_session)):
    if (question_id == stack):
        raise HTTPException(status_code=406, detail="Not Acceptable")
    value = get_chart_data(session=session, question=question_id, stack=stack)
    return value


@chart_route.get("/chart/{name:path}",
                 name="charts:get_by_name",
                 summary="get chart by name",
                 tags=["Charts"])
def get_by_name(
        req: Request, name: str,
        session: Session = Depends(get_session)):
    chart = Charts.get[name]
    value = get_chart_value(session=session, chart=chart)
    return value
