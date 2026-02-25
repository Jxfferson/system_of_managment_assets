from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

DATABASE_URL = (
    f"mssql+pyodbc://{settings.DB_USER}:{settings.DB_PASSWORD}"
    f"@{settings.DB_SERVER}/{settings.DB_DATABASE}"
    f"?driver={settings.DB_DRIVER.replace(' ', '+')}"
)

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)