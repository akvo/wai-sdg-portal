from os import environ
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


def get_db_url():
    TESTING = environ.get("TESTING")
    INSTANCE_NAME = environ.get("INSTANCE_NAME")
    INSTANCE_DB = INSTANCE_NAME.replace("-", "_")
    DATABASE_URL = environ["DATABASE_URL"]
    if "ONLINE" not in environ:
        DATABASE_URL = DATABASE_URL.replace(INSTANCE_NAME, INSTANCE_DB)
    DB_URL = f"{DATABASE_URL}_test" if TESTING else DATABASE_URL
    return DB_URL


engine = create_engine(get_db_url())
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
