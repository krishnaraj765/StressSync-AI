from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserInput(BaseModel):
    user_id: int # Add this so we know who is submitting
    bmi: float
    resting_hr_bpm: float
    spo2_avg_pct: float
    sleep_duration_hours: float
    mood: int
    working_hours: float
    screen_time: float