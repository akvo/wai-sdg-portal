import json
import os
import requests as r
import enum

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
source_path = os.environ["INSTANCE_NAME"]


class SurveyList(enum.Enum):
    wai_nepal = {
        "instances": [
            {"domain": "pilots", "forms": ["556240162", "554360198", "557950127"]},
            {
                "domain": "wai",
                "forms": [
                    "1323574110",
                    "1322834054",
                    "1260775092",
                    "1327205184",
                    "1338414049",
                ],
            },
        ],
        "child_forms": ["1322834054", "1260775092", "1327205184", "1338414049"],
        "administration": ["573330120", "567820007", "571300147", "1359274105"],
        "answer_list_type": [
            {"id": "1332184057", "list_from": "1260775116"},
            {"id": "1361834041", "list_from": "1260775116"},
            {"id": "1361884006", "list_from": "1260775116"},
            {"id": "1336894024", "list_from": "1260775116"},
        ],
        "skip_question": ["1260775107", "1260775115", "1260775108"],
    }
    wai_bangladesh = {
        "instances": [
            {
                "domain": "pilots",
                "forms": ["574850091", "557760069", "563280066"],
            }
        ],
        "administration": ["554180044", "567510081", "569130075"],
        "skip_question": [],
    }
    wai_ethiopia = {
        "instances": [
            {
                "domain": "pilots",
                "forms": [
                    "976564018",
                    "952774024",
                    "974754029",
                    "962774003",
                    "980804014",
                ],
            }
        ],
        "administration": [
            "1084694626",
            "1260775107",
            "1260775115",
            "1260775108",
            "1084684623",
        ],
        "skip_question": [],
    }


api = "https://tech-consultancy.akvo.org/akvo-flow-web-api/"
dest_folder = f"./source/{source_path}/forms"
if not os.path.exists(dest_folder):
    os.makedirs(dest_folder)
class_path = source_path.replace("-", "_")
source = SurveyList[class_path].value
instances = source["instances"]
answer_list_type = (
    [] if not source.get("answer_list_type") else source["answer_list_type"]
)
skip_answer_list_type = [x["id"] for x in answer_list_type]
skip_question_id = source["skip_question"] + source["administration"]
child_forms = source.get("child_forms") or []


def set_original(q, options, multiple_option):
    return {
        "id": int(q["id"]),
        "question": q["text"],
        "order": int(q["order"]),
        "meta": q["localeNameFlag"],
        "type": q["type"] if not multiple_option else "multiple_option",
        "required": q["mandatory"],
        "options": options if len(options) else None,
    }


def set_answer_type_list(q):
    if q["id"] in [int(s) for s in skip_answer_list_type]:
        option = list(filter(lambda x: int(x["id"]) == q["id"], answer_list_type))
        return {
            "id": int(q["id"]),
            "question": q["question"],
            "order": q["order"],
            "meta": True,
            "required": True,
            "type": "answer_list",
            "options": [{"name": int(o["list_from"])} for o in option],
        }
    return q


def set_options(q):
    options = []
    multiple_option = False
    if "options" in q:
        if "option" not in q["options"]:
            return [], False
        if type(q["options"]["option"]) == dict:
            options.append({"name": str(q["options"]["option"]["text"]), "color": None})
        else:
            for o in q["options"]["option"]:
                options.append({"name": str(o["text"]), "color": None})
        multiple_option = q["options"]["allowMultiple"]
    return options, multiple_option


def set_dependency(q, qs):
    if "dependency" in q:
        qs.update(
            {
                "dependency": [
                    {
                        "id": int(q["dependency"]["question"]),
                        "options": q["dependency"]["answer-value"].split("|"),
                    }
                ]
            }
        )
    return qs


def generate_form(form, child=False):
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
            # TRANSFORM FOR NEPAL
            question = set_answer_type_list(question)
            # END NEPAL
            if adm:
                if q["id"] in source["administration"] or q["type"] == "cascade":
                    administration.update(
                        {
                            "question": "location",
                            "order": int(q["order"]),
                            "required": True,
                            "type": "administration",
                            "meta": True,
                        }
                    )
                    question_group["questions"].append(administration)
                    adm = False
            if question["type"] == "free":
                question.update({"type": "text"})
                if "validationRule" in list(q):
                    if q["validationRule"]["validationType"] == "numeric":
                        question.update({"type": "number"})
                    if "maxVal" in q["validationRule"]:
                        rule.update({"max": q["validationRule"]["maxVal"]})
                    if "minVal" in q["validationRule"]:
                        rule.update({"min": q["validationRule"]["minVal"]})
            if question["type"] == "geo":
                question.update({"meta": True, "required": True})
            if len(list(rule)):
                question.update({"rule": rule})
            if q["id"] not in skip_question_id and q["type"] not in [
                "cascade",
                "photo",
            ]:
                if q["type"] == "option" and len(options) == 0:
                    pass
                else:
                    question_group["questions"].append(question)
        question_groups.append(question_group)
    return {"form": form_name, "id": form_id, "question_groups": question_groups}


for instance in instances:
    flow_instance = instance["domain"]
    for form_id in instance["forms"]:
        print(f"DOWNLOADING: {form_id}")
        form = r.get(f"{api}{flow_instance}/{form_id}/update")
        form = form.json()
        form_name = form["name"]
        file_name = form_id

        if type(form["questionGroup"]) == dict:
            form.update({"questionGroup": [form["questionGroup"]]})

        for qg in form["questionGroup"]:
            if type(qg["question"]) == dict:
                qg.update({"question": [qg["question"]]})

        if form_id in child_forms:
            file_name = f"child-{form_id}"
        with open(f"{dest_folder}/{file_name}.json", "w") as dest:
            res = generate_form(form, form_id in child_forms)
            form_name = res["form"]
            form_id = str(res["id"])
            dest.write(json.dumps(res, indent=2))
            print(f"DOWNLOADED : {form_id} - {form_name}")
