from typing import List, Optional
from sqlalchemy.orm import Session
from models.question import Question, QuestionDict, QuestionBase, QuestionType
from models.option import Option


def add_question(session: Session,
                 name: str,
                 order: int,
                 form: int,
                 question_group: int,
                 type: QuestionType,
                 option: Optional[List[str]] = None) -> QuestionBase:
    question = Question(name=name,
                        order=order,
                        form=form,
                        question_group=question_group,
                        type=type)
    if option:
        for o in option:
            question.option.append(Option(name=option))
    session.add(question_group)
    session.commit()
    session.flush()
    session.refresh(question_group)
    return question_group


def get_question(session: Session) -> List[QuestionDict]:
    return session.query(Question).all()
