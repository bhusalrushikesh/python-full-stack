from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    category: str = Field(default="General", max_length=80)
    price: float = Field(..., ge=0)
    quantity: int = Field(..., ge=0)
    description: str = Field(default="", max_length=1000)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    category: Optional[str] = Field(None, max_length=80)
    price: Optional[float] = Field(None, ge=0)
    quantity: Optional[int] = Field(None, ge=0)
    description: Optional[str] = Field(None, max_length=1000)


class ProductOut(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
