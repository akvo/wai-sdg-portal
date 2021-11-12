import sys
import pytest
import pandas as pd
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from db.connection import get_db_url
from db import crud_administration as ca

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(True)
administration_file = "./source/notset/data/administration.csv"


class TestAdministrationRoute():
    @pytest.mark.asyncio
    async def test_seed_administration(self, app: FastAPI, session: Session,
                                       client: AsyncClient) -> None:
        engine = create_engine(get_db_url())
        data = pd.read_csv(administration_file)
        parents = list(data['UNIT_TYPE'].unique())
        parents = pd.DataFrame(parents, columns=['name'])
        parents['parent'] = None
        parents['id'] = parents.index + 1
        data['parent'] = data['UNIT_TYPE'].apply(
            lambda x: parents[parents['name'] == x].id.values[0])
        data = data.rename(columns={'UNIT_NAME': 'name'})[['name', 'parent']]
        results = parents[['name', 'parent'
                           ]].append(data).reset_index()[['name', 'parent']]
        results['id'] = results.index + 1
        results.to_sql('administration',
                       engine,
                       if_exists='append',
                       index=False)
        res = await client.get(app.url_path_for("administration:get"))
        assert res.status_code == 200
        res = res.json()
        assert len(res) == len(results.to_dict('records'))

    @pytest.mark.asyncio
    async def test_cruds(self, session: Session) -> None:
        origin = pd.read_csv(administration_file)
        origin["name"] = origin[['UNIT_NAME',
                                 'UNIT_TYPE']].apply(lambda x: ', '.join(x),
                                                     axis=1)
        administration = ca.get_administration_name(session=session, id=2)
        assert administration == "Jawa Barat"
        administration = ca.get_administration_name(session=session, id=12)
        assert administration == "Sumedang, Jawa Barat"

        ids = ca.get_nested_children_ids(session=session, parents=[3])
        childs = origin[origin["UNIT_TYPE"] == "Yogyakarta"]
        childs = list(childs["name"])
        for id in ids:
            administration = ca.get_administration_name(session=session, id=id)
            assert administration in childs
        adms = ca.get_parent_administration(session=session, access=[1, 2])
        for a in adms:
            adm = a.cascade
            if a.id == 1:
                adm["label"] == "Jakarta"
                childs = origin[origin["UNIT_TYPE"] == "Jakarta"]
                childs = list(childs["UNIT_NAME"])
                for c in adm["children"]:
                    assert c["label"] in childs
            else:
                adm["label"] == "Jawa Barat"
                childs = origin[origin["UNIT_TYPE"] == "Jawa Barat"]
                childs = list(childs["UNIT_NAME"])
                for c in adm["children"]:
                    assert c["label"] in childs
