from typing import List
from typing_extensions import TypedDict
import enum
from datetime import datetime
from sqlalchemy import Column, Integer, Boolean, Float, String
from sqlalchemy import Text, Enum, DateTime
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from .connection import Base


class AccessDict(TypedDict):
    id: int
    user: int
    administration: int


class Access(Base):
    __tablename__ = "access"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    user = Column(Integer, ForeignKey('user.id'))
    administration = Column(Integer, ForeignKey('administration.id'))

    def __init__(self, user: int, administration: int):
        self.user = user
        self.administration = administration

    def __repr__(self) -> int:
        return f"<Access {self.id}>"

    @property
    def serialize(self) -> AccessDict:
        return {"id": self.id, "user": self.user, "administration": self.administration}


# BEGIN USER


class UserRole(enum.Enum):
    user = 'user'
    admin = 'admin'


class UserDict(TypedDict):
    id: int
    email: str
    role: UserRole
    active: bool
    access: List[AccessDict]


class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    email = Column(String, unique=True)
    role = Column(Enum(UserRole))
    active = Column(Boolean, nullable=True, default=True)
    created = Column(DateTime, default=datetime.utcnow)
    access = relationship("Access",
                          cascade="all, delete",
                          passive_deletes=True,
                          backref="access")

    def __init__(self, email: str, role: UserRole, active: bool):
        self.email = email
        self.active = active
        self.role = role

    def __repr__(self) -> int:
        return f"<User {self.id}>"

    @property
    def serialize(self) -> UserDict:
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role,
            "active": self.active,
            "access": self.access
        }
