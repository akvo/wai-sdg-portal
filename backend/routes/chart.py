from typing import List
from fastapi import Request, APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session
from db.connection import get_session
from util.charts import Charts
from util.charts import get_chart_value

chart_route = APIRouter()


@chart_route.get("/chart/", summary="get chart list", tags=["Charts"])
def get(req: Request, session: Session = Depends(get_session)) -> List[str]:
    return Charts.list


@chart_route.get("/chart/{name:path}",
                 summary="get chart by name",
                 tags=["Charts"])
def get_by_name(
        req: Request, name: str,
        session: Session = Depends(get_session)):
    chart = Charts.get[name]
    value = get_chart_value(session=session, chart=chart)
    return value
