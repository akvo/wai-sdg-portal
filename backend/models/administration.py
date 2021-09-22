from typing_extensions import TypedDict
from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from db.connection import Base


class AdministrationDict(TypedDict):
    id: int
    parent: Optional[int] = None
    name: str
    children: Optional[List] = []


class Administration(Base):
    __tablename__ = "administration"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    parent = Column(Integer, ForeignKey('administration.id'))
    name = Column(String)
    children = relationship("Administration")

    def __init__(self, parent: int, name: str):
        self.parent = parent
        self.name = name

    def __repr__(self) -> int:
        return f"<Administration {self.id}>"

    @property
    def serialize(self) -> AdministrationDict:
        return {
            "id": self.id,
            "parent": self.parent,
            "name": self.name,
            "children": self.children
        }


class AdministrationBase(BaseModel):
    id: int
    parent: Optional[int] = None
    name: str

    class Config:
        orm_mode = True


class AdministrationResponse(AdministrationBase):
    children: List[AdministrationBase]
