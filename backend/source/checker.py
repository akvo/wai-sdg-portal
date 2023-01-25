import sys
import json
import itertools
from db import crud_option
from db.connection import SessionLocal

session = SessionLocal()

if len(sys.argv) < 2:
    print("You should provide json file location")
    sys.exit()

json_file = open(sys.argv[1])
data = json.load(json_file)

for d in data:
    categories = [cs for cs in d["categories"]]
    items = [{k: v for k, v in c.items() if k != "name"} for c in categories]
    for x, y in itertools.combinations(items, 2):
        # 1. Check each category whether there is the same configuration or not
        if json.dumps(x, sort_keys=True) == json.dumps(y, sort_keys=True):
            print(d["name"], "| found duplicate configurations")
            exit()
    for category in categories:
        if "and" in category:
            # 2. Check for duplicate questions in and condition
            questions = [i["question"] for i in category["and"]]
            qs = set([q for q in questions if questions.count(q) > 1])
            if len(qs) > 0:
                print(category["name"], "duplicated questions:", questions)
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
            res = crud_option.get_options_if_exists(
                session=session, names=options, question=c["question"]
            )
            if len(res) != len(options):
                opd = [r[0] for r in res]
                ops = set(opd)
                diff = [o for o in options if o not in ops]
                print(
                    category["name"],
                    "|Question ID: ",
                    c["question"],
                    "| The following options are not in the database: ",
                    diff,
                )
