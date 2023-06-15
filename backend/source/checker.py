import sys
import json
import itertools
from db import crud_option
from db import crud_question
from db.connection import SessionLocal

session = SessionLocal()

if len(sys.argv) < 2:
    print("You should provide json file location")
    sys.exit()

with open(sys.argv[1], "r") as cf:
    data = json.load(cf)

for d in data:
    categories = [cs for cs in d["categories"]]
    items = [{k: v for k, v in c.items() if k != "name"} for c in categories]
    for x, y in itertools.combinations(items, 2):
        # 1. Check each category whether there is the same configuration or not
        if json.dumps(x, sort_keys=True) == json.dumps(y, sort_keys=True):
            duplicate = [sb for subv in list(x.values()) for sb in subv][0]
            print(
                "POTENTIAL DUPLICATE:",
                d["name"],
                "| QUESTION ID: ",
                duplicate["question"],
                "| options: ",
                duplicate["options"],
            )
            sys.exit()
    for category in categories:
        if "and" in category:
            # 2. Check for duplicate questions in and condition
            questions = [i["question"] for i in category["and"]]
            qs = set([q for q in questions if questions.count(q) > 1])
            if len(qs) > 0:
                for op1, op2 in itertools.combinations(category["and"], 2):
                    if op1 == op2:
                        print(
                            "POTENTIAL DUPLICATE:",
                            d["name"],
                            "|",
                            category["name"],
                            "| QUESTION ID: ",
                            list(set(questions)),
                        )
                        sys.exit()

                print("SWITCH AND to OR in:", d["name"], "|", category["name"])
                sys.exit()

        conditions = (
            category["and"]
            if "and" in category
            else category["or"]
            if "or" in category["or"]
            else []
        )
        # 3. check if the defined options exist in the database
        for c in conditions:
            options = [o.replace("''", "'") for o in c["options"]]
            fq = crud_question.get_question_by_id(session=session, id=c["question"])
            if fq is None:
                print(
                    "QUESTION ID NOT FOUND:",
                    d["name"],
                    "|",
                    category["name"],
                    "| QUESTION ID: ",
                    c["question"],
                )
                exit()
            res = crud_option.get_options_if_exists(
                session=session, names=options, question=c["question"]
            )
            if len(res) != len(options):
                opd = [r[0] for r in res]
                ops = set(opd)
                diff = [o for o in options if o not in ops]
                print(
                    "OPTIONS NOT FOUND:",
                    d["name"],
                    "|",
                    category["name"],
                    "|Question ID: ",
                    c["question"],
                    "| Options: ",
                    diff,
                )
