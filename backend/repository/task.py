from sqlalchemy.orm import Session
from models.task import Task
from schemas.task import TaskCreate, TaskUpdate
from repository.tag import TagRepository
from typing import List, Optional

class TaskRepository:
    @staticmethod
    def get_by_id(db: Session, task_id: int) -> Optional[Task]:
        return db.query(Task).filter(Task.id == task_id).first()

    @staticmethod
    def get_by_user(db: Session, user_id: int) -> List[Task]:
        return db.query(Task).filter(Task.user_id == user_id).order_by(Task.created_at.desc()).all()

    @staticmethod
    def create(db: Session, user_id: int, task_in: TaskCreate) -> Task:
        db_task = Task(
            user_id=user_id,
            title=task_in.title,
            description=task_in.description,
            due_date=task_in.due_date,
            priority=task_in.priority,
            is_completed=task_in.is_completed
        )
        if task_in.tags:
            db_task.tags = TagRepository.get_or_create_tags(db, user_id, task_in.tags)
            
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def update(db: Session, db_task: Task, task_in: TaskUpdate) -> Task:
        if task_in.title is not None:
            db_task.title = task_in.title
        if task_in.description is not None:
            db_task.description = task_in.description
        if task_in.due_date is not None:
            db_task.due_date = task_in.due_date
        if task_in.priority is not None:
            db_task.priority = task_in.priority
        if task_in.is_completed is not None:
            db_task.is_completed = task_in.is_completed
        if task_in.tags is not None:
            db_task.tags = TagRepository.get_or_create_tags(db, db_task.user_id, task_in.tags)
            
        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def delete(db: Session, task_id: int) -> bool:
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if db_task:
            db.delete(db_task)
            db.commit()
            return True
        return False
