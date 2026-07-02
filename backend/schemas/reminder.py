from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from schemas.tag import TagResponse

class ReminderBase(BaseModel):
    title: str = Field(..., description="Title of the reminder")
    remind_at: datetime = Field(..., description="Timestamp of the reminder alert")
    is_completed: bool = Field(default=False, description="Completion status of the reminder")

class ReminderCreate(ReminderBase):
    tags: Optional[List[str]] = Field(default=[], description="List of tag names")

class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    remind_at: Optional[datetime] = None
    is_completed: Optional[bool] = None
    tags: Optional[List[str]] = None

class ReminderResponse(ReminderBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    tags: List[TagResponse] = []

    class Config:
        from_attributes = True
