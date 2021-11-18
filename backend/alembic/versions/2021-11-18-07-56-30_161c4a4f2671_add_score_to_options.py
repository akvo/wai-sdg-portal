"""add_score_to_options

Revision ID: 161c4a4f2671
Revises: f05579d8d253
Create Date: 2021-11-18 07:56:30.507996

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '161c4a4f2671'
down_revision = 'f05579d8d253'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('option', sa.Column('score', sa.Integer(), nullable=True))


def downgrade():
    op.drop_column('option', 'score')
