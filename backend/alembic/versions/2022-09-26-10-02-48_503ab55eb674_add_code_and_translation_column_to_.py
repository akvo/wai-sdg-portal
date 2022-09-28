"""add code and translation column to option table

Revision ID: 503ab55eb674
Revises: 8f340b8be702
Create Date: 2022-09-26 10:02:48.535566

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = '503ab55eb674'
down_revision = '8f340b8be702'
branch_labels = None
depends_on = None


class CastingArray(pg.ARRAY):
    def bind_expression(self, bindvalue):
        return sa.cast(bindvalue, self)


def upgrade():
    op.add_column(
        'option',
        sa.Column('code', sa.String(), nullable=True))
    op.add_column(
        'option',
        sa.Column('translations', CastingArray(pg.JSONB()), nullable=True))


def downgrade():
    op.drop_column('option', 'code')
    op.drop_column('option', 'translations')
