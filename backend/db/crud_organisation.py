from typing import List, Optional
from sqlalchemy.orm import Session
from models.organisation import Organisation
from models.organisation import OrganisationDict, OrganisationType


def add_organisation(
    session: Session,
    name: str,
    type: OrganisationType,
    id: Optional[int] = None,
) -> OrganisationDict:
    organisation = Organisation(id=id, name=name, type=type)
    session.add(organisation)
    session.commit()
    session.flush()
    session.refresh(organisation)
    return organisation


def update_organisation(
    session: Session,
    id: int,
    name: Optional[str] = None,
    type: Optional[OrganisationType] = None,
) -> None:
    organisation = (
        session.query(Organisation).filter(Organisation.id == id).first()
    )
    if name:
        organisation.name = name
    if type:
        organisation.type = type
    session.commit()
    session.flush()
    session.refresh(organisation)


def get_organisation(session: Session) -> List[Organisation]:
    return session.query(Organisation).all()


def get_organisation_by_id(session: Session, id: int) -> Organisation:
    return session.query(Organisation).filter(Organisation.id == id).first()


def get_organisation_by_name(session: Session, name: str) -> Organisation:
    return (
        session.query(Organisation)
        .filter(Organisation.name.ilike("%{}%".format(name.lower().strip())))
        .first()
    )
