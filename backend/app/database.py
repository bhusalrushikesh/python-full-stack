from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import settings

# Primary — writes (POST/PUT/DELETE)
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=300,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Read replica — GET APIs
read_engine = create_engine(
    settings.effective_read_database_url,
    pool_pre_ping=True,
    pool_recycle=300,
)
ReadSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=read_engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Primary DB session for writes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_read():
    """Read replica session for GET APIs."""
    db = ReadSessionLocal()
    try:
        yield db
    finally:
        db.close()
