import os
from time import process_time, sleep
from datetime import timedelta
from typing import Union
from fastapi import Depends, Request, BackgroundTasks, APIRouter
from sqlalchemy.orm import Session
import db.crud_jobs as crud
from db.connection import get_session
from models.jobs import JobsBase, JobType, JobStatus
from tasks import validation, seed
import util.storage as storage

jobs_route = APIRouter()


def print_log_start(message):
    print(message)
    return process_time()


def print_log_done(message, start_time):
    elapsed_time = process_time() - start_time
    elapsed_time = str(timedelta(seconds=elapsed_time)).split(".")[0]
    print(f"{message} DONE IN {elapsed_time}")


def run_seed(session: Session, jobs: dict):
    start_time = print_log_start("DATA SEEDER STARTED")
    info = jobs["info"]
    data = seed.seed(session=session,
                     file=storage.download(jobs["payload"]),
                     user=jobs["created_by"],
                     form=info["form_id"])
    status = JobStatus.done if len(data) else JobStatus.failed
    if (data):
        info.update({"records": len(data)})
    jobs = crud.update(session=session,
                       id=jobs["id"],
                       status=status,
                       info=info)
    print_log_done(f"SEEDER: {status}", start_time)


def run_validate(session: Session, jobs: dict):
    info = jobs["info"]
    start_time = print_log_start("DATA VALIDATION STARTED")
    error = validation.validate(session=session,
                                form=info["form_id"],
                                administration=info["administration"],
                                file=storage.download(jobs["payload"]))
    print(error)
    status = JobStatus.failed if len(error) else None
    jobs = crud.update(
        session=session,
        id=jobs["id"],
        type=None if len(error) else JobType.seed_data,
        status=status)
    print_log_done(f"VALIDATION {status}", start_time)
    if len(error) == 0:
        run_seed(session=session, jobs=jobs)


def do_task(session: Session, jobs):
    TESTING = os.environ.get("TESTING")
    if not TESTING:
        sleep(60)
    if jobs["type"] == JobType.validate_data:
        run_validate(session=session, jobs=jobs)
    if jobs["type"] == JobType.seed_data:
        run_seed(session=session, jobs=jobs)
    return True


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
                       status=JobStatus.on_progress)
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
