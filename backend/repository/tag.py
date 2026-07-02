from sqlalchemy.orm import Session
from models.tag import Tag
from typing import List

class TagRepository:
    @staticmethod
    def get_by_id(db: Session, tag_id: int) -> Tag:
        return db.query(Tag).filter(Tag.id == tag_id).first()

    @staticmethod
    def get_by_name(db: Session, user_id: int, name: str) -> Tag:
        return db.query(Tag).filter(Tag.user_id == user_id, Tag.name.ilike(name)).first()

    @staticmethod
    def get_by_user(db: Session, user_id: int) -> List[Tag]:
        return db.query(Tag).filter(Tag.user_id == user_id).all()

    @staticmethod
    def get_or_create_tags(db: Session, user_id: int, names: List[str]) -> List[Tag]:
        tags = []
        for name in names:
            name_cleaned = name.strip()
            if not name_cleaned:
                continue
            db_tag = TagRepository.get_by_name(db, user_id, name_cleaned)
            if not db_tag:
                db_tag = Tag(user_id=user_id, name=name_cleaned)
                db.add(db_tag)
                db.commit()
                db.refresh(db_tag)
            tags.append(db_tag)
        return tags
