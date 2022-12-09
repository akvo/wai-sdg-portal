from fastapi import APIRouter, Response
from typing import List
from models.todos import TodosDict

todos_route = APIRouter()

@todos_route.get("/todos",
    response_model=List[TodosDict],
    tags=["Todos"])
async def index():
    return [{"id": 1, "title": "learning FASTAPI", "tags": ["tech", "self-improvement"]}]

@todos_route.get("/todos/{todo_id}",
    response_model=TodosDict,
    tags=["Todos"])
async def show(todo_id):
    return {"id": todo_id, "title": "learning FASTAPI", "tags": ["tech", "self-improvement"]}
