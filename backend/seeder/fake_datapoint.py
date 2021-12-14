import os
import sys
import time
import json
import pandas as pd
from datetime import datetime
from faker import Faker
from db import crud_administration
from db import crud_form
from db import crud_user
from db import crud_data
from models.question import QuestionType
from models.answer import Answer
from models.user import UserRole
from db.connection import Base, SessionLocal, engine
from db.truncator import truncate
from source.geoconfig import GeoLevels

start_time = time.process_time()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()
source_path = os.environ["INSTANCE_NAME"]
class_path = source_path.replace("-", "_")
administration_level = [g["alias"] for g in GeoLevels[class_path].value]
config = GeoLevels[class_path].value
levels = [c["name"] for c in config]
source_geo = f"./source/{source_path}/topojson.json"
random_point_file = f"./source/{source_path}/random-points.csv"
random_point = os.path.exists(random_point_file)
sample_geo = False
if random_point:
    sample_geo = pd.read_csv(random_point_file)
    sample_geo = sample_geo.rename(columns={levels[-1]: "name"})
with open(source_geo, 'r') as geo:
    geo = json.load(geo)
    ob = geo["objects"]
    ob_name = list(ob)[0]
parent_administration = set([
    d[levels[-2]]
    for d in [p["properties"] for p in ob[ob_name]["geometries"]]
])
forms = crud_form.get_form(session=session)
forms = [f.id for f in forms]

if len(sys.argv) < 2:
    print("You should provide admin address")
    sys.exit()

if len(sys.argv) < 3:
    print("You should provide number of datapoints")
    sys.exit()


if len(sys.argv) == 4:
    fid = sys.argv[3]
    if fid not in forms:
        print(f"{fid} not found")
        sys.exit()
    forms = [fid]


user = crud_user.get_user_by_email(session=session, email=sys.argv[1])
if not user:
    print("{} user is not available")
    sys.exit()

if user.role != UserRole.admin:
    print("{} user is not admin")
    sys.exit()

for table in ["data", "answer", "history"]:
    action = truncate(session=session, table=table)
    print(action)

fake = Faker()


def get_random_administration(fake, session):
    fa = fake.random_choices(elements=parent_administration, length=1)
    administration = crud_administration.get_administration_by_name(
        session=session, name=fa[0])
    if not administration.children:
        return get_random_administration(fake, session)
    fa = fake.random_int(min=0, max=len(administration.children) - 1)
    return administration.children[fa]


def get_odf_value(status_verified, not_triggered):
    if status_verified:
        return ["Verified ODF"]
    if not status_verified and not not_triggered:
        return ["Triggered"]
    return ["Open Defecation"]


for form in forms:
    form = crud_form.get_form_by_id(session=session, id=form)
    repeats = int(sys.argv[2])
    for i in range(repeats):
        answers = []
        names = []
        administration = get_random_administration(fake, session)
        geo = None
        if random_point:
            geo = sample_geo[sample_geo['name'] == administration.name]
            if geo.shape[0]:
                geo = geo.to_dict("records")
                iloc = fake.random_int(min=0, max=len(geo) - 1)
                geo = [geo[iloc]['lat'], geo[iloc]['long']]
            else:
                geo = None
        # For ODF
        status_verified = fake.boolean()
        not_triggered = fake.boolean(chance_of_getting_true=5)
        for qg in form.question_group:
            for q in qg.question:
                value = False
                answer = Answer(question=q.id,
                                created_by=user.id,
                                created=datetime.now())
                if q.type in [
                        QuestionType.option, QuestionType.multiple_option
                ]:
                    fa = fake.random_int(min=0, max=len(q.option) - 1)
                    answer.options = [q.option[fa].name]
                    if q.id == 557700349:
                        answer.options = get_odf_value(status_verified,
                                                       not_triggered)
                    value = True
                if q.type == QuestionType.number:
                    fa = fake.random_int(min=10, max=50)
                    answer.value = fa
                    value = True
                if q.type == QuestionType.date:
                    fa = fake.date_this_century()
                    value = not not_triggered
                    # ODF
                    if q.id != 557690351:
                        fm = fake.random_int(min=11, max=12)
                        fd = fa.strftime("%d")
                        answer.text = f"2019-{fm}-{fd}"
                    if q.id == 557690351 and status_verified:
                        fm = fake.random_int(min=6, max=9)
                        fd = fa.strftime("%d")
                        answer.text = f"2021-{fm}-{fd}"
                        value = status_verified
                if q.type == QuestionType.geo and geo:
                    answer.text = ("{}|{}").format(geo[0], geo[1])
                if q.type == QuestionType.text:
                    fa = fake.text(max_nb_chars=10)
                    answer.text = fa
                    if q.meta:
                        fa = fake.company()
                        answer.text = fa
                        names.append(fa)
                    value = True
                if q.type == QuestionType.administration:
                    answer.value = administration.id
                    value = True
                    if q.meta:
                        names.append(administration.name)
                if value:
                    answers.append(answer)
        name = " - ".join(names)
        administration = administration.id
        data = crud_data.add_data(session=session,
                                  form=form.id,
                                  name=name,
                                  geo=geo,
                                  administration=administration,
                                  created_by=user.id,
                                  answers=answers)
    print(f"ADDED {repeats} datapoint to {form.name}")
