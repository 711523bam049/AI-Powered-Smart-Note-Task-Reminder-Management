from pydantic import BaseModel, Field
from typing import Optional, Union, Dict, Any, List
from schemas.note import NoteResponse
from schemas.task import TaskResponse
from schemas.reminder import ReminderResponse

class CaptureProcessRequest(BaseModel):
    text: str = Field(..., description="The raw natural language capture string")

class CaptureProcessResponse(BaseModel):
    intent: str = Field(..., description="The classified intent: note, task, reminder, todo")
    type: str = Field(..., description="The mapped capture type: note, task, reminder")
    data: Union[NoteResponse, TaskResponse, ReminderResponse] = Field(..., description="The created db record response")
    entities: Dict[str, Any] = Field(..., description="The extracted NLP entities")

class SearchResultItem(BaseModel):
    type: str = Field(..., description="note, task, or reminder")
    id: int
    title: str
    content_summary: str = Field(..., description="A snippet of content or summary details")
    score: Optional[float] = Field(None, description="Cosine similarity score for semantic search")
    created_at: Any
    tags: List[str] = []

class SearchResponse(BaseModel):
    results: List[SearchResultItem]
    query: str
    mode: str

class DashboardStatsResponse(BaseModel):
    total_notes: int
    total_tasks: int
    total_reminders: int
    pending_tasks: int
    pending_reminders: int
    weekly_activity: List[Dict[str, Any]] = Field(..., description="List of days and capture counts")
    tag_counts: List[Dict[str, Any]] = Field(..., description="Tag names and frequency counts")
