"""create_history_table

Revision ID: adbe1fcfc7bc
Revises: a9132038e44f
Create Date: 2021-09-29 09:38:41.708322

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = 'adbe1fcfc7bc'
down_revision = 'a9132038e44f'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('question', sa.Integer(), sa.ForeignKey('question.id')),
        sa.Column('data', sa.Integer(), sa.ForeignKey('data.id')),
        sa.Column('value', sa.Float(), nullable=True),
        sa.Column('text', sa.Text(), nullable=True),
        sa.Column('options', pg.ARRAY(sa.String()), nullable=True),
        sa.Column('created_by', sa.Integer(), sa.ForeignKey('user.id')),
        sa.Column('updated_by', sa.Integer(), sa.ForeignKey('user.id')),
        sa.Column('created',
                  sa.DateTime(),
                  nullable=True,
                  server_default=sa.text('(CURRENT_TIMESTAMP)')),
        sa.Column('updated',
                  sa.DateTime(),
                  nullable=True,
                  onupdate=sa.text('(CURRENT_TIMESTAMP)')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['question'], ['question.id'],
                                name='question_history_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['data'], ['data.id'],
                                name='data_history_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['user.id'],
                                name='created_by_history_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['updated_by'], ['user.id'],
                                name='updated_by_history_constraint',
                                ondelete='CASCADE'),
    )
    op.create_index(op.f('ix_history_id'), 'history', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_history_id'), table_name='history')
    op.drop_table('history')
