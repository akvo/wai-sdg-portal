"""add repeatable repeat_text description translations columns
to question group table

Revision ID: 8f340b8be702
Revises: e7a3cfd4c44a
Create Date: 2022-09-26 08:58:04.997463

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import expression
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = '8f340b8be702'
down_revision = 'e7a3cfd4c44a'
branch_labels = None
depends_on = None


class CastingArray(pg.ARRAY):
    def bind_expression(self, bindvalue):
        return sa.cast(bindvalue, self)


def upgrade():
    op.add_column(
        'question_group',
        sa.Column('description', sa.Text(), nullable=True))
    op.add_column(
        'question_group',
        sa.Column('repeatable', sa.Boolean,
                  server_default=expression.false(),
                  nullable=True))
    op.add_column(
        'question_group',
        sa.Column('repeat_text', sa.String(), nullable=True))
    op.add_column(
        'question_group',
        sa.Column('translations', CastingArray(pg.JSONB()), nullable=True))


def downgrade():
    op.drop_column('question_group', 'description')
    op.drop_column('question_group', 'repeatable')
    op.drop_column('question_group', 'repeat_text')
    op.drop_column('question_group', 'translations')
