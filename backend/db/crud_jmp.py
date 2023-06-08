import json
from sqlalchemy.orm import Session
from AkvoResponseGrouper.views import get_categories


def get_jmp_table_view(session: Session, data: list, configs: list):
    ids = [d["id"] for d in data]
    try:
        gc = get_categories(session=session, data=ids)
    except Exception:
        gc = []
    for d in data:
        cs = list(filter(lambda c: (c["data"] == d["id"]), gc))
        categories = []
        for c in cs:
            labels = get_jmp_labels(configs=configs, name=c["name"])
            fl = list(
                filter(
                    lambda l: l["name"].lower() == str(c["category"]).lower(),
                    labels,
                )
            )
            color = None
            if len(fl):
                color = fl[0]["color"]
            categories.append(
                {
                    "key": c["name"].lower(),
                    "value": c["category"],
                    "color": color,
                }
            )
        d.update({"categories": categories})
    return data


def get_jmp_overview(
    session: Session, form: int, data: list, name: str = None
):
    try:
        ids = [d["id"] for d in data]
        gcs = get_categories(session=session, form=form, name=name, data=ids)
    except Exception:
        gcs = []
    for d in data:
        fc = list(filter(lambda c: (c["data"] == d["id"]), gcs))
        d.update({"categories": fc})
    return data


def get_jmp_config_by_form(form: int) -> list:
    try:
        with open("./.category.json", "r") as categories:
            json_config = json.load(categories)
    except Exception:
        json_config = []
    configs = list(filter(lambda c: c["form"] == form, json_config))
    return configs


def get_jmp_labels(configs: list, name: str) -> list:
    fl = list(filter(lambda l: l["name"].lower() == name.lower(), configs))
    labels = []
    if len(fl):
        labels = fl[0]["labels"]
    return labels
