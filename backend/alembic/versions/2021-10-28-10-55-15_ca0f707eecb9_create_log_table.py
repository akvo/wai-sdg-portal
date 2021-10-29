"""create_log_table

Revision ID: ca0f707eecb9
Revises: ace18af6268f
Create Date: 2021-10-28 10:55:15.143335

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.schema import Sequence, CreateSequence, DropSequence

# revision identifiers, used by Alembic.
revision = 'ca0f707eecb9'
down_revision = 'ace18af6268f'
branch_labels = None
depends_on = None

# If you change the primary key in a Postgres table
# the Alembic auto migration script won't create
# a new sequence on the new key column.
# This throws an error when you
# then try to insert a record into the table
# as there's no autoincrement set on the primary key field.
# And it can't be set because there's no sequence.
# Source:
# https://coderwall.com/p/ajdngg/adding-a-postgresql-sequence-with-alembic


def upgrade():
    op.execute(CreateSequence(Sequence('log_id_seq')))
    op.create_table(
        'log',
        sa.Column('id',
                  sa.Integer(),
                  nullable=False,
                  server_default=sa.text("nextval('log_id_seq'::regclass)")),
        sa.Column('user', sa.Integer(), sa.ForeignKey('user.id')),
        sa.Column('message', sa.Text()),
        sa.Column('at',
                  sa.DateTime,
                  server_default=sa.func.current_timestamp()))
    op.create_index(op.f('ix_log_id'), 'log', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_log_id'), table_name='log')
    op.drop_table('log')
    op.execute(DropSequence(Sequence('log_id_seq')))
