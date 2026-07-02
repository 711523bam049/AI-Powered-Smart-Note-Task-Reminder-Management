from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timedelta
import numpy as np
from typing import List, Dict, Any, Optional

# Models
from models.note import Note
from models.task import Task
from models.reminder import Reminder
from models.tag import Tag
from models.activity_log import ActivityLog
from models.search_history import SearchHistory

# Schemas
from schemas.note import NoteCreate, NoteResponse
from schemas.task import TaskCreate, TaskResponse
from schemas.reminder import ReminderCreate, ReminderResponse
from schemas.capture import SearchResultItem

# Repositories
from repository.note import NoteRepository
from repository.task import TaskRepository
from repository.reminder import ReminderRepository
from repository.tag import TagRepository

# NLP Services
from classifier.intent_classifier import IntentClassifier
from entity_extraction.extractor import EntityExtractor
from tagging.tagger import SemanticTagger
from summarization.summarizer import ExtractiveSummarizer

class CaptureService:
    """
    Orchestration service combining NLP processing pipelines and database CRUD repositories
    to capture user intent, extract fields, classify tags, summarize contents, and support searches.
    """
    
    def __init__(self):
        # Load NLP and Machine Learning helper components
        self.intent_classifier = IntentClassifier()
        self.entity_extractor = EntityExtractor()
        self.semantic_tagger = SemanticTagger()
        self.summarizer = ExtractiveSummarizer()

    def process_nlp_capture(self, db: Session, user_id: int, text: str) -> Dict[str, Any]:
        """
        Processes a raw natural language prompt, runs it through the NLP pipeline,
        and persists the output in the matching database table.
        """
        text_clean = text.strip()
        if not text_clean:
            raise ValueError("Capture text cannot be empty.")

        # 1. Pipeline: Intent Classification
        intent_res = self.intent_classifier.predict(text_clean)
        intent = intent_res["intent"]  # note, task, reminder, todo

        # 2. Pipeline: Entity Extraction
        entities = self.entity_extractor.extract(text_clean)
        priority = entities["priority"]
        normalized_due_date_str = entities["normalized_due_date"]
        
        # Parse due date string to datetime object
        due_date = None
        if normalized_due_date_str:
            try:
                due_date = datetime.fromisoformat(normalized_due_date_str)
            except ValueError:
                due_date = None

        # 3. Pipeline: Semantic Tag Generation
        tags_generated = self.semantic_tagger.generate_tags(text_clean)

        # 4. Map intent type to DB entities
        if intent == "note":
            # For Notes: Content is raw query, summarize if it exceeds 100 words
            summary = self.summarizer.summarize(text_clean)
            
            # Title: first 40 characters or first line
            title = text_clean.split("\n")[0]
            if len(title) > 40:
                title = title[:37] + "..."
                
            note_in = NoteCreate(title=title, content=text_clean, tags=tags_generated)
            db_item = NoteRepository.create(db, user_id, note_in)
            db_response = NoteResponse.model_validate(db_item)
            mapped_type = "note"
            action_desc = f"Captured note: {title}"

        elif intent in ("task", "todo"):
            # For Tasks: Description is full query, Title is first sentence/first 60 chars
            title = text_clean.split("\n")[0]
            if len(title) > 60:
                title = title[:57] + "..."
                
            task_in = TaskCreate(
                title=title,
                description=text_clean,
                due_date=due_date,
                priority=priority,
                is_completed=False,
                tags=tags_generated
            )
            db_item = TaskRepository.create(db, user_id, task_in)
            db_response = TaskResponse.model_validate(db_item)
            mapped_type = "task"
            action_desc = f"Captured task: {title}"

        else:  # reminder
            # For Reminders: Remind_at is extracted date (or defaults to tomorrow)
            title = text_clean.split("\n")[0]
            if len(title) > 60:
                title = title[:57] + "..."
                
            if not due_date:
                # Default reminder time: tomorrow at 9:00 AM
                tomorrow = datetime.utcnow() + timedelta(days=1)
                due_date = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 9, 0, 0)
                
            reminder_in = ReminderCreate(
                title=title,
                remind_at=due_date,
                is_completed=False,
                tags=tags_generated
            )
            db_item = ReminderRepository.create(db, user_id, reminder_in)
            db_response = ReminderResponse.model_validate(db_item)
            mapped_type = "reminder"
            action_desc = f"Captured reminder: {title}"

        # 5. Save Activity Log
        activity = ActivityLog(user_id=user_id, action=action_desc)
        db.add(activity)
        db.commit()

        return {
            "intent": intent,
            "type": mapped_type,
            "data": db_response,
            "entities": entities
        }

    def search_captures(
        self, db: Session, user_id: int, query: str, mode: str = "keyword", tag: Optional[str] = None
    ) -> List[SearchResultItem]:
        """
        Searches Note, Task, and Reminder tables for the user.
        Supports standard 'keyword' search and embedding-based 'semantic' search.
        """
        # Save Search History
        search_history = SearchHistory(user_id=user_id, query=query)
        db.add(search_history)
        db.commit()

        results: List[SearchResultItem] = []

        if mode == "keyword":
            # Keyword filter (ILIKE) across Notes
            notes = db.query(Note).filter(
                Note.user_id == user_id,
                or_(Note.title.ilike(f"%{query}%"), Note.content.ilike(f"%{query}%"))
            ).all()
            for n in notes:
                results.append(SearchResultItem(
                    type="note",
                    id=n.id,
                    title=n.title,
                    content_summary=n.summary or n.content[:100],
                    created_at=n.created_at,
                    tags=[t.name for t in n.tags]
                ))

            # Keyword filter across Tasks
            tasks = db.query(Task).filter(
                Task.user_id == user_id,
                or_(Task.title.ilike(f"%{query}%"), Task.description.ilike(f"%{query}%"))
            ).all()
            for t in tasks:
                results.append(SearchResultItem(
                    type="task",
                    id=t.id,
                    title=t.title,
                    content_summary=t.description[:100] if t.description else "",
                    created_at=t.created_at,
                    tags=[tg.name for tg in t.tags]
                ))

            # Keyword filter across Reminders
            reminders = db.query(Reminder).filter(
                Reminder.user_id == user_id,
                Reminder.title.ilike(f"%{query}%")
            ).all()
            for r in reminders:
                results.append(SearchResultItem(
                    type="reminder",
                    id=r.id,
                    title=r.title,
                    content_summary=f"Remind at: {r.remind_at.isoformat()}",
                    created_at=r.created_at,
                    tags=[tg.name for tg in r.tags]
                ))

        else:  # semantic search
            # 1. Fetch all user notes, tasks, reminders
            notes = db.query(Note).filter(Note.user_id == user_id).all()
            tasks = db.query(Task).filter(Task.user_id == user_id).all()
            reminders = db.query(Reminder).filter(Reminder.user_id == user_id).all()

            all_items = []
            corpus_texts = []

            for n in notes:
                all_items.append(("note", n))
                corpus_texts.append(f"{n.title} {n.content}")
            for t in tasks:
                all_items.append(("task", t))
                corpus_texts.append(f"{t.title} {t.description or ''}")
            for r in reminders:
                all_items.append(("reminder", r))
                corpus_texts.append(r.title)

            if corpus_texts:
                # 2. Encode search query and corpus
                query_emb = self.semantic_tagger.model.encode(query, convert_to_numpy=True)
                corpus_embs = self.semantic_tagger.model.encode(corpus_texts, convert_to_numpy=True)

                # 3. Calculate Cosine Similarities
                for idx, (item_type, item) in enumerate(all_items):
                    corp_emb = corpus_embs[idx]
                    dot_prod = np.dot(query_emb, corp_emb)
                    norm_q = np.linalg.norm(query_emb)
                    norm_c = np.linalg.norm(corp_emb)
                    similarity = float(dot_prod / (norm_q * norm_c)) if norm_q > 0 and norm_c > 0 else 0.0

                    # Filter similarity threshold
                    if similarity >= 0.15:
                        if item_type == "note":
                            summary = item.summary or item.content[:100]
                        elif item_type == "task":
                            summary = item.description[:100] if item.description else ""
                        else:
                            summary = f"Remind at: {item.remind_at.isoformat()}"

                        results.append(SearchResultItem(
                            type=item_type,
                            id=item.id,
                            title=item.title,
                            content_summary=summary,
                            score=round(similarity, 4),
                            created_at=item.created_at,
                            tags=[t.name for t in item.tags]
                        ))
                
                # Sort by similarity score descending
                results.sort(key=lambda x: x.score or 0.0, reverse=True)

        # 4. Optional tag filter
        if tag:
            results = [r for r in results if tag.lower() in [t.lower() for t in r.tags]]

        return results

    def get_dashboard_stats(self, db: Session, user_id: int) -> Dict[str, Any]:
        """
        Aggregates usage statistics and counts for Notes, Tasks, and Reminders
        to supply metrics to dashboard visualization panels.
        """
        notes_count = db.query(Note).filter(Note.user_id == user_id).count()
        tasks_count = db.query(Task).filter(Task.user_id == user_id).count()
        reminders_count = db.query(Reminder).filter(Reminder.user_id == user_id).count()
        
        pending_tasks = db.query(Task).filter(Task.user_id == user_id, Task.is_completed == False).count()
        pending_reminders = db.query(Reminder).filter(Reminder.user_id == user_id, Reminder.is_completed == False).count()

        # 1. Weekly activity logs (group by last 7 days)
        today = datetime.utcnow().date()
        days_range = [today - timedelta(days=i) for i in range(6, -1, -1)]  # past 7 days chronologically
        
        start_timestamp = datetime.combine(days_range[0], datetime.min.time())
        activities = db.query(ActivityLog).filter(
            ActivityLog.user_id == user_id,
            ActivityLog.timestamp >= start_timestamp
        ).all()
        
        activity_by_day = {day: 0 for day in days_range}
        for act in activities:
            act_date = act.timestamp.date()
            if act_date in activity_by_day:
                activity_by_day[act_date] += 1
                
        weekly_activity_list = [
            {"date": day.strftime("%Y-%m-%d"), "day": day.strftime("%a"), "count": count}
            for day, count in activity_by_day.items()
        ]

        # 2. Tag Counts
        tags = db.query(Tag).filter(Tag.user_id == user_id).all()
        tag_counts_list = []
        for tg in tags:
            # Count relations
            n_count = len(tg.notes)
            t_count = len(tg.tasks)
            r_count = len(tg.reminders)
            total = n_count + t_count + r_count
            if total > 0:
                tag_counts_list.append({"name": tg.name, "count": total})
                
        tag_counts_list.sort(key=lambda x: x["count"], reverse=True)

        return {
            "total_notes": notes_count,
            "total_tasks": tasks_count,
            "total_reminders": reminders_count,
            "pending_tasks": pending_tasks,
            "pending_reminders": pending_reminders,
            "weekly_activity": weekly_activity_list,
            "tag_counts": tag_counts_list
        }
