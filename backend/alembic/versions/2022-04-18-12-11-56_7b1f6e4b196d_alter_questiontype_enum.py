"""alter questiontype enum

Revision ID: 7b1f6e4b196d
Revises: d2e07fa253df
Create Date: 2022-04-18 12:11:56.013138

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = '7b1f6e4b196d'
down_revision = 'd2e07fa253df'
branch_labels = None
depends_on = None


def upgrade():
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE questiontype ADD VALUE 'answer_list'")


def downgrade():
    pass
