import os
import pandas as pd
import humps
from db import crud_question, crud_form, crud_administration
from sqlalchemy.orm import Session


def generate_administration_sheet(session: Session):
    adm = crud_administration.get_administration(session=session)
    df = pd.DataFrame([a.serialize for a in adm])
    df["parent"] = df["parent"].fillna(0).astype(int)
    dict_id = df.set_index('id').parent.to_dict()

    def get_parent_id(anc):
        anc = [anc] if not isinstance(anc, list) else anc
        if anc[-1] == 0:
            return anc
        else:
            parent = get_parent_id([dict_id[anc[-1]]])
            anc += parent
            return anc

    dict_name = df.set_index('id').name.to_dict()
    df['path_id'] = df.id.apply(get_parent_id)
    df['parent'] = df.apply(
        lambda x:
        [dict_name[id_] for id_ in x.path_id if not (id_ == x.id or id_ == 0)],
        axis=1)
    df['parent'] = df['parent'].apply(lambda x: " | ".join(x))
    return df


def generate_definition_sheet(session: Session, form: int):
    definitions = crud_question.get_definition(session=session, form=form.id)
    df = pd.DataFrame(definitions)
    df["type"] = df["type"].apply(lambda x: str(x).split(".")[1])
    return df.groupby(["id", "question", "type", "option"]).first()


def generate_excel_template(session: Session, form: int):
    form = crud_form.get_form_by_id(session=session, id=form)
    questions = crud_question.get_excel_question(session=session, form=form.id)
    data = pd.DataFrame(columns=[q.to_excel_header for q in questions],
                        index=[0])
    form_name = humps.decamelize(form.name)
    filename = f"{form.id}-{form_name}"
    filepath = f"./tmp/{filename}.xlsx"
    if os.path.exists(filepath):
        os.remove(filepath)
    writer = pd.ExcelWriter(filepath, engine='xlsxwriter')
    data.to_excel(writer,
                  sheet_name='data',
                  startrow=1,
                  header=False,
                  index=False)
    workbook = writer.book
    worksheet = writer.sheets['data']
    header_format = workbook.add_format({
        'bold': True,
        'text_wrap': True,
        'valign': 'top',
        'border': 1
    })
    for col_num, value in enumerate(data.columns.values):
        worksheet.write(0, col_num, value, header_format)
    definitions = generate_definition_sheet(session=session, form=form)
    definitions.to_excel(writer,
                         sheet_name='definitions',
                         startrow=0,
                         header=False)
    administration = pd.read_csv("./source/administration-cascade.csv")
    administration["administration"] = administration[
        "parent"] + "|" + administration["name"]
    administration = administration[["administration"]]
    administration.to_excel(writer,
                            sheet_name='administration',
                            startrow=0,
                            header=False,
                            index=False)
    writer.save()
    return filepath
