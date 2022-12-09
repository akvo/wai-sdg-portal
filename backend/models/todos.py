from enum import Enum
from typing import List
from typing_extensions import TypedDict

class TodoType(str, Enum):
    project = "Project"
    chore = "Chore"
    school = "School"

class TodosDict(TypedDict):
    id: int
    title: str
    # type: TodoType
    tags: List
