from sqlalchemy.orm import Session
from typing import List
from db.connection import engine
from AkvoResponseGrouper.db import get_existing_view
from AkvoResponseGrouper.views import get_category_by_data_ids
from AkvoResponseGrouper.models import CategoryResponse


def existing_view_status() -> bool:
    status = False
    with engine.connect() as connection:
        with connection.begin():
            existing_view = get_existing_view(connection)
            if existing_view["count"]:
                status = True
    return status


def get_categories_by_data_ids(
    session: Session, form: int, ids: List[int]
) -> List[CategoryResponse]:
    existing_view = existing_view_status()
    if existing_view:
        categories = get_category_by_data_ids(session=session, ids=ids)
        categories = [
            {
                "data": c.data,
                "form": c.form,
                "name": c.name,
                "category": c.category,
            }
            for c in categories
        ]
        return categories
    return []
