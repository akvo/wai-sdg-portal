from sqlalchemy import Column, Integer, Text
import sqlalchemy.dialects.postgresql as pg
from db.connection import Base


class ViewData(Base):
    __tablename__ = "answer_search"
    data = Column(Integer, primary_key=True)
    options = Column(pg.ARRAY(Text))

    def __repr__(self) -> int:
        return f"<ViewData {self.id}>"
