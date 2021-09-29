"""create_data_table

Revision ID: 34249f8fcfbf
Revises: 013ea389c97a
Create Date: 2021-09-21 21:29:24.991344

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

# revision identifiers, used by Alembic.
revision = '34249f8fcfbf'
down_revision = '013ea389c97a'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'data',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String()),
        sa.Column('form', sa.Integer(), sa.ForeignKey('form.id')),
        sa.Column('administration', sa.Integer(),
                  sa.ForeignKey('administration.id')),
        sa.Column('geo', pg.ARRAY(sa.Float()), nullable=True),
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
        sa.ForeignKeyConstraint(['form'], ['form.id'],
                                name='form_data_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['administration'], ['administration.id'],
                                name='administration_data_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['user.id'],
                                name='created_by_data_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['updated_by'], ['user.id'],
                                name='updated_by_data_constraint',
                                ondelete='CASCADE'),
    )
    op.create_index(op.f('ix_data_id'), 'data', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_data_id'), table_name='data')
    op.drop_table('data')
