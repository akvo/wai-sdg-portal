"""create_jobs_table

Revision ID: ccb3672a1a60
Revises: ca0f707eecb9
Create Date: 2021-10-29 15:14:54.754879

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

# revision identifiers, used by Alembic.
revision = 'ccb3672a1a60'
down_revision = 'ca0f707eecb9'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'jobs',
        sa.Column('id',
                  sa.Integer()),
        sa.Column(
            'type',
            sa.Enum('send_email', 'validate_data', 'seed_data',
                    name='jobtype')),
        sa.Column('status',
                  sa.Enum('pending',
                          'on_progress',
                          'failed',
                          'done',
                          name='jobstatus'),
                  server_default='pending'),
        sa.Column('payload', sa.Text(), nullable=False),
        sa.Column('info', pg.JSONB(), nullable=True),
        sa.Column('attempt',
                  sa.Integer(),
                  server_default=sa.text('0::int')),
        sa.Column('created_by',
                  sa.Integer(),
                  sa.ForeignKey('user.id'),
                  nullable=False),
        sa.Column('created',
                  sa.DateTime(),
                  server_default=sa.text('(CURRENT_TIMESTAMP)')),
        sa.Column('available',
                  sa.DateTime(),
                  onupdate=sa.text('(CURRENT_TIMESTAMP)')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['created_by'], ['user.id'],
                                name='created_by_jobs_constraint',
                                ondelete='CASCADE'))
    op.create_index(op.f('ix_jobs_id'), 'jobs', ['id'], unique=True)


def downgrade():
    op.drop_constraint(u'created_by_jobs_constraint',
                       'jobs',
                       type_='foreignkey')
    op.drop_index(op.f('ix_jobs_id'), table_name='jobs')
    op.drop_table('jobs')
    op.execute('DROP TYPE jobstatus CASCADE')
    op.execute('DROP TYPE jobtype CASCADE')
