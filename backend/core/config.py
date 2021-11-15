import os
import jwt
from jsmin import jsmin
from functools import lru_cache
from pydantic import BaseSettings
from fastapi import FastAPI, Request, Response
from fastapi.responses import FileResponse
from routes.administration import administration_route
from routes.organisation import organisation_route
from routes.user import user_route
from routes.form import form_route
from routes.question import question_route
from routes.data import data_route
from routes.maps import maps_route
from routes.chart import chart_route
from routes.file import file_route
from routes.log import log_route

instance_name = os.environ["WEBDOMAIN"].replace("https://", "").split(".")[0]
source_path = f"./source/{instance_name}"
js_file = f"{source_path}/config"
minjs = jsmin(open(f"{js_file}.js").read())
minjs += jsmin("".join(
    ["var topojson=",
     open(f"{source_path}/topojson.json").read(), ";"]))
js_file = f"{source_path}/config.min.js"
open(js_file, 'w').write(minjs)


class Settings(BaseSettings):
    domain: str = os.environ["WEBDOMAIN"]
    instance_name: str = instance_name
    source_path: str = source_path
    js_file: str = js_file


settings = Settings()
app = FastAPI(
    root_path="/api",
    title="WAI - Ethiopia",
    instance_name=instance_name,
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

app.include_router(administration_route)
app.include_router(organisation_route)
app.include_router(user_route)
app.include_router(form_route)
app.include_router(question_route)
app.include_router(data_route)
app.include_router(maps_route)
app.include_router(chart_route)
app.include_router(file_route)
app.include_router(log_route)


@lru_cache()
def get_setting():
    return Settings()


@app.get("/config.js",
         response_class=FileResponse,
         tags=["Config"],
         name="config.js",
         description="static javascript config")
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
    auth = request.headers.get('Authorization')
    if auth:
        auth = jwt.decode(auth.replace("Bearer ", ""),
                          options={"verify_signature": False})
        request.state.authenticated = auth
    response = await call_next(request)
    return response
