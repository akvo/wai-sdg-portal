from typing import Optional, List, Union
from pydantic import BaseModel
from .models import UserRole


class AccessBase(BaseModel):
    id: Optional[int]
    user: int
    administration: int

    class Config:
        orm_mode = True


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
