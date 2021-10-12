"""add_name_column_to_user

Revision ID: 8f5d1ad55412
Revises: a4c456f6421b
Create Date: 2021-10-12 12:04:37.559047

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '8f5d1ad55412'
down_revision = 'a4c456f6421b'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('user', sa.Column('name', sa.String()))


def downgrade():
    op.drop_column('user', 'name')
