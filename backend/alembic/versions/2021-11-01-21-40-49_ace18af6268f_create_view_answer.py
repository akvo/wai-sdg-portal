"""create_view_answer_search

Revision ID: ace18af6268f
Revises: 8f5d1ad55412
Create Date: 2021-10-27 21:40:49.391127

"""
from alembic import op
from alembic_utils.pg_view import PGView

# revision identifiers, used by Alembic.
revision = 'ace18af6268f'
down_revision = 'ccb3672a1a60'
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


def upgrade():
    op.create_entity(answer_search)


def downgrade():
    op.drop_entity(answer_search)

# Example Search
# WHERE options @> '{"35|basic","39|basic","37|less than 30 minutes"}';
