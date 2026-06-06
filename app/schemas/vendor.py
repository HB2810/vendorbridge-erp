from pydantic import BaseModel, EmailStr


class VendorBase(BaseModel):
    name: str
    contact_email: EmailStr
    category: str


class VendorCreate(VendorBase):
    pass


class VendorResponse(VendorBase):
    id: int
    status: str

    class Config:
        from_attributes = True

