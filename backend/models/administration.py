from typing_extensions import TypedDict
from sqlalchemy import Column, Integer, String
from sqlalchemy import ForeignKey
from db.connection import Base


class AdministrationDict(TypedDict):
    id: int
    parent: int
    name: str


class Administration(Base):
    __tablename__ = "administration"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    parent = Column(Integer, ForeignKey('administration.id'))
    name = Column(String)

    def __init__(self, parent: int, name: str):
        self.parent = parent
        self.name = name

    def __repr__(self) -> int:
        return f"<Administration {self.id}>"

    @property
    def serialize(self) -> AdministrationDict:
        return {"id": self.id, "parent": self.parent, "name": self.name}
