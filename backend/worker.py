import uvicorn
from db.connection import engine, Base
from db.connection import get_db_url
from fastapi import FastAPI
from fastapi_utils.session import FastAPISessionMaker
from fastapi_utils.tasks import repeat_every
from routes.jobs import jobs_route
from models.jobs import JobStatus
from db.crud_jobs import pending, update, is_not_busy
from tasks.main import do_task

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
Base.metadata.create_all(bind=engine)
sessionmaker = FastAPISessionMaker(get_db_url())


@worker.get("/", tags=["Dev"])
def read_main():
    return "READY"


@worker.get("/health-check", tags=["Dev"])
def health_check():
    return "OK"


@worker.on_event("startup")
@repeat_every(seconds=10)
async def start() -> None:
    with sessionmaker.context_session() as session:
        pending_jobs = None
        if is_not_busy(session=session):
            pending_jobs = pending(session=session)
        if pending_jobs:
            jobs = update(session=session,
                          id=pending_jobs,
                          status=JobStatus.on_progress)
            do_task(session=session, jobs=jobs)


if __name__ == "__main__":
    uvicorn.run(worker, host="0.0.0.0", port=5001)
