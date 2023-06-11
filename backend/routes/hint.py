# Please don't use **kwargs
# Keep the code clean and CLEAR
import numpy as np

from fastapi import Depends, Request, APIRouter
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from db.connection import get_session
from models.question import Question, QuestionType
from models.answer import Answer

hint_route = APIRouter()


class HintResponse(BaseModel):
    mean: Optional[str] = None
    q1: Optional[str] = None
    q2: Optional[str] = None
    q3: Optional[str] = None
    max: Optional[str] = None
    min: Optional[str] = None


@hint_route.get(
    "/hint/{question_id:path}",
    response_model=HintResponse,
    name="hint:get",
    summary="get hint for requested question",
    tags=["Dev"],
)
def get(
    req: Request, question_id: int, session: Session = Depends(get_session)
):
    mean, q1, q2, q3, maxs, mins = None, None, None, None, None, None
    question = (
        session.query(Question).filter(Question.id == question_id).first()
    )
    answers = (
        session.query(Answer).filter(Answer.question == question_id).all()
    )
    if question.type == QuestionType.number and answers:
        values = [answer.value for answer in answers]
        mean = f"Average value is {round(np.mean(values), 2)}"
        q1 = f"First quantile value is {round(np.quantile(values, .25), 2)}"
        q2 = f"Second quantile value is {round(np.quantile(values, .50), 2)}"
        q3 = f"Third quantile value is {round(np.quantile(values, .75), 2)}"
        maxs = f"Maximum value is {max(values)}"
        mins = f"Minimum value is {min(values)}"
    return {
        "mean": mean,
        "q1": q1,
        "q2": q2,
        "q3": q3,
        "max": maxs,
        "min": mins,
    }
