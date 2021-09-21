"""create_question_table

Revision ID: 7091caab58fc
Revises: d87794939ddb
Create Date: 2021-09-21 21:14:58.890314

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '7091caab58fc'
down_revision = 'd87794939ddb'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'question',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String()),
        sa.Column('form', sa.Integer(), sa.ForeignKey('form.id')),
        sa.Column('meta', sa.Boolean(), nullable=False),
        sa.Column(
            'type',
            sa.Enum('text',
                    'number',
                    'option',
                    'multiple_option',
                    'photo',
                    'date',
                    'geo',
                    'administration',
                    name='questiontype')),
        sa.Column('question_group', sa.Integer(),
                  sa.ForeignKey('question_group.id')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['form'], ['form.id'],
                                name='form_question_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['question_group'], ['question_group.id'],
                                name='question_group_question_constraint',
                                ondelete='CASCADE'),
    )
    op.create_index(op.f('ix_question_id'), 'question', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_question_id'), table_name='question')
    op.drop_table('question')
    op.execute('DROP TYPE questiontype')
