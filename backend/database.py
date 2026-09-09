import os
import shutil
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ORIGINAL_DB_PATH = os.path.join(BASE_DIR, 'decarbx.db')

# Vercel serverless runs in read-only environment except /tmp
if os.environ.get("VERCEL"):
    TMP_DB_PATH = "/tmp/decarbx.db"
    if not os.path.exists(TMP_DB_PATH):
        candidates = [
            ORIGINAL_DB_PATH,
            os.path.join(BASE_DIR, '..', 'api', 'decarbx.db'),
            os.path.join(os.getcwd(), 'api', 'decarbx.db'),
            os.path.join(os.getcwd(), 'backend', 'decarbx.db')
        ]
        for candidate in candidates:
            if os.path.exists(candidate):
                try:
                    shutil.copy2(candidate, TMP_DB_PATH)
                    break
                except Exception:
                    pass
    DB_PATH = TMP_DB_PATH if os.path.exists(TMP_DB_PATH) else ORIGINAL_DB_PATH
else:
    DB_PATH = ORIGINAL_DB_PATH

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
