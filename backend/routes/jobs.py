from typing import Union
from fastapi import Depends, Request, APIRouter
from sqlalchemy.orm import Session
import db.crud_jobs as crud
from db.connection import get_session
from models.jobs import JobsBase, JobStatus

jobs_route = APIRouter()


@jobs_route.get("/jobs/pending",
                response_model=JobsBase,
                summary="get pending jobs",
                tags=["Jobs"])
def get(req: Request, session: Session = Depends(get_session)):
    jobs = crud.pending(session=session)
    return jobs


@jobs_route.get("/jobs/status/{id:path}",
                response_model=Union[JobStatus],
                summary="get jobs by id",
                tags=["Jobs"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    jobs = crud.status(session=session, id=id)
    return jobs
