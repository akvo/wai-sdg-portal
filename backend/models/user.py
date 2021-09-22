import enum
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer, Boolean, String
from sqlalchemy import Enum, DateTime
from sqlalchemy.orm import relationship
from db.connection import Base
from models.access import AccessDict, AccessBase


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


class UserBase(BaseModel):
    id: int
    email: str
    role: UserRole
    active: Optional[bool] = False
    email_verified: Optional[bool] = False
    picture: Optional[str] = None
    name: Optional[str] = None

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
    role: UserRole
    active: Optional[bool] = False
    access: List[AccessBase]

    class Config:
        orm_mode = True
