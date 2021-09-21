"""create_form_table

Revision ID: c2c7e303fa55
Revises: 01e03a5be718
Create Date: 2021-09-21 21:06:47.168922

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'c2c7e303fa55'
down_revision = '01e03a5be718'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('form', sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('name', sa.String()),
                    sa.PrimaryKeyConstraint('id'))
    op.create_index(op.f('ix_form_id'), 'form', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_form_id'), table_name='form')
    op.drop_table('form')
