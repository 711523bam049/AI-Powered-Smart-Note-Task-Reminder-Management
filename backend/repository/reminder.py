from sqlalchemy.orm import Session
from models.reminder import Reminder
from schemas.reminder import ReminderCreate, ReminderUpdate
from repository.tag import TagRepository
from typing import List, Optional

class ReminderRepository:
    @staticmethod
    def get_by_id(db: Session, reminder_id: int) -> Optional[Reminder]:
        return db.query(Reminder).filter(Reminder.id == reminder_id).first()

    @staticmethod
    def get_by_user(db: Session, user_id: int) -> List[Reminder]:
        return db.query(Reminder).filter(Reminder.user_id == user_id).order_by(Reminder.created_at.desc()).all()

    @staticmethod
    def create(db: Session, user_id: int, reminder_in: ReminderCreate) -> Reminder:
        db_reminder = Reminder(
            user_id=user_id,
            title=reminder_in.title,
            remind_at=reminder_in.remind_at,
            is_completed=reminder_in.is_completed
        )
        if reminder_in.tags:
            db_reminder.tags = TagRepository.get_or_create_tags(db, user_id, reminder_in.tags)
            
        db.add(db_reminder)
        db.commit()
        db.refresh(db_reminder)
        return db_reminder

    @staticmethod
    def update(db: Session, db_reminder: Reminder, reminder_in: ReminderUpdate) -> Reminder:
        if reminder_in.title is not None:
            db_reminder.title = reminder_in.title
        if reminder_in.remind_at is not None:
            db_reminder.remind_at = reminder_in.remind_at
        if reminder_in.is_completed is not None:
            db_reminder.is_completed = reminder_in.is_completed
        if reminder_in.tags is not None:
            db_reminder.tags = TagRepository.get_or_create_tags(db, db_reminder.user_id, reminder_in.tags)
            
        db.commit()
        db.refresh(db_reminder)
        return db_reminder

    @staticmethod
    def delete(db: Session, reminder_id: int) -> bool:
        db_reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
        if db_reminder:
            db.delete(db_reminder)
            db.commit()
            return True
        return False
