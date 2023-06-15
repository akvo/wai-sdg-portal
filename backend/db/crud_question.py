from typing import List, Optional
from sqlalchemy import and_
from sqlalchemy.orm import Session
from models.data import Data
from models.data import Answer
from models.question_group import QuestionGroup
from models.question import Question, QuestionIds
from models.question import QuestionDict, QuestionBase, QuestionType
from models.option import Option, OptionDict
import db.crud_option as crud_option


def get_last_question(session: Session, form: int, question_group: int):
    last_question = (
        session.query(Question)
        .filter(
            and_(
                Question.form == form,
                Question.question_group == question_group,
            )
        )
        .order_by(Question.order.desc())
        .first()
    )
    if last_question:
        last_question = last_question.order + 1
    else:
        last_question = 1
    return last_question


def generateOptionObj(obj: dict):
    opt = Option(name=str(obj["name"]).strip())
    if "id" in obj:
        opt.id = obj.get("id")
    if "order" in obj:
        opt.order = obj.get("order")
    if "color" in obj:
        opt.color = obj.get("color")
    if "score" in obj:
        opt.score = obj.get("score")
    if "code" in obj:
        opt.code = obj.get("code")
    if "translations" in obj:
        opt.translations = obj.get("translations")
    return opt


def add_question(
    session: Session,
    name: str,
    form: int,
    question_group: int,
    type: QuestionType,
    meta: bool,
    id: Optional[int] = None,
    order: Optional[int] = None,
    option: Optional[List[OptionDict]] = None,
    required: Optional[bool] = True,
    rule: Optional[dict] = None,
    dependency: Optional[List[dict]] = None,
    tooltip: Optional[dict] = None,
    translations: Optional[List[dict]] = None,
    api: Optional[dict] = None,
    addons: Optional[dict] = None,
) -> QuestionBase:
    last_question = get_last_question(
        session=session, form=form, question_group=question_group
    )
    question = Question(
        id=id,
        name=name,
        order=order if order else last_question,
        form=form,
        meta=meta,
        question_group=question_group,
        type=type,
        required=required,
        rule=rule,
        dependency=dependency,
        tooltip=tooltip,
        translations=translations,
        api=api,
        addons=addons,
    )
    if option:
        for o in option:
            opt = generateOptionObj(obj=o)
            question.option.append(opt)
    session.add(question)
    session.commit()
    session.flush()
    session.refresh(question)
    return question


def update_question(
    session: Session,
    name: str,
    form: int,
    question_group: int,
    type: QuestionType,
    meta: bool,
    id: int,
    order: Optional[int] = None,
    option: Optional[List[OptionDict]] = None,
    clear_option: Optional[bool] = False,
    required: Optional[bool] = True,
    rule: Optional[dict] = None,
    dependency: Optional[List[dict]] = None,
    tooltip: Optional[dict] = None,
    translations: Optional[List[dict]] = None,
    api: Optional[dict] = None,
    addons: Optional[dict] = None,
) -> QuestionBase:
    last_question = get_last_question(
        session=session, form=form, question_group=question_group
    )
    question = (
        session.query(Question)
        .filter(and_(Question.form == form, Question.id == id))
        .first()
    )
    # clear option when question type change
    if question.type in [QuestionType.option, QuestionType.multiple_option]:
        session.query(Option).filter(Option.question == question.id).delete(
            synchronize_session="fetch"
        )
    question.name = name
    question.order = order if order else last_question
    question.meta = meta
    question.question_group = question_group
    question.type = type
    question.required = required
    question.rule = rule
    question.dependency = dependency
    question.tooltip = tooltip
    question.translations = translations
    question.api = api
    question.addons = addons
    if clear_option:
        session.query(Option).filter(Option.question == question.id).delete()
    if option:
        for o in option:
            find_option = session.query(Option).filter(Option.id == o.get("id")).first()
            if not find_option:
                opt = generateOptionObj(obj=o)
                question.option.append(opt)
            if find_option:
                crud_option.update_option(
                    session=session,
                    id=o.get("id"),
                    name=str(o["name"]).strip(),
                    order=o.get("order"),
                    color=o.get("color"),
                    score=o.get("score"),
                    code=o.get("code").strip() if o.get("code") else None,
                    translations=o.get("translations"),
                )
    session.commit()
    session.flush()
    session.refresh(question)
    return question


