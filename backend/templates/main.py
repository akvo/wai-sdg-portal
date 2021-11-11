from typing import Optional
from fastapi import Depends, Request, APIRouter
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from db.connection import get_session
from jinja2 import Environment, FileSystemLoader
from util.mailer import generate_icon

loader = FileSystemLoader('.')
env = Environment(loader=loader)
html = env.get_template("./templates/main.html")
template_route = APIRouter()


@template_route.get("/template/email",
                    response_class=HTMLResponse,
                    summary="get email template",
                    name="template:email",
                    tags=["Template"])
def get_by_id(req: Request,
              title: str,
              body: str,
              image: Optional[str] = None,
              color: Optional[str] = None,
              message: Optional[str] = None,
              session: Session = Depends(get_session)):
    if image:
        image = generate_icon(image, color)
    return html.render(logo="/wai-logo.png",
                       title=title,
                       body=body,
                       image=image,
                       message=message)
