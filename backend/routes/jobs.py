from fastapi import Depends, Request, APIRouter
from sqlalchemy.orm import Session
import db.crud_jobs as crud
from db.connection import get_session
from models.jobs import JobStatusResponse

jobs_route = APIRouter()


@jobs_route.get("/jobs/status/{id:path}",
                response_model=JobStatusResponse,
                summary="get jobs by id",
                name="jobs:status",
                tags=["Jobs"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    jobs = crud.status(session=session, id=id)
    return jobs
