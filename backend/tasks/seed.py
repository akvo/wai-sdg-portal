import os
import gc
import pandas as pd
import time
from sqlalchemy.orm import Session
from db import crud_question
from db import crud_data
from db import crud_administration
from models.question import QuestionType
from models.data import Data
from models.answer import Answer
from datetime import datetime
from util.helper import HText
from AkvoResponseGrouper.views import refresh_view
# from memory_profiler import profile as memory


def save(session: Session, user: int, form: int, dp: dict, qs: dict):
    names = []
    parent_code = None
    data = Data(name=None,
                form=form,
                administration=None,
                geo=None,
                created_by=user,
                updated_by=None,
                created=datetime.now(),
                updated=None)
    for a in qs:
        aw = dp.get(a)
        if not aw:
            continue
        if aw != aw:
            continue
        if isinstance(aw, str):
            aw = HText(aw).clean
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
            data.administration = adm_list[-1].id
            answer.value = data.administration
            if q.meta:
                names.append(adm_list[-1].name)
        elif q.type == QuestionType.geo:
            if aw:
                try:
                    aw = aw.replace("(", "")
                    aw = aw.replace(")", "")
                except Exception:
                    pass
                geo = [float(g.strip()) for g in aw.split(",")]
                data.geo = geo
                answer.text = ("{}|{}").format(geo[0], geo[1])
            else:
                continue
        elif q.type == QuestionType.text:
            answer.text = aw
            if q.meta:
                names.append(aw)
        elif q.type == QuestionType.date:
            answer.text = aw
        elif q.type == QuestionType.number:
            try:
                aw = float(aw)
                answer.value = float(aw)
                if q.meta:
                    names.append(str(int(aw)))
            except ValueError:
                continue
        elif q.type == QuestionType.option:
            answer.options = [aw]
        elif q.type == QuestionType.multiple_option:
            answer.options = aw
        elif q.type == QuestionType.answer_list:
            parent = crud_data.get_data_by_name(session=session, name=aw)
            parent_code = parent.name.split(" - ")[-1]
            data.administration = parent.administration
            answer.value = int(parent_code)
        data.answer.append(answer)
    name = " - ".join([str(n) for n in names])
    if parent_code:
        name = f"{parent_code} - {name}"
    data.name = name
    session.add(data)
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
        for i, datapoint in enumerate(df.to_dict("records")):
            save(session=session,
                 user=user,
                 form=form,
                 dp=datapoint,
                 qs=questions)
            if i % 5 == 4:
                session.commit()
                time.sleep(1)
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
