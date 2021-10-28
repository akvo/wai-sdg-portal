import uvicorn
from db.connection import engine, Base
from fastapi import FastAPI

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

Base.metadata.create_all(bind=engine)


@worker.get("/", tags=["Dev"])
def read_main():
    return "OK"


@worker.get("/health-check", tags=["Dev"])
def health_check():
    return "OK"


if __name__ == "__worker__":
    uvicorn.run(worker, host="0.0.0.0", port=5001)
