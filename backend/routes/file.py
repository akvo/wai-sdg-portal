from sqlalchemy.orm import Session
from fastapi import Depends, Request, APIRouter
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer
from db.connection import get_session
from util import excel

security = HTTPBearer()
file_route = APIRouter()
ftype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'


@file_route.get("/download/excel-template/{id:path}",
                summary="get excel template for ",
                name="excel-template:get_by_form_id",
                tags=["Data"])
def add(req: Request,
        id: int,
        session: Session = Depends(get_session)):
    filepath = excel.generate_excel_template(session=session, form=id)
    filename = filepath.split("/")[-1]
    return FileResponse(path=filepath,
                        filename=filename,
                        media_type=ftype)
