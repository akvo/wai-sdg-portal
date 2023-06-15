import uvicorn
from os import environ
from datetime import datetime, timedelta
from db.connection import engine, Base
from db.connection import get_db_url
from fastapi import FastAPI
from fastapi_utils.session import FastAPISessionMaker
from fastapi_utils.tasks import repeat_every
from routes.jobs import jobs_route
from templates.main import template_route
from models.jobs import JobStatus
from db.crud_jobs import pending, update, on_progress, is_not_busy

# from tasks.main import do_task, force_remove_task
from tasks.main import do_task
from util.log import write_log

TESTING = environ.get("TESTING")

worker = FastAPI(
    root_path="/worker",
    title="Worker Service",
    version="1.0.0",
    contact={
        "name": "Akvo",
        "url": "https://akvo.org",
        "email": "dev@akvo.org",
    },
    license_info={
        "name": "AGPL3",
        "url": "https://www.gnu.org/licenses/agpl-3.0.en.html",
    },
)

worker.include_router(jobs_route)
worker.include_router(template_route)
Base.metadata.create_all(bind=engine)
sessionmaker = FastAPISessionMaker(get_db_url())
timeout = 60
repeat_seconds = 10 if TESTING else 30


@worker.get("/", tags=["Dev"])
def read_main():
    return "READY"


@worker.get("/health-check", tags=["Dev"])
def health_check():
    return "OK"


@worker.on_event("startup")
@repeat_every(seconds=30)
async def start() -> None:
    with sessionmaker.context_session() as session:
        pending_jobs = None
        op_jobs = on_progress(session=session)
        if is_not_busy(session=session):
            pending_jobs = pending(session=session)
        if op_jobs:
            given_time = op_jobs.created + timedelta(minutes=timeout)
            max_timeout = (datetime.now() - given_time).total_seconds() / 60.0
            if max_timeout > timeout:
                # force_remove_task(session=session, jobs=op_jobs.serialize)
                write_log("ERROR", f"{op_jobs.id}: {op_jobs.type} is removed")
        if pending_jobs:
            jobs = update(
                session=session, id=pending_jobs, status=JobStatus.on_progress
            )
            do_task(session=session, jobs=jobs)


if __name__ == "__main__":
    uvicorn.run(worker, host="0.0.0.0", port=5001, reload=False)
