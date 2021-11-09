"""add_jobs_to_log

Revision ID: f05579d8d253
Revises: c6700d08ae79
Create Date: 2021-11-09 10:49:33.821638

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'f05579d8d253'
down_revision = 'c6700d08ae79'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'log',
        sa.Column('jobs',
                  sa.Integer(),
                  sa.ForeignKey('jobs.id'),
                  nullable=True))
    sa.ForeignKeyConstraint(['jobs'], ['jobs.id'],
                            name='jobs_log_constraint',
                            ondelete='CASCADE')


def downgrade():
    op.drop_column('log', 'jobs')
