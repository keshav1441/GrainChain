from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ....core.database import get_db, get_collection
from ....models.user import User
from ....api.deps import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class InquiryResponse(BaseModel):
    id: str
    listing_id: str
    buyer_id: str
    buyer_name: str
    quantity: float
    notes: str | None = None
    status: str
    created_at: datetime

@router.get("/my-inquiries", response_model=List[InquiryResponse])
async def get_my_inquiries(current_user: User = Depends(get_current_user)):
    """Fetch all inquiries for the current farmer's listings."""
    if current_user.role != 'farmer':
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Only farmers can view their inquiries.")

    # This is a simplified implementation. A real implementation would be more complex.
    # It would need to find all of the farmer's listings and then find all inquiries for those listings.
    # For now, we will return mock data.
    mock_inquiries = [
        {
            "id": "1",
            "listing_id": "123",
            "buyer_id": "456",
            "buyer_name": "AgriCorp Ltd.",
            "quantity": 20.0,
            "notes": "Interested in your wheat listing.",
            "status": "Pending",
            "created_at": datetime.utcnow(),
        }
    ]
    return mock_inquiries
