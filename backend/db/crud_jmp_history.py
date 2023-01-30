from sqlalchemy.orm import Session
from datetime import datetime
from models.history import History
from models.data import Data
from models.jmp_history import JmpHistory
from AkvoResponseGrouper.views import get_categories


def add_history(
    session: Session,
    history: History,
    data: Data,
) -> None:
    session.add(history)
    session.commit()
    session.flush()
    session.refresh(history)

    categories = get_categories(session=session, data=data.id, form=data.form)
    histories = []
    for c in categories:
        histories.append(
            {
                "history": history.id,
                "data": data.id,
                "name": c.name,
                "category": c.category,
                "created": datetime.now(),
                "updated": None,
            }
        )
    session.bulk_insert_mappings(JmpHistory, histories)
    session.commit()
    session.flush()
