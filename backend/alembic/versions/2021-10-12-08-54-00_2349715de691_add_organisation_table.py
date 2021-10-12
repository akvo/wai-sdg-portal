"""add_organisation_table

Revision ID: 2349715de691
Revises: 422f13fbe888
Create Date: 2021-10-12 08:54:00.851808

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '2349715de691'
down_revision = '422f13fbe888'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'organisation', sa.Column('id', sa.Integer()),
        sa.Column('name', sa.String(length=254)),
        sa.Column(
            'type',
            sa.Enum('Company', 'iNGO', 'Government',
                    name='organisation_type')),
        sa.Column('created', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'), sa.UniqueConstraint('name'))
    op.create_index(op.f('ix_organisation_name'),
                    'organisation', ['name'],
                    unique=True)


def downgrade():
    op.drop_index(op.f('ix_oragnisation_id'), table_name='organisation')
    op.drop_table('organisation')
    op.execute('DROP TYPE organisation_type')
