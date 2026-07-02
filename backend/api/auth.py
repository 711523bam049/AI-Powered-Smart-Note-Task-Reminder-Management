from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.session import get_db
from schemas.user import UserCreate, UserLogin, UserResponse, Token, TokenRefreshRequest
from services.user import UserService
from jose import jwt, JWTError
from config.config import settings
from auth.security import create_access_token, create_refresh_token
from repository.user import UserRepository

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    Validates email format and password length.
    """
    return UserService.register_user(db, user_in)

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate a user credentials and return an access/refresh token pair.
    """
    return UserService.authenticate_user(db, login_in)

@router.post("/refresh", response_model=Token)
def refresh_token(request: TokenRefreshRequest, db: Session = Depends(get_db)):
    """
    Refresh the access and refresh token pair using a valid refresh token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid refresh token.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the refresh token
        payload = jwt.decode(
            request.refresh_token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        user_id_str: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        # Verify it's a refresh token
        if user_id_str is None or token_type != "refresh":
            raise credentials_exception
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception
        
    user = UserRepository.get_by_id(db, user_id=user_id)
    if user is None:
        raise credentials_exception
        
    # Generate new access token and refresh token
    new_access_token = create_access_token(subject=user.id)
    new_refresh_token = create_refresh_token(subject=user.id)
    return Token(access_token=new_access_token, refresh_token=new_refresh_token)
