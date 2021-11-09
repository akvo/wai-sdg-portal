"""add_download_to_job_type_enum

Revision ID: c6700d08ae79
Revises: 74d5490a6e0b
Create Date: 2021-11-09 04:56:45.415546

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'c6700d08ae79'
down_revision = '74d5490a6e0b'
branch_labels = None
depends_on = None


def upgrade():
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE jobtype ADD VALUE 'download'")


def downgrade():
    op.execute("ALTER TYPE jobtype RENAME TO jobtype_old")
    op.execute("""
        CREATE TYPE jobtype
        AS ENUM('send_email', 'validate_data', 'seed_data')
    """)
    op.execute("""
        ALTER TABLE "user" ALTER COLUMN role TYPE jobtype
        USING role::text::jobtype
    """)
    op.execute("DROP TYPE jobtype_old")
