import json
import os
import requests as r
import enum

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
source_path = os.environ["INSTANCE_NAME"]


class SurveyList(enum.Enum):
    wai_bangladesh = {
        'domain': 'wai',
        'formIds': ['1189144226', '994944020', '964754042'],
        'administration': ['1183264177', '1183264172']
    }
    wai_nepal = {
        'domain':
        'wai',
        'formIds': [
            '974754029', '962774003', '980804014', '1183264175', '1327205184',
            '1323574110'
        ],
        'administration': []
    }


api = "https://tech-consultancy.akvo.org/akvo-flow-web-api/"
dest_folder = f"./source/{source_path}/forms"
if not os.path.exists(dest_folder):
    os.makedirs(dest_folder)
class_path = source_path.replace("-", "_")
source = SurveyList[class_path].value
flow_instance = source["domain"]
form_ids = source["formIds"]


def set_original(q, options, multiple_option):
    return {
        "id": int(q["id"]),
        "question": q["text"],
        "order": int(q["order"]),
        "meta": q["localeNameFlag"],
        "type": q["type"] if not multiple_option else "multiple_option",
        "required": q["mandatory"],
        "options": options if len(options) else None
    }


def set_options(q):
    options = []
    multiple_option = False
    if "options" in q:
        if type(q["options"]["option"]) == dict:
            options.append({
                "name": str(q["options"]["option"]["text"]),
                "color": None
            })
        else:
            for o in q["options"]["option"]:
                options.append({"name": str(o["text"]), "color": None})
        multiple_option = q["options"]["allowMultiple"]
    return options, multiple_option


def set_dependency(q, qs):
    if "dependency" in q:
        qs.update({
            "dependency": [{
                "id":
                int(q["dependency"]["question"]),
                "options":
                q["dependency"]["answer-value"].split("|")
            }]
        })
    return qs


def generate_form(form):
    question_groups = []
    for qg in form["questionGroup"]:
        question_group = {"question_group": qg["heading"], "questions": []}
        adm = True
        for q in qg["question"]:
            administration = {}
            rule = {}
            options, multiple_option = set_options(q)
            question = set_original(q, options, multiple_option)
            question = set_dependency(q, question)
            if adm:
                if q["id"] in source["administration"] or q[
                        "type"] == "cascade":
                    administration.update({
                        "question": "location",
                        "order": int(q["order"]),
                        "required": True,
                        "type": "administration",
                        "meta": True
                    })
                    question_group["questions"].append(administration)
                    adm = False
            if q["type"] == "free":
                question.update({"type": "text"})
                if "validationRule" in list(q):
                    if q["validationRule"]["validationType"] == "numeric":
                        question.update({"type": "number"})
                    if "maxVal" in q["validationRule"]:
                        rule.update({"max": q["validationRule"]["maxVal"]})
                    if "minVal" in q["validationRule"]:
                        rule.update({"min": q["validationRule"]["minVal"]})
            if q["type"] == "geo":
                question.update({"meta": True, "required": True})
            if len(list(rule)):
                question.update({"rule": rule})
            if q["id"] not in source["administration"] and q["type"] not in [
                    "cascade", "photo"
            ]:
                question_group["questions"].append(question)
        question_groups.append(question_group)
    return {
        "form": form_name,
        "id": int(form_id),
        "question_groups": question_groups
    }


for form_id in form_ids:
    print(f"DOWNLOADING: {form_id}")
    form = r.get(f"{api}{flow_instance}/{form_id}/update")
    form = form.json()
    form_name = form["name"]

    if type(form["questionGroup"]) == dict:
        form.update({"questionGroup": [form["questionGroup"]]})

    for qg in form["questionGroup"]:
        if type(qg["question"]) == dict:
            qg.update({"question": [qg["question"]]})

    with open(f"{dest_folder}/{form_id}.json", "w") as dest:
        res = generate_form(form)
        form_name = res["form"]
        form_id = str(res["id"])
        dest.write(json.dumps(res, indent=2))
        print(f"DOWNLOADED : {form_id} - {form_name}")
