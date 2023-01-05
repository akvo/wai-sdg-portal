"""add_manage_form_passcode_column_to_user_table

Revision ID: f2f0ac233521
Revises: 21bee2994907
Create Date: 2023-01-03 05:30:41.708680

"""
from alembic import op
from sqlalchemy.sql import expression
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f2f0ac233521'
down_revision = '21bee2994907'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'user',
        sa.Column(
            'manage_form_passcode',
            sa.Boolean(),
            server_default=expression.false(),
            nullable=False
        ),
    )


def downgrade():
    op.drop_column('user', 'manage_form_passcode')
