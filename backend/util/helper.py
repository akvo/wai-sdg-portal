import uuid


def tr(obj):
    return " ".join(filter(lambda x: len(x), obj.strip().split(" ")))


def get_uuid():
    return "-".join(str(uuid.uuid4()).split("-")[1:4])


class HText(str):
    def __init__(self, string):
        self.obj = [string] if "|" not in string else string.split("|")
        self.clean = "|".join([tr(o) for o in self.obj])


class UUID(str):
    def __init__(self, string: str):
        self.uuid = get_uuid()
        self.str = f"{string}-{self.uuid}"
