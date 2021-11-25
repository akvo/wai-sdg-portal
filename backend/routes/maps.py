from pydantic import BaseModel
from fastapi import Depends, Request, APIRouter, Query
from fastapi.security import HTTPBearer
from typing import List, Optional, Any
from sqlalchemy.orm import Session
import db.crud_maps as crud
from db.connection import get_session
from middleware import check_query

security = HTTPBearer()
maps_route = APIRouter()


class MapsDict(BaseModel):
    id: int
    loc: str
    geo: Optional[List[float]] = None
    name: str
    marker: Any
    shape: Any


@maps_route.get("/maps/{form_id:path}",
                response_model=List[MapsDict],
                summary="get maps data by form id",
                name="maps:get",
                tags=["Maps"])
def get(req: Request,
        form_id: int,
        shape: int,
        marker: Optional[int] = None,
        q: Optional[List[str]] = Query(None),
        session: Session = Depends(get_session)):
    options = check_query(q) if q else None
    question_ids = []
    if marker:
        question_ids.append(marker)
    if shape:
        question_ids.append(shape)
    if not len(question_ids):
        question_ids = None
    data = crud.get_data(session=session,
                         form=form_id,
                         question=question_ids,
                         options=options)
    for d in data:
        for v in d["values"]:
            if v["question"] == marker:
                d.update({"marker": v["value"] if v["value"] else None})
            if v["question"] == shape:
                d.update({"shape": v["value"] if v["value"] else None})
        del d["values"]
    return data
