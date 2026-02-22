from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel

from app.api.v1.deps import get_current_user
from app.models.user import User
from app.models.crm import InvestorLead

router = APIRouter()

# --- Schemas ---
class AddLeadInput(BaseModel):
    investor_id: int
    investor_name: str
    investor_hq: str = ""
    investor_type: str = ""

class UpdateLeadInput(BaseModel):
    stage: str

# --- Routes ---
@router.get("/")
async def get_pipeline(current_user: User = Depends(get_current_user)):
    """Fetch all VCs in the founder's CRM"""
    leads = await InvestorLead.find(InvestorLead.user.id == current_user.id).to_list()
    # Convert MongoDB objects to dictionaries for the frontend
    return [{
        "id": str(lead.id),
        "investor_id": lead.investor_id,
        "investor_name": lead.investor_name,
        "investor_hq": lead.investor_hq,
        "investor_type": lead.investor_type,
        "stage": lead.stage,
        "notes": lead.notes
    } for lead in leads]

@router.post("/")
async def add_to_pipeline(input: AddLeadInput, current_user: User = Depends(get_current_user)):
    """Move a VC from the Search Directory into the CRM"""
    existing = await InvestorLead.find_one(
        InvestorLead.user.id == current_user.id,
        InvestorLead.investor_id == input.investor_id
    )
    if existing:
        raise HTTPException(status_code=400, detail="Investor is already in your Pipeline")
    
    lead = InvestorLead(
        user=current_user,
        investor_id=input.investor_id,
        investor_name=input.investor_name,
        investor_hq=input.investor_hq,
        investor_type=input.investor_type,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    await lead.create()
    return {"status": "success", "id": str(lead.id)}

@router.put("/{lead_id}")
async def update_lead_stage(lead_id: str, input: UpdateLeadInput, current_user: User = Depends(get_current_user)):
    """Fired when a user drags a card to a new column"""
    lead = await InvestorLead.get(ObjectId(lead_id))
    if not lead or lead.user.id != current_user.id:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead.stage = input.stage
    lead.updated_at = datetime.utcnow()
    await lead.save()
    return {"status": "success", "new_stage": lead.stage}

@router.delete("/{lead_id}")
async def remove_lead(lead_id: str, current_user: User = Depends(get_current_user)):
    lead = await InvestorLead.get(ObjectId(lead_id))
    if lead and lead.user.id == current_user.id:
        await lead.delete()
    return {"status": "deleted"}