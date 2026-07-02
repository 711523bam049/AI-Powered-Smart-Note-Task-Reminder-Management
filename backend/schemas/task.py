from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from schemas.tag import TagResponse

class TaskBase(BaseModel):
    title: str = Field(..., description="Title of the task")
    description: Optional[str] = Field(None, description="Detailed description of the task")
    due_date: Optional[datetime] = Field(None, description="Due date of the task")
    priority: str = Field(default="medium", description="Priority level: low, medium, high")
    is_completed: bool = Field(default=False, description="Completion status of the task")

class TaskCreate(TaskBase):
    tags: Optional[List[str]] = Field(default=[], description="List of tag names")

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    is_completed: Optional[bool] = None
    tags: Optional[List[str]] = None

class TaskResponse(TaskBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    tags: List[TagResponse] = []

    class Config:
        from_attributes = True
