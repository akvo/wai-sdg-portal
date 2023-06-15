from sqlalchemy import Column, Integer, Text
import sqlalchemy.dialects.postgresql as pg
from db.connection import Base


class ViewData(Base):
    __tablename__ = "answer_search"
    data = Column(Integer, primary_key=True)
    options = Column(pg.ARRAY(Text))

    def __repr__(self) -> int:
        return f"<ViewData {self.data}>"

    @property
    def raw(self):
        opt = self.options
        opt_data = []
        for o in opt:
            d = o.split("||")
            opt_data.append({"id": self.data, "question": d[0], "answer": d[1]})
        return opt_data
