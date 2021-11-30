"""add_dependency_column_to_question_table

Revision ID: ea86d583c564
Revises: 008ee2499f31
Create Date: 2021-11-30 00:04:27.915866

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

# revision identifiers, used by Alembic.
revision = 'ea86d583c564'
down_revision = '008ee2499f31'
branch_labels = None
depends_on = None


class CastingArray(pg.ARRAY):
    def bind_expression(self, bindvalue):
        return sa.cast(bindvalue, self)


def upgrade():
    op.add_column(
        'question',
        sa.Column('dependency', CastingArray(pg.JSONB()), nullable=True),
    )


def downgrade():
    op.drop_column('question', 'dependency')
