from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional

# Database & Authentication dependencies
from database.session import get_db
from models.user import User
from auth.deps import get_current_user

# Schemas
from schemas.capture import SearchResponse, DashboardStatsResponse

# Services
from api.captures import capture_service

router = APIRouter(tags=["Search & Dashboard"])

@router.get("/search", response_model=SearchResponse)
def search_captures(
    query: str = Query(..., min_length=1, description="The query to search for"),
    mode: str = Query("keyword", description="Search mode: keyword or semantic"),
    tag: Optional[str] = Query(None, description="Optional tag name to filter by"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search notes, tasks, and reminders for the current user.
    Supports keyword matching (ILIKE) and semantic similarity scoring using Sentence Transformers.
    """
    results = capture_service.search_captures(db, current_user.id, query=query, mode=mode, tag=tag)
    return SearchResponse(results=results, query=query, mode=mode)

@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch activity logs and completion metrics for visualization on the dashboard charts and sidebar panels.
    """
    stats = capture_service.get_dashboard_stats(db, current_user.id)
    return stats
