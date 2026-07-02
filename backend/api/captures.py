from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Database & Authentication dependencies
from database.session import get_db
from models.user import User
from auth.deps import get_current_user

# Schemas
from schemas.capture import CaptureProcessRequest, CaptureProcessResponse
from schemas.note import NoteCreate, NoteUpdate, NoteResponse
from schemas.task import TaskCreate, TaskUpdate, TaskResponse
from schemas.reminder import ReminderCreate, ReminderUpdate, ReminderResponse

# Repositories
from repository.note import NoteRepository
from repository.task import TaskRepository
from repository.reminder import ReminderRepository

# Services
from services.capture import CaptureService

router = APIRouter(tags=["Captures"])
capture_service = CaptureService()

# --- 1. Natural Language processing captures ---

@router.post("/captures/process", response_model=CaptureProcessResponse, status_code=status.HTTP_201_CREATED)
def process_nlp_capture(
    payload: CaptureProcessRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Intelligently parses user text input, classifies intent, extracts entities,
    generates semantic tags, summarizes note content, and stores the capture.
    """
    try:
        result = capture_service.process_nlp_capture(db, current_user.id, payload.text)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# --- 2. Notes API Routers ---

@router.post("/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    note_in: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return NoteRepository.create(db, current_user.id, note_in)

@router.get("/notes", response_model=List[NoteResponse])
def list_notes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return NoteRepository.get_by_user(db, current_user.id)

@router.get("/notes/{id}", response_model=NoteResponse)
def get_note(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = NoteRepository.get_by_id(db, id)
    if not note or note.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.put("/notes/{id}", response_model=NoteResponse)
def update_note(
    id: int,
    note_in: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = NoteRepository.get_by_id(db, id)
    if not note or note.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found")
    return NoteRepository.update(db, note, note_in)

@router.delete("/notes/{id}", status_code=status.HTTP_200_OK)
def delete_note(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = NoteRepository.get_by_id(db, id)
    if not note or note.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found")
    NoteRepository.delete(db, id)
    return {"message": "Note deleted successfully."}

# --- 3. Tasks API Routers ---

@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return TaskRepository.create(db, current_user.id, task_in)

@router.get("/tasks", response_model=List[TaskResponse])
def list_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return TaskRepository.get_by_user(db, current_user.id)

@router.get("/tasks/{id}", response_model=TaskResponse)
def get_task(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = TaskRepository.get_by_id(db, id)
    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/tasks/{id}", response_model=TaskResponse)
def update_task(
    id: int,
    task_in: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = TaskRepository.get_by_id(db, id)
    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskRepository.update(db, task, task_in)

@router.delete("/tasks/{id}", status_code=status.HTTP_200_OK)
def delete_task(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = TaskRepository.get_by_id(db, id)
    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")
    TaskRepository.delete(db, id)
    return {"message": "Task deleted successfully."}

# --- 4. Reminders API Routers ---

@router.post("/reminders", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
def create_reminder(
    reminder_in: ReminderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ReminderRepository.create(db, current_user.id, reminder_in)

@router.get("/reminders", response_model=List[ReminderResponse])
def list_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ReminderRepository.get_by_user(db, current_user.id)

@router.get("/reminders/{id}", response_model=ReminderResponse)
def get_reminder(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reminder = ReminderRepository.get_by_id(db, id)
    if not reminder or reminder.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return reminder

@router.put("/reminders/{id}", response_model=ReminderResponse)
def update_reminder(
    id: int,
    reminder_in: ReminderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reminder = ReminderRepository.get_by_id(db, id)
    if not reminder or reminder.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return ReminderRepository.update(db, reminder, reminder_in)

@router.delete("/reminders/{id}", status_code=status.HTTP_200_OK)
def delete_reminder(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reminder = ReminderRepository.get_by_id(db, id)
    if not reminder or reminder.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Reminder not found")
    ReminderRepository.delete(db, id)
    return {"message": "Reminder deleted successfully."}
