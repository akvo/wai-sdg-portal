# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional
from pydantic import BaseModel
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer
from sqlalchemy import ForeignKey
from db.connection import Base


class AccessDict(TypedDict):
    id: int
    user: int
    administration: int


class Access(Base):
    __tablename__ = "access"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    user = Column(Integer, ForeignKey("user.id"))
    administration = Column(Integer, ForeignKey("administration.id"))

    def __init__(self, user: int, administration: int):
        self.user = user
        self.administration = administration

    def __repr__(self) -> int:
        return f"<Access {self.id}>"

    @property
    def serialize(self) -> AccessDict:
        return {
            "id": self.id,
            "user": self.user,
            "administration": self.administration,
        }


class AccessBase(BaseModel):
    id: Optional[int]
    user: int
    administration: int

    class Config:
        orm_mode = True
