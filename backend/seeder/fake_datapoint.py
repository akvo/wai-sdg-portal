import os
import sys
import time
import json
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
with open(source_geo, 'r') as geo:
    geo = json.load(geo)
    ob = geo["objects"]
    ob_name = list(ob)[0]
parent_administration = set([
    d[levels[-2]]
    for d in [p["properties"] for p in ob[ob_name]["geometries"]]
])

if len(sys.argv) < 2:
    print("You should provide admin address")
    sys.exit()

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

forms = crud_form.get_form(session=session)
fake = Faker()


def get_random_administration(fake, session):
    fa = fake.random_choices(elements=parent_administration, length=1)
    administration = crud_administration.get_administration_by_name(
        session=session, name=fa[0])
    if not administration.children:
        return get_random_administration(fake, session)
    fa = fake.random_int(min=0, max=len(administration.children) - 1)
    return administration.children[fa]


for form in forms:
    form = crud_form.get_form_by_id(session=session, id=form.id)
    repeats = 10
    if len(sys.argv) > 2:
        repeats = int(sys.argv[2])
    for i in range(repeats):
        answers = []
        names = []
        administration = get_random_administration(fake, session)
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
                    # ODF
                    if q.id not in [557700349]:
                        answer.options = [q.option[fa].name]
                    if q.id == 557700349:
                        if status_verified:
                            answer.options = ["Verified ODF"]
                        if not status_verified and not not_triggered:
                            answer.options = ["Triggered"]
                        if not_triggered:
                            answer.options = ["Open Defecation"]
                    value = True
                if q.type == QuestionType.number:
                    fa = fake.random_int(min=1, max=20)
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
                    names.append(administration.name)
                    value = True
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
