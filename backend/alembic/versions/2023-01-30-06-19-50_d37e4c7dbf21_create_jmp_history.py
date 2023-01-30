"""create jmp history

Revision ID: d37e4c7dbf21
Revises: 301adfe1cccc
Create Date: 2023-01-30 06:19:50.001584

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "d37e4c7dbf21"
down_revision = "301adfe1cccc"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "jmp_history",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("data", sa.Integer(), sa.ForeignKey("data.id")),
        sa.Column("history", sa.Integer(), sa.ForeignKey("history.id")),
        sa.Column("name", sa.String(length=254), nullable=False),
        sa.Column("category", sa.String(length=254), nullable=False),
        sa.Column(
            "created",
            sa.DateTime(),
            nullable=True,
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
        ),
        sa.Column(
            "updated",
            sa.DateTime(),
            nullable=True,
            onupdate=sa.text("(CURRENT_TIMESTAMP)"),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["data"],
            ["data.id"],
            name="data_jmp_history_constraint",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["history"],
            ["history.id"],
            name="history_jmp_history_constraint",
            ondelete="CASCADE",
        ),
    )
    op.create_index(
        op.f("ix_jmp_history_id"), "jmp_history", ["id"], unique=True
    )


def downgrade():
    op.drop_index(op.f("ix_jmp_history_id"), table_name="jmp_history")
    op.drop_table("jmp_history")
