from fastapi import Depends, Request, APIRouter
from typing import List
from sqlalchemy.orm import Session
from db import crud_answer
from db.connection import get_session
from models.project import ProjectBase
from models.data import Data

project_route = APIRouter()


@project_route.get("/project/{id:path}",
                   response_model=List[ProjectBase],
                   summary="get project by id",
                   name="project:get_by_id",
                   tags=["Custom"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    project = crud_answer.get_answer_by_question(session=session, question=id)
    result = [p.to_project for p in project]
    for r in result:
        data = session.query(Data).filter(Data.id == r["name"]).first()
        r.update({"label": data.name})
    return result
