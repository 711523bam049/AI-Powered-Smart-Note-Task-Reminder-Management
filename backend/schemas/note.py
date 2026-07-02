from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from schemas.tag import TagResponse

class NoteBase(BaseModel):
    title: str = Field(..., description="Title of the note")
    content: str = Field(..., description="Content of the note")

class NoteCreate(NoteBase):
    tags: Optional[List[str]] = Field(default=[], description="List of tag names associated with the note")

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[List[str]] = None

class NoteResponse(NoteBase):
    id: int
    user_id: int
    summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    tags: List[TagResponse] = []

    class Config:
        from_attributes = True
