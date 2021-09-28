"""create_administration_table

Revision ID: 3df735cfd67b
Revises:
Create Date: 2021-09-21 20:54:56.990541

"""
from alembic import op
import sqlalchemy as sa
import pandas as pd

# revision identifiers, used by Alembic.
revision = '3df735cfd67b'
down_revision = None
branch_labels = None
depends_on = None


def seed():
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
    results = results.to_dict('records')
    meta = sa.MetaData(bind=op.get_bind())
    services = sa.Table('administration', meta, autoload=True)
    op.bulk_insert(services, results, multiinsert=True)


def upgrade():
    op.create_table('administration', sa.Column('id', sa.Integer()),
                    sa.Column('parent', sa.Integer(), nullable=True),
                    sa.Column('name', sa.String()),
                    sa.PrimaryKeyConstraint('id'))
    op.create_foreign_key(None, 'administration', 'administration',
                          ['parent'], ['id'])
    op.create_index(op.f('ix_administration_id'),
                    'administration', ['id'],
                    unique=True)
    seed()


def downgrade():
    op.drop_table('administration')
