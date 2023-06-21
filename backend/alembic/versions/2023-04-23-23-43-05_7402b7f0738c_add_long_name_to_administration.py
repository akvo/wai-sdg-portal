"""add long name to administration

Revision ID: 7402b7f0738c
Revises: f2f0ac233521
Create Date: 2023-04-23 23:43:05.247821

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "7402b7f0738c"
down_revision = "f2f0ac233521"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("administration",
                  sa.Column("long_name", sa.String(length=255), nullable=True))
    op.execute("""
    WITH RECURSIVE cte AS (
        SELECT id, parent, name, name as long_name
        FROM administration
        WHERE parent IS NULL
        UNION ALL
        SELECT t.id, t.parent, t.name, cte.long_name || '|' || t.name
        FROM administration t
        JOIN cte ON t.parent = cte.id
    )
    UPDATE administration
    SET long_name = cte.long_name
    FROM cte
    WHERE administration.id = cte.id;
    """)
    op.create_index("ix_administration_long_name", "administration",
                    ["long_name"])


def downgrade():
    op.drop_index("ix_administration_long_name", table_name="administration")
    op.execute("ALTER TABLE administration DROP COLUMN IF EXISTS long_name")
