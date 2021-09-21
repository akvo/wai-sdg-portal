"""create_administration_table

Revision ID: 3df735cfd67b
Revises:
Create Date: 2021-09-21 20:54:56.990541

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '3df735cfd67b'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('administration', sa.Column('id', sa.Integer()),
                    sa.Column('parent_id', sa.Integer(), nullable=True),
                    sa.Column('name', sa.String()),
                    sa.PrimaryKeyConstraint('id'))
    op.create_foreign_key(None, 'administration', 'administration',
                          ['parent_id'], ['id'])
    op.create_index(op.f('ix_administration_id'),
                    'administration', ['id'],
                    unique=True)


def downgrade():
    op.drop_table('administration')
