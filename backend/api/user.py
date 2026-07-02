from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from database.session import get_db
from schemas.user import UserResponse, UserUpdate
from models.user import User
from auth.deps import get_current_user
from services.user import UserService
from repository.user import UserRepository

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """
    Retrieve details of the currently authenticated user.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update profile details (email or password) for the currently authenticated user.
    Checks for email uniqueness if changing email.
    """
    return UserService.update_profile(db, current_user, user_update)

@router.delete("/me", status_code=status.HTTP_200_OK)
def delete_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete the account of the currently authenticated user.
    Permanently deletes all associated notes, tasks, reminders, and user records.
    """
    UserRepository.delete(db, current_user.id)
    return {"message": "Account successfully deleted."}
