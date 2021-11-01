"""create_log_table

Revision ID: ca0f707eecb9
Revises: ace18af6268f
Create Date: 2021-10-28 10:55:15.143335

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'ca0f707eecb9'
down_revision = '8f5d1ad55412'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'log',
        sa.Column('id',
                  sa.Integer()),
        sa.Column('user', sa.Integer(), sa.ForeignKey('user.id')),
        sa.Column('message', sa.Text()),
        sa.Column('at',
                  sa.DateTime,
                  server_default=sa.func.current_timestamp()),
        sa.PrimaryKeyConstraint('id'))
    op.create_index(op.f('ix_log_id'), 'log', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_log_id'), table_name='log')
    op.drop_table('log')
