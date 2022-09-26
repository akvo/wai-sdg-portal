"""add description defaultLanguage languages and translations columns
to form table

Revision ID: e7a3cfd4c44a
Revises: 3c50af1a1e3b
Create Date: 2022-09-26 07:25:27.926476

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = 'e7a3cfd4c44a'
down_revision = '3c50af1a1e3b'
branch_labels = None
depends_on = None


class CastingArray(pg.ARRAY):
    def bind_expression(self, bindvalue):
        return sa.cast(bindvalue, self)


def upgrade():
    op.add_column(
        'form',
        sa.Column('description', sa.Text(), nullable=True))
    op.add_column(
        'form',
        sa.Column('default_language', sa.String(), nullable=True))
    op.add_column(
        'form',
        sa.Column('languages', pg.ARRAY(sa.String()), nullable=True))
    op.add_column(
        'form',
        sa.Column('translations', CastingArray(pg.JSONB()), nullable=True))


def downgrade():
    op.drop_column('form', 'description')
    op.drop_column('form', 'default_language')
    op.drop_column('form', 'languages')
    op.drop_column('form', 'translations')
