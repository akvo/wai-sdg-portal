import sys
import random
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_01_auth import Acc
from sqlalchemy.orm import Session
from models.question import Question, QuestionType
from tasks.validation import dependency_checker

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(True)


class TestDependencyCheckerUnit:
    @pytest.mark.asyncio
    async def test_dependency_checker(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        dependency_q = (
            session.query(Question)
            .filter(Question.type == QuestionType.multiple_option)
            .first()
        )
        answer = random.choice([opt.name for opt in dependency_q.option])
        dependency = [{"id": dependency_q.id, "options": [answer]}]

        # Create a question first
        res = await client.post(
            app.url_path_for("question:create"),
            params={
                "id": 8,
                "name": "Specify other water source",
                "form": 1,
                "question_group": "Water",
                "meta": False,
                "type": "text",
                "required": True,
            },
            json={"dependency": dependency},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        assert res.json() == {
            "id": 8,
            "form": 1,
            "question_group": 2,
            "name": "Specify other water source",
            "order": 1,
            "meta": False,
            "type": "text",
            "required": True,
            "rule": None,
            "option": [],
            "dependency": dependency,
            "tooltip": None,
            "translations": None,
            "api": None,
            "addons": None,
        }
        # single option answer
        index = 2
        cell = f"A{index}"
        answered = [
            {
                "id": dependency_q.id,
                "answer": answer,
                "cell": cell,
                "index": index,
            }
        ]
        question = session.query(Question).filter(Question.id == 8).first()
        valid_deps, answer_deps = dependency_checker(
            qs=question.dependency, answered=answered, index=index
        )
        assert valid_deps is True
        assert answer_deps == answered

        # multiple option answer
        index = 2
        cell = f"A{index}"
        answered = [
            {
                "id": dependency_q.id,
                "answer": f"Option A|{answer}|taps",
                "cell": cell,
                "index": index,
            }
        ]
        question = session.query(Question).filter(Question.id == 8).first()
        valid_deps, answer_deps = dependency_checker(
            qs=question.dependency, answered=answered, index=index
        )
        assert valid_deps is True
        assert answer_deps == answered

        # float or number answer
        index = 2
        cell = f"A{index}"
        answered = [
            {
                "id": dependency_q.id,
                "answer": 2.5,
                "cell": cell,
                "index": index,
            }
        ]
        question = session.query(Question).filter(Question.id == 8).first()
        valid_deps, answer_deps = dependency_checker(
            qs=question.dependency, answered=answered, index=index
        )
        assert valid_deps is False
        assert answer_deps == answered
