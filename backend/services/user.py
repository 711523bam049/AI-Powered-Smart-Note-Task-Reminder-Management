from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repository.user import UserRepository
from schemas.user import UserCreate, UserLogin, UserUpdate, Token
from auth.security import verify_password, create_access_token, create_refresh_token
from models.user import User

class UserService:
    """
    Service layer handling core business logic for users and authentication.
    """
    
    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> User:
        """
        Verify the email address is unique, then insert the user.
        Raises HTTP 400 Bad Request if the email already exists.
        """
        existing_user = UserRepository.get_by_email(db, user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )
        return UserRepository.create(db, user_in)

    @staticmethod
    def authenticate_user(db: Session, login_in: UserLogin) -> Token:
        """
        Authenticate email and password, returning JWT access and refresh tokens.
        Raises HTTP 401 Unauthorized if verification fails.
        """
        user = UserRepository.get_by_email(db, login_in.email)
        if not user or not verify_password(login_in.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)
        return Token(access_token=access_token, refresh_token=refresh_token)

    @staticmethod
    def update_profile(db: Session, current_user: User, user_update: UserUpdate) -> User:
        """
        Update email and/or password. Verify email uniqueness if changing email.
        Raises HTTP 400 Bad Request if the new email is already in use.
        """
        if user_update.email and user_update.email != current_user.email:
            existing_user = UserRepository.get_by_email(db, user_update.email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This email address is already in use by another account."
                )
        return UserRepository.update(db, current_user, user_update)
