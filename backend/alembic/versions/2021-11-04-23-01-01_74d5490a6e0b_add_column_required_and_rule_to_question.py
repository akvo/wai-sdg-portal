"""add_column_required_and_rule_to_question

Revision ID: 74d5490a6e0b
Revises: ace18af6268f
Create Date: 2021-11-04 23:01:01.704374

"""
from alembic import op
from sqlalchemy.sql import expression
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

# revision identifiers, used by Alembic.
revision = '74d5490a6e0b'
down_revision = 'ace18af6268f'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'question',
        sa.Column('required',
                  sa.Boolean,
                  server_default=expression.true(),
                  nullable=False),
    )
    op.add_column(
        'question',
        sa.Column('rule', pg.JSONB(), nullable=True),
    )


def downgrade():
    op.drop_column('question', 'required')
    op.drop_column('question', 'rule')
