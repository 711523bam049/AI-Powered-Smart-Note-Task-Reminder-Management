from pydantic import BaseModel
from datetime import datetime

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
