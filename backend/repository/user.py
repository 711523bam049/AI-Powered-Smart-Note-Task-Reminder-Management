from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserCreate, UserUpdate
from auth.security import get_password_hash

class UserRepository:
    """
    Repository class handling SQLite queries and operations for User records.
    """
    
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> User:
        """
        Fetch a user by their unique primary key ID.
        """
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> User:
        """
        Fetch a user by their email address.
        """
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def create(db: Session, user_in: UserCreate) -> User:
        """
        Insert a new user record into the database with hashed password.
        """
        db_user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password)
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def update(db: Session, db_user: User, user_in: UserUpdate) -> User:
        """
        Update email and/or password (hashing it first) of an existing user.
        """
        if user_in.email is not None:
            db_user.email = user_in.email
        if user_in.password is not None:
            db_user.hashed_password = get_password_hash(user_in.password)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def delete(db: Session, user_id: int) -> bool:
        """
        Delete a user record by ID.
        """
        db_user = db.query(User).filter(User.id == user_id).first()
        if db_user:
            db.delete(db_user)
            db.commit()
            return True
        return False
