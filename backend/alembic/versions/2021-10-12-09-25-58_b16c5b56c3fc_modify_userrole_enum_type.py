"""modify_usertype_enum_type

Revision ID: b16c5b56c3fc
Revises: 2349715de691
Create Date: 2021-10-12 09:25:58.789397

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = 'b16c5b56c3fc'
down_revision = '2349715de691'
branch_labels = None
depends_on = None


def upgrade():
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE userrole ADD VALUE 'editor'")


def downgrade():
    op.execute("ALTER TYPE userrole RENAME TO userrole_old")
    op.execute("CREATE TYPE userrole AS ENUM('user', 'admin')")
    op.execute("""
        ALTER TABLE "user" ALTER COLUMN role TYPE userrole
        USING role::text::userrole
    """)
    op.execute("DROP TYPE userrole_old")
