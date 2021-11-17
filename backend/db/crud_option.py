from typing import List, Optional
from sqlalchemy.orm import Session
from models.option import Option, OptionDictWithId


def get_option(session: Session) -> List[OptionDictWithId]:
    return session.query(Option).all()


def update_option(session: Session, id: int,
                  name: Optional[str] = None,
                  order: Optional[str] = None,
                  color: Optional[str] = None) -> OptionDictWithId:
    option = session.query(Option).filter(Option.id == id).first()
    option.order = order
    option.color = color
    if name:
        option.name = name
    session.flush()
    session.commit()
    session.refresh(option)
    return option
