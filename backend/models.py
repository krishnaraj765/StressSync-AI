from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime # Added DateTime
from sqlalchemy.orm import relationship
from datetime import datetime # Added datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String) 

    records = relationship("UserData", back_populates="owner")

class UserData(Base):
    __tablename__ = "user_data"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) 

    # Add it here to track the date and time of the prediction
    created_at = Column(DateTime, default=datetime.utcnow) 

    bmi = Column(Float)
    resting_hr_bpm = Column(Float)
    spo2_avg_pct = Column(Float)
    sleep_duration_hours = Column(Float)
    mood = Column(Integer)
    working_hours = Column(Float)
    screen_time = Column(Float)
    stress_prediction = Column(String)

    owner = relationship("User", back_populates="records")