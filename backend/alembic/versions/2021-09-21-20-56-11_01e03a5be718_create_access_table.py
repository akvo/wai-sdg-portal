"""create_access_table

Revision ID: 01e03a5be718
Revises: 0f1ab10749a4
Create Date: 2021-09-21 20:56:11.494971

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '01e03a5be718'
down_revision = '0f1ab10749a4'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'access', sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user', sa.Integer(), sa.ForeignKey('user.id')),
        sa.Column('administration', sa.Integer(),
                  sa.ForeignKey('administration.id')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user', 'administration'),
        sa.ForeignKeyConstraint(['user'], ['user.id'],
                                name='user_access_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['administration'], ['administration.id'],
                                name='administration_access_constraint',
                                ondelete='CASCADE'))
    op.create_index(op.f('ix_access_id'), 'access', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_access_id'), table_name='access')
    op.drop_table('access')
