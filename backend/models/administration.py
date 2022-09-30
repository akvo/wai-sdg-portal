# Please don't use **kwargs
# Keep the code clean and CLEAR

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


class AdministrationCascade(BaseModel):
    value: int
    label: str
    children: Optional[List] = []


class Administration(Base):
    __tablename__ = "administration"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    parent = Column(Integer, ForeignKey('administration.id'))
    name = Column(String)
    children = relationship("Administration")
    parent_detail = relationship("Administration", remote_side=[id])

    def __init__(self, id: int, parent: int, name: str):
        self.id = id
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

    @property
    def cascade(self) -> AdministrationCascade:
        if len(self.children):
            return {
                "value": self.id,
                "label": self.name,
                "children": [c.cascade for c in self.children]
            }
        return {
            "value": self.id,
            "label": self.name,
        }

    @property
    def with_parent_name(self):
        return {
            "id": self.id,
            "parent": self.parent_detail.name if self.parent_detail else None,
            "name": self.name
        }

    @property
    def simplify_serialize_with_children(self):
        return {"id": self.id, "children": [c.id for c in self.children]}


class AdministrationBase(BaseModel):
    id: int
    parent: Optional[int] = None
    name: str

    class Config:
        orm_mode = True


class AdministrationResponse(AdministrationBase):
    children: List[AdministrationBase]