def get_question(session: Session, form: Optional[int] = None) -> List[QuestionDict]:
    if form:
        return session.query(Question).filter(Question.form == form).all()
    return session.query(Question).all()


def get_question_ids(session: Session, form: int) -> List[QuestionIds]:
    return session.query(Question).filter(Question.form == form).all()


def get_question_by_id(session: Session, id: int) -> QuestionDict:
    return session.query(Question).filter(Question.id == id).first()


def get_question_by_name(session: Session, form: int, name: str) -> QuestionDict:
    name = name.replace("_", " ").lower().strip()
    question = (
        session.query(Question)
        .filter(and_(Question.name == name, Question.form == form))
        .first()
    )
    return question


def get_question_by_form_id(session: Session, fid: int) -> QuestionDict:
    return session.query(Question).filter(Question.form == fid).all()


def get_question_name(session: Session, id: int) -> str:
    question = session.query(Question.name).filter(Question.id == id).first()
    if question:
        return question.name
    return ""


def get_excel_headers(session: Session, form: int) -> List[str]:
    questions = (
        session.query(Question)
        .join(QuestionGroup)
        .filter(Question.form == form)
        .order_by(QuestionGroup.order, Question.order)
    )
    return [q.to_excel_header for q in questions]


def get_excel_question(session: Session, form: int) -> List[QuestionDict]:
    return (
        session.query(Question)
        .join(QuestionGroup)
        .filter(Question.form == form)
        .order_by(QuestionGroup.order, Question.order)
    )


def get_definition(session: Session, form: int):
    questions = (
        session.query(Question)
        .join(QuestionGroup)
        .filter(Question.form == form)
        .order_by(QuestionGroup.order, Question.order)
    )
    framed = []
    for q in [qs.to_definition for qs in questions]:
        rule = ""
        dependency = ""
        if q["rule"]:
            rule = []
            for r in q["rule"]:
                rtext = f"{r}: " + str(q["rule"][r])
                rule.append(rtext)
            rule = " ".join(rule)
        if q["dependency"]:
            dependency = []
            for d in q["dependency"]:
                did = d["id"]
                options = "|".join(d["options"])
                dtext = f"{did}: " + options
                dependency.append(dtext)
            dependency = "\n".join(dependency)
        if q["options"] and q["type"] != QuestionType.answer_list:
            for o in q["options"]:
                framed.append(
                    {
                        "id": q["id"],
                        "question": q["name"],
                        "type": q["type"],
                        "option": o,
                        "required": "YES" if q["required"] else "NO",
                        "rule": rule,
                        "dependency": dependency,
                    }
                )
        if q["type"] == QuestionType.answer_list:
            answer_data = (
                session.query(Answer)
                .filter(Answer.question == int(q["options"][0]))
                .all()
            )
            parent_data = (
                session.query(Data)
                .filter(Data.id.in_([a.data for a in answer_data]))
                .all()
            )
            for parent in parent_data:
                framed.append(
                    {
                        "id": q["id"],
                        "question": q["name"],
                        "type": q["type"],
                        "option": parent.name,
                        "required": "YES" if q["required"] else "NO",
                        "rule": rule,
                        "dependency": dependency,
                    }
                )
        else:
            framed.append(
                {
                    "id": q["id"],
                    "question": q["name"],
                    "type": q["type"],
                    "option": "",
                    "required": "YES" if q["required"] else "NO",
                    "rule": rule,
                    "dependency": dependency,
                }
            )
    return framed


def validate_dependency(session: Session, dependency: List[dict]):
    # TODO: need to allow dependency for number and date
    errors = []
    for question in dependency:
        qid = question["id"]
        opt = question["options"]
        if not len(opt):
            errors.append("Should have at least 1 option")
        question = get_question_by_id(session=session, id=qid)
        if not question:
            errors.append(f"Question {qid} not found")
        if question.type not in [
            QuestionType.option,
            QuestionType.multiple_option,
        ]:
            errors.append(f"Question {qid} type should be option")
        options = [o.name for o in question.option]
        for o in opt:
            if o not in options:
                errors.append(f"Option {o} is not part of {qid}")
    return errors


def get_project_question(session: Session, form: int) -> QuestionDict:
    return (
        session.query(Question)
        .filter(
            and_(
                Question.form == form,
                Question.type == QuestionType.answer_list,
            )
        )
        .first()
    )


def delete_by_form(session: Session, form: int) -> None:
    session.query(Question).filter(Question.form == form).delete()
    session.commit()
