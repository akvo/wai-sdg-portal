"""add_color_column_to_option_table

Revision ID: 422f13fbe888
Revises: adbe1fcfc7bc
Create Date: 2021-10-05 09:57:31.865461

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '422f13fbe888'
down_revision = 'adbe1fcfc7bc'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('option', sa.Column('color', sa.String(), nullable=True))


def downgrade():
    op.drop_column('country', 'color')
