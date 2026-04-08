import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# The backend will look for a variable named DATABASE_URL on Render. 
# If not found, it defaults to your local postgres.
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:raj765@localhost:5432/stress_dbb")

# Fix for Render: SQLAlchemy requires "postgresql://" but some providers use "postgres://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()