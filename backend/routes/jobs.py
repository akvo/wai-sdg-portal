from fastapi import Depends, Request, APIRouter, HTTPException
from math import ceil
from sqlalchemy.orm import Session
from sqlalchemy import desc
import db.crud_jobs as crud
from db.connection import get_session
from middleware import verify_user
from models.jobs import JobStatusResponse, Jobs, JobsPaginateResponse
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials

security = HTTPBearer()
jobs_route = APIRouter()


@jobs_route.get("/jobs/status/{id:path}",
                response_model=JobStatusResponse,
                summary="get jobs by id",
                name="jobs:status",
                tags=["Jobs"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    jobs = crud.status(session=session, id=id)
    return jobs


@jobs_route.get(
    "/jobs/current-user",
    response_model=JobsPaginateResponse,
    summary="get all jobs by current user",
    name="jobs:get_by_current_user",
    tags=["Jobs"],
)
def get_by_current_user(
    req: Request,
    page: int = 1,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    user = verify_user(req.state.authenticated, session)
    skip = 10 * (page - 1)
    limit = 5
    jobs = (
        session.query(Jobs)
        .filter(Jobs.created_by == user.id)
        .order_by(desc(Jobs.created))
    )
    total = jobs.count()
    data = jobs.offset(skip).limit(limit).all()
    total_page = ceil(total / 10) if total > 0 else 0
    if total_page < page:
        raise HTTPException(status_code=404, detail="Not found")
    data = [d.serialize for d in data]
    return {
        "current": page,
        "data": data,
        "total": total,
        "total_page": total_page,
    }
