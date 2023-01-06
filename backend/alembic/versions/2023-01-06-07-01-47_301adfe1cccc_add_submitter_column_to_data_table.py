"""add submitter column to data table

Revision ID: 301adfe1cccc
Revises: dcb471dc1050
Create Date: 2023-01-06 07:01:47.755937

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '301adfe1cccc'
down_revision = 'dcb471dc1050'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'data',
        sa.Column('submitter', sa.String(), nullable=True))


def downgrade():
    op.drop_column('data', 'submitter')
