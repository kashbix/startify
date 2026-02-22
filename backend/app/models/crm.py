from typing import Optional
from datetime import datetime
from beanie import Document, Link
from pydantic import BaseModel
from app.models.user import User

class InvestorLead(Document):
    user: Link[User]
    investor_id: int
    investor_name: str
    investor_hq: Optional[str] = None
    investor_type: Optional[str] = None
    
    # The Kanban columns
    stage: str = "Matched" # Default starting column
    notes: Optional[str] = ""
    
    created_at: datetime
    updated_at: datetime

    class Settings:
        name = "investor_leads" # MongoDB collection name