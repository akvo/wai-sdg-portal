from pydantic import BaseModel
from fastapi import Depends, Request, APIRouter
from fastapi.security import HTTPBearer
from typing import List, Optional, Union
from sqlalchemy.orm import Session
import db.crud_maps as crud
from db.connection import get_session

security = HTTPBearer()
maps_route = APIRouter()


class MapsDict(BaseModel):
    id: int
    loc: str
    geo: Optional[List[float]] = None
    color_by: Optional[Union[str, int]] = None
    count_by: Union[int, str]


@maps_route.get("/maps/{form_id:path}",
                response_model=List[MapsDict],
                summary="get maps data by form id",
                name="maps:get",
                tags=["Maps"])
def get(req: Request,
        form_id: int,
        count_by: int,
        color_by: Optional[int] = None,
        session: Session = Depends(get_session)):
    question_ids = []
    if color_by:
        question_ids.append(color_by)
    if count_by:
        question_ids.append(count_by)
    if not len(question_ids):
        question_ids = None
    data = crud.get_data(session=session, form=form_id, question=question_ids)
    for d in data:
        for v in d["values"]:
            if v["question"] == color_by:
                d.update({"color_by": v["value"]})
            if v["question"] == count_by:
                d.update({"count_by": v["value"]})
        del d["values"]
    return data
