import uuid
import aiofiles
from xlrd import open_workbook, XLRDError
from sqlalchemy.orm import Session
from fastapi import Depends, Request, APIRouter, HTTPException
from fastapi import File, UploadFile
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer
from db.connection import get_session
from util import excel, storage


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


@file_route.get("/download/excel-template/{id:path}",
                summary="get excel template for ",
                name="excel-template:get_by_form_id",
                tags=["Data"])
def get(req: Request, id: int, session: Session = Depends(get_session)):
    filepath = excel.generate_excel_template(session=session, form=id)
    filename = filepath.split("/")[-1]
    return FileResponse(path=filepath, filename=filename, media_type=ftype)


@file_route.post("/upload/excel-template",
                 summary="post excel file",
                 name="excel-template:post",
                 tags=["Data"])
async def upload(file: UploadFile = File(...),
                 session: Session = Depends(get_session)):
    if file.content_type != ftype:
        raise HTTPException(status_code=404, detail="Not Valid Excel File")
    out_file = str(uuid.uuid4())
    out_file = f"{out_file_path}{out_file}.xlsx"
    async with aiofiles.open(out_file, 'wb') as of:
        contents = await file.read()
        await of.write(contents)
    uploaded_file = test_excel(out_file)
    return {"original_file": uploaded_file}
