import os
import json
import pandas as pd
from db.truncator import truncate
from db.crud_administration import add_administration
from models.administration import Administration
from db.connection import SessionLocal
from source.geoconfig import GeoLevels

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
source_path = os.environ["INSTANCE_NAME"]
SANDBOX_DATA_SOURCE = os.environ.get("SANDBOX_DATA_SOURCE")
if SANDBOX_DATA_SOURCE:
    source_path = SANDBOX_DATA_SOURCE
session = SessionLocal()
class_path = source_path.replace("-", "_")
source_file = f"./source/{source_path}/topojson.json"
action = truncate(session=session, table="administration")
print(action)


def get_parent_id(df, x):
    if x["l"] == 0:
        return None
    parent_level = x["l"] - 1
    pid = df[(df["l"] == parent_level) & (df["name"] == x["p"])]
    pid = pid.to_dict("records")[0]
    return pid["id"]


def get_long_name(df, row):
    if row["parent"] is None:
        return row["name"]
    if row["parent"] != row["parent"]:
        return row["name"]
    else:
        parent_row = df.loc[df["id"] == row["parent"]].iloc[0]
        return get_long_name(df, parent_row) + "|" + row["name"]


with open(source_file, "r") as geo:
    geo = json.load(geo)
    ob = geo["objects"]
    ob_name = list(ob)[0]
    config = GeoLevels[class_path].value
    levels = [c["name"] for c in config]
    properties = [
        d for d in [p["properties"] for p in ob[ob_name]["geometries"]]
    ]
    df = pd.DataFrame(properties)
    rec = df[levels].to_dict("records")
    res = []
    for i, r in enumerate(rec):
        for iv, v in enumerate(levels):
            lv = list(filter(lambda x: x["name"] == v, config))[0]["level"]
            plv = None
            if lv > 0:
                plv = r[levels[iv - 1]]
            data = {
                "name": r[v],
                "p": plv,
                "l": lv,
            }
            res.append(data)
    res = pd.DataFrame(res)
    res = res.dropna(subset=["name"]).reset_index()
    subset = ["name", "p", "l"]
    res = (
        res.drop_duplicates(subset=subset)
        .sort_values(["l", "name"])
        .reset_index()
    )
    res = res[subset]
    res["id"] = res.index + 1
    res["parent"] = res.apply(lambda x: get_parent_id(res, x), axis=1)
    res["long_name"] = res.apply(lambda x: get_long_name(res, x), axis=1)
    res = res[["id", "name", "parent", "long_name"]]
    for adm in res.to_dict("records"):
        parent = adm["parent"] if adm["parent"] == adm["parent"] else None
        add_administration(
            session=session,
            data=Administration(
                id=int(adm["id"]),
                parent=parent,
                name=adm["name"],
                long_name=adm["long_name"],
            ),
        )
    res.to_csv(f"./source/{source_path}/data/cascade.csv", index=False)
