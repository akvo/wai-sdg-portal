from pydantic import BaseModel
from fastapi import Depends, Request, APIRouter, Query
from fastapi.security import HTTPBearer
from typing_extensions import TypedDict
from typing import List, Optional, Any, Union
from sqlalchemy.orm import Session
import db.crud_maps as crud
from db.connection import get_session
from middleware import check_query
from db.crud_jmp import (
    get_jmp_overview,
    get_jmp_config_by_form,
)

security = HTTPBearer()
maps_route = APIRouter()


class MapsDict(BaseModel):
    id: int
    loc: str
    geo: Optional[List[float]] = None
    name: str
    marker: Any
    shape: Any
    marker_hover: Optional[List[dict]] = None


class LabelDict(BaseModel):
    name: str
    color: str
    order: Optional[int] = None
    score: Optional[int] = None


class ScoreDict(TypedDict):
    name: str
    labels: List[LabelDict]


class MapResponse(TypedDict):
    scores: List[ScoreDict]
    data: List[MapsDict]


@maps_route.get(
    "/maps/{form_id:path}",
    response_model=MapResponse,
    summary="get maps data by form id",
    name="maps:get",
    tags=["Maps"],
)
def get(
    req: Request,
    form_id: int,
    shape: Union[int, str],
    marker: Optional[str] = None,
    hover_ids: Optional[str] = None,
    q: Optional[List[str]] = Query(None),
    session: Session = Depends(get_session),
):
    options = check_query(q) if q else None
    question_ids = []
    if isinstance(shape, int):
        question_ids.append(shape)
    hids = []
    if hover_ids:
        for h in hover_ids.split("|"):
            hids.append(int(h))
        for h in hids:
            question_ids.append(h)
    data = crud.get_data(
        session=session, form=form_id, question=question_ids, options=options
    )
    categories = get_jmp_overview(session=session, form=form_id)
    config = get_jmp_config_by_form(form=form_id)
    scores = [{"name": c["name"], "labels": c["labels"]} for c in config]
    for d in data:
        hover_values = []
        fc = list(filter(lambda c: (c["data"] == d["id"]), categories))
        if len(fc):
            if marker:
                fm = list(filter(lambda m: (m["name"] == marker), fc))
                d.update({"marker": fm[0]["category"] if len(fm) else None})
            if isinstance(shape, str):
                fs = list(filter(lambda m: (m["name"] == shape), fc))
                d.update({"shape": fs[0]["category"] if len(fs) else None})
        for v in d["values"]:
            if v["question"] == shape:
                d.update({"shape": v["value"] if v["value"] else None})
            if v["question"] in hids:
                hover_values.append(
                    {
                        "id": v["question"],
                        "value": v["value"] if v["value"] else None,
                    }
                )
        if hover_ids:
            d.update({"marker_hover": hover_values})
        del d["values"]
    return {"scores": scores, "data": data}
