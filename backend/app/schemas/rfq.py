from datetime import datetime

from pydantic import BaseModel


class RFQCreate(BaseModel):
    title: str
    description: str
    deadline: datetime | None = None


class RFQResponse(RFQCreate):
    id: int
    status: str

    class Config:
        from_attributes = True

