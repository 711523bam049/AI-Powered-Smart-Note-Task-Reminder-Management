import os
import sys

# Ensure backend folder is in PYTHONPATH for direct execution
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from database.session import Base, engine
# Import all models to register them on Base.metadata
import models  # noqa: F401

def init_db():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully!")

if __name__ == "__main__":
    init_db()
