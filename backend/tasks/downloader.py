import os
import pandas as pd
from db import crud_administration
from db import crud_data
from sqlalchemy.orm import Session
from util.helper import HText


def rearange_columns(col_names: list):
    col_question = list(filter(lambda x: HText(x).hasnum, col_names))
    col_names = [
        "id", "created_at", "created_by", "updated_at", "updated_by",
        "datapoint_name", "administration", "geolocation"
    ] + col_question
    return col_names


def download(session: Session, jobs: dict, file: str):
    info = jobs["info"]
    if os.path.exists(file):
        os.remove(file)
    administration_ids = False
    administration_name = "All Administration Level"
    if info["administration"]:
        administration_ids = crud_administration.get_administration_list(
            session=session, id=info["administration"])
        administration_name = crud_administration.get_administration_name(
            session=session, id=info["administration"])
    data = crud_data.download(session=session,
                              form=info["form_id"],
                              administration=administration_ids,
                              options=info["options"])
    df = pd.DataFrame(data)
    col_names = rearange_columns(list(df))
    df = df[col_names]
    writer = pd.ExcelWriter(file, engine='xlsxwriter')
    df.to_excel(writer, sheet_name='data', index=False)
    context = [{
        "context": "Form Name",
        "value": info["form_name"]
    }, {
        "context": "Download Date",
        "value": jobs["created"]
    }, {
        "context": "Administration",
        "value": administration_name
    }]
    for inf in info["tags"]:
        context.append({
            "context": "Filters",
            "value": inf["q"] + ": " + inf["o"]
        })
    context = pd.DataFrame(context).groupby(["context", "value"],
                                            sort=False).first()
    context.to_excel(writer, sheet_name='context', startrow=0, header=False)
    workbook = writer.book
    worksheet = writer.sheets['context']
    format = workbook.add_format({
        'align': 'left',
        'bold': False,
        'border': 0,
    })
    worksheet.set_column('A:A', 20, format)
    worksheet.set_column('B:B', 30, format)
    merge_format = workbook.add_format({
        'bold': True,
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'fg_color': '#45add9',
        'color': '#ffffff',
    })
    worksheet.merge_range('A1:B1', 'Context', merge_format)
    writer.save()
    return file
