from sqlalchemy.orm import Session
from models.note import Note
from schemas.note import NoteCreate, NoteUpdate
from repository.tag import TagRepository
from typing import List, Optional

class NoteRepository:
    @staticmethod
    def get_by_id(db: Session, note_id: int) -> Optional[Note]:
        return db.query(Note).filter(Note.id == note_id).first()

    @staticmethod
    def get_by_user(db: Session, user_id: int) -> List[Note]:
        return db.query(Note).filter(Note.user_id == user_id).order_by(Note.created_at.desc()).all()

    @staticmethod
    def create(db: Session, user_id: int, note_in: NoteCreate) -> Note:
        db_note = Note(
            user_id=user_id,
            title=note_in.title,
            content=note_in.content
        )
        if note_in.tags:
            db_note.tags = TagRepository.get_or_create_tags(db, user_id, note_in.tags)
            
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
        return db_note

    @staticmethod
    def update(db: Session, db_note: Note, note_in: NoteUpdate) -> Note:
        if note_in.title is not None:
            db_note.title = note_in.title
        if note_in.content is not None:
            db_note.content = note_in.content
        if note_in.summary is not None:
            db_note.summary = note_in.summary
        if note_in.tags is not None:
            db_note.tags = TagRepository.get_or_create_tags(db, db_note.user_id, note_in.tags)
            
        db.commit()
        db.refresh(db_note)
        return db_note

    @staticmethod
    def delete(db: Session, note_id: int) -> bool:
        db_note = db.query(Note).filter(Note.id == note_id).first()
        if db_note:
            db.delete(db_note)
            db.commit()
            return True
        return False
