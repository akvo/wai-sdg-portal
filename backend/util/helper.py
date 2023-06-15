import uuid
import re
import functools
import hashlib
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import TSVECTOR

keys = "5mgkswvcrxju3p2dl9-fiz4078b6aentq1ohy"
chars = "9id4aretl6mkx7h10bcu3f-5qojp2gzwy8vns"
an = len(chars)


def tr(obj):
    return " ".join(filter(lambda x: len(x), obj.strip().split(" ")))


def get_uuid():
    return "-".join(str(uuid.uuid4()).split("-")[1:4])


def contain_numbers(inputString):
    return bool(re.search(r"\d", inputString))
    return bool(re.search(r"\d", inputString))


def hash_cipher(text: str, length: int = 4):
    hash_result = hashlib.sha1(bytes(text, "utf-8"))
    dig = hash_result.digest()
    res = ""
    for i in range(0, length):
        x = dig[i] % 52
        if x >= 26:
            res += chr(ord("A") + x - 26)
        else:
            res += chr(ord("a") + x)
    return res


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


class Cipher:
    def __init__(self, str_param):
        self.str_param = str_param

    def encode(self):
        n = self.str_param.split("-")[1]
        n = functools.reduce(lambda a, b: int(a) + int(b), list(str(n)))
        n = str(n)[-1]
        nab = "".join(
            [
                chars[-i if i + int(n) > an else int(n) + i - an]
                for i, a in enumerate(chars)
            ]
        )
        ad = "".join([keys[nab.find(a)] if a in nab else a for a in self.str_param])
        return f"{ad}{n}"

    def decode(self):
        n = int(self.str_param[-1])
        nab = "".join(
            [
                chars[-i if i + int(n) > an else int(n) + i - an]
                for i, a in enumerate(chars)
            ]
        )
        try:
            ad = "".join(
                [nab[keys.find(a)] if a in keys else a for a in self.str_param[:-1]]
            )
            ad = ad.split("-")
            return ad[0], int(ad[1])
        except IndexError:
            pass
        return None, None
