# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer, Boolean, String
from sqlalchemy import Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from db.connection import Base
from models.access import AccessDict


class UserRole(enum.Enum):
    user = 'user'
    admin = 'admin'
    editor = 'editor'


class UserDict(TypedDict):
    id: int
    email: str
    name: str
    role: UserRole
    active: bool
    access: List[AccessDict]
    organisation: int


class UserSimple(TypedDict):
    email: str
    name: str
    role: UserRole
    active: bool


class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    email = Column(String, unique=True)
    name = Column(String)
    role = Column(Enum(UserRole))
    active = Column(Boolean, nullable=True, default=True)
    created = Column(DateTime, default=datetime.utcnow)
    organisation = Column(Integer, ForeignKey('organisation.id'))
    access = relationship("Access",
                          cascade="all, delete",
                          passive_deletes=True,
                          backref="access")

    def __init__(self, email: str, name: str, role: UserRole, active: bool,
                 organisation: int):
        self.email = email
        self.name = name
        self.active = active
        self.role = role
        self.organisation = organisation

    def __repr__(self) -> int:
        return f"<User {self.id}>"

    @property
    def serialize(self) -> UserDict:
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "active": self.active,
            "access": [a.administration for a in self.access],
            "organisation": self.organisation
        }


class UserBase(BaseModel):
    id: int
    email: str
    name: str
    role: UserRole
    active: Optional[bool] = False
    email_verified: Optional[bool] = False
    picture: Optional[str] = None
    name: Optional[str] = None
    organisation: int

    class Config:
        orm_mode = True


class UserResponse(BaseModel):
    current: int
    data: List[UserBase]
    total: int
    total_page: int


class UserAccessBase(BaseModel):
    id: int
    email: str
    name: str
    role: UserRole
    active: Optional[bool] = False
    access: List[int]
    organisation: int

    class Config:
        orm_mode = True
