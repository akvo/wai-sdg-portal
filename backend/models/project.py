from pydantic import BaseModel
from typing import Optional


class ProjectBase(BaseModel):
    id: int
    name: int
    label: Optional[str] = None

    class Config:
        orm_mode = True
