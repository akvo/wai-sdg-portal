import sys
import pytest
import pandas as pd
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from db.connection import get_db_url

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(True)


class TestAdministrationRoute():
    @pytest.mark.asyncio
    async def test_seed_administration(self, app: FastAPI, session: Session,
                                       client: AsyncClient) -> None:
        engine = create_engine(get_db_url())
        data = pd.read_csv('./source/administration-ethiopia.csv')
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
