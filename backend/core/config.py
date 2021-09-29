import jwt
from fastapi import FastAPI, Request
from routes.administration import administration_route
from routes.user import user_route
from routes.form import form_route
from routes.question import question_route
from routes.data import data_route

app = FastAPI(
    root_path="/api",
    title="WAI - Ethiopia",
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
app.include_router(user_route)
app.include_router(form_route)
app.include_router(question_route)
app.include_router(data_route)


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
