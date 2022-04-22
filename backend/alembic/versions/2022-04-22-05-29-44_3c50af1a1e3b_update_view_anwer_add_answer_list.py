"""update_view_anwer_add_answer_list

Revision ID: 3c50af1a1e3b
Revises: 7b1f6e4b196d
Create Date: 2022-04-22 05:29:44.536010

"""
from alembic import op
from alembic_utils.pg_view import PGView

# revision identifiers, used by Alembic.
revision = '3c50af1a1e3b'
down_revision = '7b1f6e4b196d'
branch_labels = None
depends_on = None

answer_search = PGView(schema="public",
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

updated_answer_search_with_multiple_option_value = PGView(
    schema="public",
    signature="answer_search",
    definition="""
    SELECT tmp.data, array_agg(CONCAT(tmp.question, '||', lower(tmp.options)))
    as options
    FROM (
    (SELECT a.data, a.question, a.id as answer_id,
        unnest(a.options) as options
        FROM answer a LEFT JOIN question q on q.id = a.question
        WHERE q.type = 'option'  or q.type = 'multiple_option')
        UNION ALL
     (SELECT a.data, a.question, a.id as answer_id, a.value::text as options
        FROM answer a LEFT JOIN question q on q.id = a.question
        WHERE q.type = 'answer_list'))
        tmp GROUP BY tmp.data;
    """)


def upgrade():
    op.drop_entity(answer_search)
    op.create_entity(updated_answer_search_with_multiple_option_value)
    pass


def downgrade():
    op.drop_entity(updated_answer_search_with_multiple_option_value)
    op.create_entity(answer_search)
    pass
