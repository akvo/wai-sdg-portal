"""add_passcode_column_to_form_table

Revision ID: dcb471dc1050
Revises: 7402b7f0738c
Create Date: 2023-06-15 01:01:01.00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dcb471dc1050'
down_revision = '7402b7f0738c'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('form', sa.Column('passcode', sa.String()))


def downgrade():
    op.drop_column('form', 'passcode')
