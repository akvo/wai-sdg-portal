"""add_order_columns

Revision ID: 40799b50f65c
Revises: a9132038e44f
Create Date: 2021-09-24 05:33:10.772712

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '40799b50f65c'
down_revision = 'a9132038e44f'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('question_group',
                  sa.Column('order', sa.Boolean(), default=None))
    op.add_column('question',
                  sa.Column('order', sa.Boolean(), default=None))
    op.add_column('option',
                  sa.Column('order', sa.Boolean(), default=None))


def downgrade():
    op.drop_column('question_group', 'active')
    op.drop_column('question', 'active')
    op.drop_column('option', 'active')
