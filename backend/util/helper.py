import uuid
import re
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import TSVECTOR


def tr(obj):
    return " ".join(filter(lambda x: len(x), obj.strip().split(" ")))


def get_uuid():
    return "-".join(str(uuid.uuid4()).split("-")[1:4])


def contain_numbers(inputString):
    return bool(re.search(r"\d", inputString))


class HText(str):
    def __init__(self, string):
        self.obj = [string] if "|" not in string else string.split("|")
        self.clean = "|".join([tr(o) for o in self.obj])
        self.hasnum = contain_numbers(string)


class UUID(str):
    def __init__(self, string: str):
        self.uuid = get_uuid()
        self.str = f"{string}-{self.uuid}"


class TSVector(sa.types.TypeDecorator):
    impl = TSVECTOR
