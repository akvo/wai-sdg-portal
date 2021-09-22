from typing_extensions import TypedDict
from sqlalchemy import Column, Integer, String
from sqlalchemy import ForeignKey
from db.connection import Base


class AdministrationDict(TypedDict):
    id: int
    parent_id: int
    name: str


class Administration(Base):
    __tablename__ = "administration"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    parent_id = Column(Integer, ForeignKey('administration.id'))
    name = Column(String)

    def __init__(self, parent_id: int, name: str):
        self.parent_id = parent_id
        self.name = name

    def __repr__(self) -> int:
        return f"<Administration {self.id}>"

    @property
    def serialize(self) -> AdministrationDict:
        return {"id": self.id, "parent_id": self.parent_id, "name": self.name}
