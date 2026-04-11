from pydantic import BaseModel, Field


class ProfileUpdateBase(BaseModel):
    name: str | None = Field(default=None, max_length=200)
    phone: str | None = Field(default=None, max_length=20)
    location: str | None = Field(default=None, max_length=500)


class MechanicProfileUpdate(ProfileUpdateBase):
    expertise: list[str] | None = Field(default=None, max_length=20)


class GarageProfileUpdate(ProfileUpdateBase):
    operatingHours: str | None = Field(default=None, max_length=100)
    mechanicCount: int | str | None = None
    services: list[str] | None = Field(default=None, max_length=20)
