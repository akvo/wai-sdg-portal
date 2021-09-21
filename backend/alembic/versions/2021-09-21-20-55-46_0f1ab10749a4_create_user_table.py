"""create_user_table

Revision ID: 0f1ab10749a4
Revises: 3df735cfd67b
Create Date: 2021-09-21 20:55:46.073405

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0f1ab10749a4'
down_revision = '3df735cfd67b'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'user', sa.Column('id', sa.Integer()),
        sa.Column('email', sa.String(length=254)),
        sa.Column('active', sa.Boolean(), default=False),
        sa.Column('role', sa.Enum('user', 'admin', name='userrole')),
        sa.Column('created', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'), sa.UniqueConstraint('email'))
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=True)
    op.create_index(op.f('ix_user_id'), 'user', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_user_id'), table_name='user')
    op.drop_table('user')
    op.execute('DROP TYPE userrole')
