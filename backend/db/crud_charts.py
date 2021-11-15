from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from models.answer import Answer
import collections


def get_chart_data(session: Session,
                   question: int,
                   stack: int = None):
    answer = session.query(Answer.options,
                           func.count(Answer.id))
    if stack:
        answer = answer.filter(or_(Answer.question == question,
                                   Answer.question == stack))
    else:
        answer = answer.filter(Answer.question == question)
        answer = answer.group_by(Answer.options)
        answer = answer.all()
        answer = [{a[0][0].lower(): a[1]} for a in answer]
        counter = collections.Counter()
        for d in answer:
            counter.update(d)
        answer = [{"name": k, "value": v} for k, v in dict(counter).items()]
    return answer
