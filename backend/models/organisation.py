# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
from typing import Optional, List
from pydantic import BaseModel
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer
from sqlalchemy import Enum, String
from sqlalchemy.orm import relationship
from db.connection import Base
from models.user import UserBase


class OrganisationType(enum.Enum):
    iNGO = "iNGO"
    Company = "Company"
    Government = "Government"


class OrganisationDict(TypedDict):
    id: int
    name: str
    type: OrganisationType
    user: List[UserBase]


class Organisation(Base):
    __tablename__ = "organisation"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    name = Column(String, unique=True)
    type = Column(Enum(OrganisationType))
    user = relationship(
        "User", cascade="all, delete", passive_deletes=True, backref="user"
    )

    def __init__(
        self, name: str, type: OrganisationType, id: Optional[int] = None
    ):
        self.id = id
        self.name = name
        self.type = type

    def __repr__(self) -> int:
        return f"<Organisation {self.id}>"

    @property
    def serialize(self) -> OrganisationDict:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "user": self.user,
        }


class OrganisationBase(BaseModel):
    id: Optional[int]
    name: str
    type: OrganisationType

    class Config:
        orm_mode = True
