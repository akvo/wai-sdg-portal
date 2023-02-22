from sqlalchemy.orm import Session
from typing import List
from AkvoResponseGrouper.views import get_categories
from models.data import DataDict, Data

# Workaround while WAI to AkvoResponseGrouper migration is in progress
config_items = [
    {
        "formId": 557950127,
        "questions": [
            {"question": 578820188, "name": "Water"},
            {"question": 578820187, "name": "Sanitation"},
            {"question": 578820186, "name": "Hygiene"},
            {"question": 578820189, "name": "Waste Management"},
            {"question": 578820190, "name": "Environmental Cleaning"},
        ],
    },
    {
        "formId": 554360198,
        "questions": [
            {"question": 573300191, "name": "Water"},
            {"question": 573300189, "name": "Sanitation"},
            {"question": 573300190, "name": "Hygiene"},
        ],
    },
    {
        "formId": 556240162,
        "questions": [
            {"question": 569340077, "name": "Water"},
            {"question": 569340075, "name": "Sanitation"},
            {"question": 569340076, "name": "Hygiene"},
        ],
    },
]


def transform_to_answer(q: dict, categories: list):
    value = list(filter(lambda v: v["name"] == q["name"], categories)).pop()
    return {
        "history": False,
        "question": q["question"],
        "value": value["category"] if "category" in value else None,
    }


def get_jmp_as_table_view(
    session: Session, form: int, data: List[DataDict]
) -> List[DataDict]:
    config = list(filter(lambda c: c["formId"] == form, config_items))
    if len(config):
        config = config[0]
        gc = get_categories(session=session, form=form)
        ql = [c["question"] for c in config["questions"]]
        for d in data:
            answer = list(
                filter(lambda x: (x["question"] not in ql), d["answer"])
            )
            categories = list(filter(lambda s: (s["data"] == d["id"]), gc))
            levels = list(
                map(
                    lambda q: transform_to_answer(q=q, categories=categories),
                    config["questions"],
                )
            )
            d.update({"answer": answer + levels})
    return data


def get_jmp_overview(session: Session, form: int, name: str):
    try:
        gc = get_categories(session=session, form=form, name=name)
        data = session.query(Data).filter(Data.form == form).all()
        data = [
            {"id": d.id, "administration": d.administration, "geo": d.geo}
            for d in data
        ]
        for d in data:
            fc = list(filter(lambda c: (c["data"] == d["id"]), gc))
            if len(fc):
                d.update(fc[0])
        return data
    except Exception:
        return []
