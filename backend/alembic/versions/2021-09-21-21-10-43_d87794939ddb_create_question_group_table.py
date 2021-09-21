"""create_question_group_table

Revision ID: d87794939ddb
Revises: c2c7e303fa55
Create Date: 2021-09-21 21:10:43.328827

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'd87794939ddb'
down_revision = 'c2c7e303fa55'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'question_group',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String()),
        sa.Column('form', sa.Integer(), sa.ForeignKey('form.id')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['form'], ['form.id'],
                                name='form_question_group_constraint',
                                ondelete='CASCADE'),
    )
    op.create_index(op.f('ix_question_group_id'),
                    'question_group', ['id'],
                    unique=True)


def downgrade():
    op.drop_index(op.f('ix_question_group_id'), table_name='question_group')
    op.drop_table('question_group')
