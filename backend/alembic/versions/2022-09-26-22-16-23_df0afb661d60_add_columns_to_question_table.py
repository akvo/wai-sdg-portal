"""add columns tooltip translations api and add_on
to question table

Revision ID: df0afb661d60
Revises: 503ab55eb674
Create Date: 2022-09-26 22:16:23.279989

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = 'df0afb661d60'
down_revision = '503ab55eb674'
branch_labels = None
depends_on = None


class CastingArray(pg.ARRAY):
    def bind_expression(self, bindvalue):
        return sa.cast(bindvalue, self)


def upgrade():
    op.add_column(
        'question',
        sa.Column('tooltip', pg.JSONB(), nullable=True))
    op.add_column(
        'question',
        sa.Column('translations', CastingArray(pg.JSONB()), nullable=True))
    op.add_column(
        'question',
        sa.Column('api', pg.JSONB(), nullable=True))
    op.add_column(
        'question',
        sa.Column('add_on', pg.JSONB(), nullable=True))


def downgrade():
    op.drop_column('question', 'tooltip')
    op.drop_column('question', 'translations')
    op.drop_column('question', 'api')
    op.drop_column('question', 'add_on')
