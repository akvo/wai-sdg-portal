"""create_option_table

Revision ID: 013ea389c97a
Revises: 7091caab58fc
Create Date: 2021-09-21 21:27:06.854128

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '013ea389c97a'
down_revision = '7091caab58fc'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'option',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order', sa.Integer(), default=None),
        sa.Column('name', sa.String()),
        sa.Column('question', sa.Integer(), sa.ForeignKey('question.id')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['question'], ['question.id'],
                                name='question_option_constraint',
                                ondelete='CASCADE'),
    )
    op.create_index(op.f('ix_option_id'), 'option', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_option_id'), table_name='option')
    op.drop_table('option')
