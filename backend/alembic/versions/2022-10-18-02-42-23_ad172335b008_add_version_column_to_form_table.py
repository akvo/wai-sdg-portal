"""add_version_column_to_form_table

Revision ID: ad172335b008
Revises: df0afb661d60
Create Date: 2022-10-18 02:42:23.277276

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ad172335b008'
down_revision = 'df0afb661d60'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'form',
        sa.Column('version', sa.Float(), nullable=True, default=0.0))


def downgrade():
    op.drop_column('form', 'version')
