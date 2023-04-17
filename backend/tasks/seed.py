import os
import gc
import pandas as pd
from sqlalchemy.orm import Session
from db import crud_question
from db import crud_data
from db import crud_administration
from models.question import QuestionType
from models.answer import Answer
from datetime import datetime
from util.helper import HText
from AkvoResponseGrouper.views import refresh_view
# from memory_profiler import profile as memory


def save(session: Session, user: int, form: int, dp: dict, qs: dict):
    administration = None
    geo = None
    answerlist = []
    names = []
    parent_code = None
    for a in qs:
        aw = dp[a]
        if aw != aw:
            continue
        if isinstance(aw, str):
            aw = HText(aw).clean
        valid = True
        q = qs[a]
        answer = Answer(question=q.id, created_by=user, created=datetime.now())
        if q.type == QuestionType.administration:
            adms = aw.split("|")
            adm_list = []
            for ix, adm in enumerate(adms):
                if len(adm_list):
                    parent = adm_list[ix - 1]
                    adm_list.append(
                        crud_administration.get_administration_by_name(
                            session, name=adm, parent=parent.id))
                else:
                    adm_list.append(
                        crud_administration.get_administration_by_name(
                            session, name=adm))
            administration = adm_list[-1].id
            answer.value = administration
            if q.meta:
                names.append(adm_list[-1].name)
        if q.type == QuestionType.geo:
            if aw:
                try:
                    aw = aw.replace("(", "")
                    aw = aw.replace(")", "")
                except Exception:
                    pass
                geo = [float(g.strip()) for g in aw.split(",")]
                answer.text = ("{}|{}").format(geo[0], geo[1])
            else:
                valid = False
        if q.type == QuestionType.text:
            answer.text = aw
            if q.meta:
                names.append(aw)
        if q.type == QuestionType.date:
            if aw:
                answer.text = aw
            else:
                valid = False
        if q.type == QuestionType.number:
            try:
                aw = float(aw)
                valid = True
            except ValueError:
                valid = False
            if valid:
                answer.value = float(aw)
                if q.meta:
                    names.append(str(int(aw)))
        if q.type == QuestionType.option:
            answer.options = [aw]
        if q.type == QuestionType.multiple_option:
            answer.options = aw
        if q.type == QuestionType.answer_list:
            parent = crud_data.get_data_by_name(session=session, name=aw)
            parent_code = parent.name.split(" - ")[-1]
            administration = parent.administration
            answer.value = int(parent_code)
            valid = True
        if valid:
            answerlist.append(answer)
    name = " - ".join([str(n) for n in names])
    if parent_code:
        name = f"{parent_code} - {name}"
    crud_data.bulk_add_data(session=session,
                            form=form,
                            name=name,
                            geo=geo,
                            administration=administration,
                            created_by=user,
                            answers=answerlist)
    gc.collect()
    return


# @memory
def seed(session: Session, file: str, user: int, form: int):
    try:
        df = pd.read_excel(file, sheet_name="data")
        questions = {
            q.id: q
            for q in crud_question.get_question_by_form_id(session=session,
                                                           fid=form)
        }
        df = df.rename(columns={d: int(d.split("|")[0])
                                for d in list(df.columns)})
        total_data = 0
        for datapoint in df.to_dict("records"):
            save(session=session,
                 user=user,
                 form=form,
                 dp=datapoint,
                 qs=questions)
            total_data += 1
        gc.collect()
        os.remove(file)
        TESTING = os.environ.get("TESTING")
        if not TESTING:
            refresh_view(session=session)
        return total_data
    except Exception as e:
        print("SEEDER ERROR", str(e))
        return None
