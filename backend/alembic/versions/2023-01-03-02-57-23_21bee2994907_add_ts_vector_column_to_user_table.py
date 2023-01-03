"""add_ts_vector_column_to_user_table

Revision ID: 21bee2994907
Revises: ad172335b008
Create Date: 2023-01-03 02:57:23.929865

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '21bee2994907'
down_revision = 'ad172335b008'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
        ALTER TABLE "user" ADD COLUMN __ts_vector__
            tsvector GENERATED ALWAYS AS (
                to_tsvector('english', name || ' ' || email)
            ) STORED;
    """)
    op.create_index(
        op.f('ix_user___ts_vector__'), 'user', ['__ts_vector__'])


def downgrade():
    op.drop_index(
        op.f('ix_user___ts_vector__'), table_name='user')
    op.drop_column('user', '__ts_vector__')
