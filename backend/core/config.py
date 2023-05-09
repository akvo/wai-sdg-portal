import os
import jwt
from jsmin import jsmin
from functools import lru_cache
from pydantic import BaseSettings
from fastapi import FastAPI, Request, Response
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from routes.administration import administration_route
from routes.organisation import organisation_route
from routes.user import user_route
from routes.form import form_route
from routes.question import question_route
from routes.data import data_route
from routes.project import project_route
from routes.maps import maps_route
from routes.chart import chart_route
from routes.file import file_route
from routes.log import log_route
from routes.option import option_route
from routes.hint import hint_route
from routes.jobs import jobs_route
from source.geoconfig import GeoLevels
from AkvoResponseGrouper.routes import collection_route

INSTANCE_NAME = os.environ["INSTANCE_NAME"]
SANDBOX_DATA_SOURCE = os.environ.get("SANDBOX_DATA_SOURCE")
if SANDBOX_DATA_SOURCE:
    INSTANCE_NAME = SANDBOX_DATA_SOURCE
CONFIG_NAME = INSTANCE_NAME.replace("-", "_")
SOURCE_PATH = f"./source/{INSTANCE_NAME}"
JS_FILE = f"{SOURCE_PATH}/config"
JS_FILE = jsmin(open(f"{JS_FILE}.js").read())
GEO_CONFIG = GeoLevels[CONFIG_NAME].value
JS_i18n_FILE = f"{SOURCE_PATH}/i18n"
JS_i18n_FILE = jsmin(open(f"{JS_i18n_FILE}.js").read())

MINJS = jsmin(
    "".join(
        [
            "var levels=" + str([g["alias"] for g in GEO_CONFIG]) + ";"
            "var map_config={shapeLevels:"
            + str([g["name"] for g in GEO_CONFIG])
            + "};",
            "var topojson=",
            open(f"{SOURCE_PATH}/topojson.json").read(),
            ";",
            JS_FILE,
            JS_i18n_FILE,
        ]
    )
)
JS_FILE = f"{SOURCE_PATH}/config.min.js"
open(JS_FILE, "w").write(MINJS)


class Settings(BaseSettings):
    domain: str = os.environ["WEBDOMAIN"]
    instance_name: str = INSTANCE_NAME
    source_path: str = SOURCE_PATH
    js_file: str = JS_FILE


settings = Settings()
app = FastAPI(
    root_path="/api",
    title=INSTANCE_NAME.upper(),
    instance_name=INSTANCE_NAME,
    description="Auth Client ID: 99w2F1wVLZq8GqJwZph1kE42GuAZFvlF",
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

origins = ["http://localhost:3000"]
methods = ["GET"]
if INSTANCE_NAME == "wai-demo":
    origins = ["*"]
    methods = ["GET", "POST"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=methods,
    allow_headers=["*"],
)

app.include_router(administration_route)
app.include_router(organisation_route)
app.include_router(user_route)
app.include_router(form_route)
app.include_router(question_route)
app.include_router(option_route)
app.include_router(data_route)
app.include_router(maps_route)
app.include_router(chart_route)
app.include_router(file_route)
app.include_router(project_route)
app.include_router(log_route)
app.include_router(hint_route)
app.include_router(jobs_route)
app.include_router(collection_route)


@lru_cache()
def get_setting():
    return Settings()


@app.get(
    "/config.js",
    response_class=FileResponse,
    tags=["Config"],
    name="config.js",
    description="static javascript config",
)
async def main(res: Response):
    res.headers["Content-Type"] = "application/x-javascript; charset=utf-8"
    return settings.js_file


@app.get("/", tags=["Dev"])
def read_main():
    return "OK"


@app.get("/health-check", tags=["Dev"])
def health_check():
    return "OK"


@app.middleware("http")
async def route_middleware(request: Request, call_next):
    auth = request.headers.get("Authorization")
    if auth:
        auth = jwt.decode(
            auth.replace("Bearer ", ""), options={"verify_signature": False}
        )
        request.state.authenticated = auth
    response = await call_next(request)
    return response
