import aiofiles
from datetime import datetime
from xlrd import open_workbook, XLRDError
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import Depends, Request, APIRouter, Query, HTTPException
from fastapi.security import HTTPBasicCredentials as credentials
from fastapi import File, UploadFile
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer
from db.connection import get_session
from db.crud_form import get_form_name
from util import excel, storage
from util.helper import UUID
import db.crud_jobs as jobs
from models.jobs import JobsBase, JobType
from middleware import verify_editor, check_query


def test_excel(file):
    try:
        open_workbook(file)
        return storage.upload(file, "test")
    except XLRDError:
        raise HTTPException(status_code=404, detail="Not Valid Excel File")


out_file_path = "./tmp/"
security = HTTPBearer()
file_route = APIRouter()
ftype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'


@file_route.get("/excel-template/{form_id:path}",
                summary="get excel template for ",
                name="excel-template:get_by_form_id",
                tags=["File"])
def get(req: Request,
        form_id: int,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    verify_editor(req.state.authenticated, session)
    filepath = excel.generate_excel_template(session=session, form=form_id)
    filename = filepath.split("/")[-1]
    return FileResponse(path=filepath, filename=filename, media_type=ftype)


@file_route.post("/excel-template/{form_id:path}/{administration:path}",
                 response_model=JobsBase,
                 summary="post excel file",
                 name="excel-template:post",
                 tags=["File"])
async def upload(req: Request,
                 form_id: int,
                 administration: int,
                 file: UploadFile = File(...),
                 session: Session = Depends(get_session),
                 credentials: credentials = Depends(security)):
    user = verify_editor(req.state.authenticated, session)
    if file.content_type != ftype:
        raise HTTPException(status_code=404, detail="Not Valid Excel File")
    form_name = get_form_name(session=session, id=form_id)
    today = datetime.today().strftime("%y%m%d")
    out_file = UUID(f"{form_name}-{today}").str
    out_file = f"{out_file_path}U{out_file}.xlsx"
    async with aiofiles.open(out_file, 'wb') as of:
        contents = await file.read()
        await of.write(contents)
    uploaded_file = test_excel(out_file)
    res = jobs.add(session=session,
                   payload=uploaded_file,
                   info={
                       "form_id": form_id,
                       "administration": administration
                   },
                   type=JobType.validate_data,
                   created_by=user.id)
    return res


@file_route.get("/download/data",
                response_model=JobsBase,
                summary="download data",
                name="excel-data:download",
                tags=["File"])
async def download(req: Request,
                   form_id: int,
                   session: Session = Depends(get_session),
                   administration: Optional[int] = None,
                   q: Optional[List[str]] = Query(None),
                   credentials: credentials = Depends(security)):
    options = check_query(q) if q else None
    user = verify_editor(req.state.authenticated, session)
    form_name = get_form_name(session=session, id=form_id)
    today = datetime.today().strftime("%y%m%d")
    out_file = UUID(f"{form_name}-{today}").str
    res = jobs.add(session=session,
                   payload=f"D{out_file}.xlsx",
                   info={
                       "form_id": form_id,
                       "administration": administration,
                       "options": options
                   },
                   type=JobType.download,
                   created_by=user.id)
    return res
