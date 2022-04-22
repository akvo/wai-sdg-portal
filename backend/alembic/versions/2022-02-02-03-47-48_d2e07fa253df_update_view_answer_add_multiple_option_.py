"""update view answer add multiple option answer value

Revision ID: d2e07fa253df
Revises: ea86d583c564
Create Date: 2022-02-02 03:47:48.004600

"""
from alembic import op
from alembic_utils.pg_view import PGView


# revision identifiers, used by Alembic.
revision = 'd2e07fa253df'
down_revision = 'ea86d583c564'
branch_labels = None
depends_on = None

answer_search = PGView(
    schema="public",
    signature="answer_search",
    definition="""
    SELECT a.data,
    array_agg(CONCAT(q.id, '||', lower(array_to_string(a.options, ',', '*'))))
    as options
    FROM answer a LEFT JOIN question q on q.id = a.question
    WHERE q.type = 'option' GROUP BY a.data;
    """)

updated_answer_search_with_multiple_option_value = PGView(
    schema="public",
    signature="answer_search",
    definition="""
    SELECT tmp.data,
        array_agg(CONCAT(tmp.question, '||', lower(tmp.options))) as options
    FROM (
        SELECT a.data, a.question, a.id as answer_id,
        unnest(a.options) as options
        FROM answer a LEFT JOIN question q on q.id = a.question
        WHERE q.type = 'option'  or q.type = 'multiple_option'
    ) tmp GROUP BY tmp.data;
    """)


def upgrade():
    op.drop_entity(answer_search)
    op.create_entity(updated_answer_search_with_multiple_option_value)
    pass


def downgrade():
    op.drop_entity(updated_answer_search_with_multiple_option_value)
    op.create_entity(answer_search)
    pass
