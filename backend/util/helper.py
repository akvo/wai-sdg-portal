def tr(obj):
    return " ".join(filter(lambda x: len(x), obj.strip().split(" ")))


class HText(str):
    def __init__(self, string):
        self.obj = [string] if "|" not in string else string.split("|")
        self.clean = "|".join([tr(o) for o in self.obj])
