"""add_user_organisation_columns

Revision ID: a4c456f6421b
Revises: b16c5b56c3fc
Create Date: 2021-10-12 10:07:44.800346

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a4c456f6421b'
down_revision = 'b16c5b56c3fc'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'user',
        sa.Column('organisation', sa.Integer(),
                  sa.ForeignKey('organisation.id')),
        )
    op.create_foreign_key(u'user_organisation_constraint', 'user',
                          'organisation', ['organisation'], ['id'])


def downgrade():
    op.drop_constraint(u'user_organisation_constraint',
                       'user',
                       type_='foreignkey')
    op.drop_column('user', 'organisation')
