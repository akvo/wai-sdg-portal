"""create_view_score

Revision ID: 008ee2499f31
Revises: 161c4a4f2671
Create Date: 2021-11-18 09:45:16.629858

"""
from alembic import op
from alembic_utils.pg_view import PGView


# revision identifiers, used by Alembic.
revision = '008ee2499f31'
down_revision = '161c4a4f2671'
branch_labels = None
depends_on = None


score_view = PGView(
    schema="public",
    signature="score_view",
    definition="""
    select dd.id as data, dd.administration, dd.form, scores.question,
    coalesce(scores.name, null) as option,
    coalesce(scores.score,null) as score FROM
    (SELECT a.data, a.question, o.name, o.score FROM answer a
    LEFT JOIN data d ON a.data = d.id
    LEFT JOIN option o ON a.question = o.question
    AND LOWER(a.options[1]) = LOWER(o.name)
    WHERE o.score IS NOT NULL) scores
    RIGHT JOIN data dd on scores.data = dd.id;
    """)


def upgrade():
    op.create_entity(score_view)


def downgrade():
    op.drop_entity(score_view)
