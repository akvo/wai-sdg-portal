from datetime import datetime


def write_log(logtype: str, message: str) -> None:
    dt = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open("log.txt", mode="a") as log:
        log.write(f"\n{dt} {logtype}: {message}")
