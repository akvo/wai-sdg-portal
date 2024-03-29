import os
import pandas as pd
from db import crud_administration
from db import crud_data
from db import crud_question
from db import crud_jmp
from sqlalchemy.orm import Session
from util.helper import HText


DEFAULT_COL_NAMES = col_names = [
    "id",
    "created_at",
    "created_by",
    "updated_at",
    "updated_by",
    "datapoint_name",
    "administration",
    "geolocation",
]


def rearange_columns(col_names: list, jmp_category_columns: list = []):
    col_question = list(filter(lambda x: HText(x).hasnum, col_names))
    col_names = DEFAULT_COL_NAMES + jmp_category_columns + col_question
    return col_names


def download(session: Session, jobs: dict, file: str):
    info = jobs["info"]
    # get JMP config
    jmp_config = crud_jmp.get_jmp_config_by_form(form=info["form_id"])
    jmp_category_names = [jc["name"] for jc in jmp_config]
    if os.path.exists(file):
        os.remove(file)
    administration_ids = False
    administration_name = "All Administration Level"
    if info["administration"]:
        administration_ids = crud_administration.get_administration_list(
            session=session, id=info["administration"]
        )
        administration_name = crud_administration.get_administration_name(
            session=session, id=info["administration"]
        )
    data = crud_data.download(
        session=session,
        form=info["form_id"],
        administration=administration_ids,
        options=info["options"],
    )
    # add JMP values to data
    if data:
        for jc in jmp_category_names:
            data = crud_jmp.get_jmp_overview(
                session=session, form=info["form_id"],
                data=data, name=jc.lower())
            for d in data:
                if len(d["categories"]):
                    d[jc] = d["categories"][0]["category"]
                else:
                    d[jc] = ""
                d.pop("categories")
    # transform to pandas df
    df = pd.DataFrame(data)
    questions = crud_question.get_excel_headers(
        session=session, form=info["form_id"])
    # adding columns if no data defined
    if not data:
        for col in DEFAULT_COL_NAMES:
            if col not in list(df):
                df[col] = ""
        for jc in jmp_category_names:
            if jc not in list(df):
                df[jc] = ""
    for q in questions:
        if q not in list(df):
            df[q] = ""
    col_names = rearange_columns(
        col_names=questions, jmp_category_columns=jmp_category_names)
    df = df[col_names]
    writer = pd.ExcelWriter(file, engine="xlsxwriter")
    df.to_excel(writer, sheet_name="data", index=False)
    context = [
        {"context": "Form Name", "value": info["form_name"]},
        {"context": "Download Date", "value": jobs["created"]},
        {"context": "Administration", "value": administration_name},
    ]
    for inf in info["tags"]:
        context.append({
            "context": "Filters", "value": inf["q"] + ": " + inf["o"]
        })
    context = pd.DataFrame(context).groupby(
        ["context", "value"], sort=False).first()
    context.to_excel(writer, sheet_name="context", startrow=0, header=False)
    workbook = writer.book
    worksheet = writer.sheets["context"]
    format = workbook.add_format(
        {
            "align": "left",
            "bold": False,
            "border": 0,
        }
    )
    worksheet.set_column("A:A", 20, format)
    worksheet.set_column("B:B", 30, format)
    merge_format = workbook.add_format(
        {
            "bold": True,
            "border": 1,
            "align": "center",
            "valign": "vcenter",
            "fg_color": "#45add9",
            "color": "#ffffff",
        }
    )
    worksheet.merge_range("A1:B1", "Context", merge_format)
    writer.save()
    return file, context
