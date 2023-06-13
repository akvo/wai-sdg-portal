"""add_passcode_column_to_form_table

Revision ID: dcb471dc1050
Revises: f2f0ac233521
Create Date: 2023-01-05 08:34:18.990750

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dcb471dc1050'
down_revision = 'f2f0ac233521'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('form', sa.Column('passcode', sa.String()))


def downgrade():
    op.drop_column('form', 'passcode')
