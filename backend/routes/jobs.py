from typing import Union
from fastapi import Depends, Request, BackgroundTasks, APIRouter
from sqlalchemy.orm import Session
import db.crud_jobs as crud
from db.connection import get_session
from models.jobs import JobsBase, JobType, JobStatus
from util.excel import validate_excel_data
import util.storage as storage

jobs_route = APIRouter()


def do_task(session: Session, jobs):
    info = jobs["info"]
    if jobs["type"] == JobType.validate_data:
        file = storage.download(jobs["payload"])
        error = validate_excel_data(
            session=session,
            form=jobs["info"]["form_id"],
            administration=jobs["info"]["administration"],
            file=file)
        if len(error):
            info.update({"valid": False})
        else:
            info.update({"valid": True})
        print(error)
        jobs = crud.update(session=session,
                           id=jobs["id"],
                           status=JobStatus.done,
                           info=info)


@jobs_route.get("/jobs/start",
                response_model=JobsBase,
                summary="start pending jobs",
                name="jobs:start",
                tags=["Jobs"])
async def get(req: Request,
              background_tasks: BackgroundTasks,
              session: Session = Depends(get_session)):
    jobs = crud.pending(session=session)
    jobs = crud.update(session=session,
                       id=jobs["id"],
                       status=JobStatus.on_progress,
                       info=jobs["info"])
    if jobs:
        background_tasks.add_task(do_task, session=session, jobs=jobs)
    return jobs


@jobs_route.get("/jobs/status/{id:path}",
                response_model=Union[JobStatus],
                summary="get jobs by id",
                name="jobs:status",
                tags=["Jobs"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    jobs = crud.status(session=session, id=id)
    return jobs
