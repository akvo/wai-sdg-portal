from typing import List, Optional
from sqlalchemy import and_
from sqlalchemy.orm import Session
from models.question import Question, QuestionDict, QuestionBase, QuestionType
from models.option import Option, OptionDict


def add_question(session: Session,
                 name: str,
                 form: int,
                 question_group: int,
                 type: QuestionType,
                 meta: bool,
                 order: Optional[int] = None,
                 option: Optional[List[OptionDict]] = None) -> QuestionBase:
    last_question = session.query(Question).filter(
        and_(Question.form == form,
             Question.question_group == question_group)).order_by(
                 Question.order.desc()).first()
    if last_question:
        last_question = last_question.order + 1
    else:
        last_question = 1
    question = Question(name=name,
                        order=last_question,
                        form=form,
                        meta=meta,
                        question_group=question_group,
                        type=type)
    if option:
        for o in option:
            opt = Option(name=o["name"])
            if "order" in o:
                opt.order = o["order"]
            if "color" in o:
                opt.color = o["color"]
            question.option.append(opt)
    session.add(question)
    session.commit()
    session.flush()
    session.refresh(question)
    return question


def get_question(session: Session,
                 form: Optional[int] = None) -> List[QuestionDict]:
    if form:
        return session.query(Question).filter(form=form).all()
    return session.query(Question).all()


def get_question_type(session: Session, id: int) -> QuestionDict:
    question = session.query(Question).filter(Question.id == id).first()
    return question


def get_question_by_name(session: Session, form: int,
                         name: str) -> QuestionDict:
    name = name.replace("_", " ").lower().strip()
    question = session.query(Question).filter(
        and_(Question.name == name, Question.form == form)).first()
    return question
