from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext # Added for security
import pandas as pd
import joblib
import os # Added to help with environment variables
import requests

from database import engine, SessionLocal
import models
import schemas

# Create DB tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# 1. UPDATED CORS: Open for testing, can be restricted to Vercel URL later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. PASSWORD HASHING SETUP
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 3. MODEL LOADING: allows Render deployment via MODEL_URL or model file in backend/model
MODEL_DIR = "model"
MODEL_FILENAME = "stress_model_with_smote.pkl"
MODEL_PATH = os.getenv("MODEL_PATH", os.path.join(MODEL_DIR, MODEL_FILENAME))
MODEL_URL = os.getenv("MODEL_URL")

if not os.path.exists(MODEL_PATH):
    if not MODEL_URL:
        raise RuntimeError(
            f"Model file not found at {MODEL_PATH}. "
            "Add the file to backend/model/ or set MODEL_URL in Render."
        )
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with requests.get(MODEL_URL, stream=True) as response:
        response.raise_for_status()
        with open(MODEL_PATH, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

model = joblib.load(MODEL_PATH)

# Dependency to handle database sessions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- RECOMMENDATION LOGIC ---
def generate_recommendations(data, stress_level):
    factors = []
    recommendations = []

    if data.resting_hr_bpm > 80:
        factors.append("Elevated heart rate")
        recommendations.append("Try breathing exercises and light physical activity")
    if data.spo2_avg_pct < 95:
        factors.append("Low oxygen level")
        recommendations.append("Monitor health and consult a doctor if needed")
    if data.sleep_duration_hours < 6.5:
        factors.append("Very low sleep duration")
        recommendations.append("Increase sleep to at least 7–8 hours for recovery")
    elif data.sleep_duration_hours < 7.5:
        factors.append("Moderate sleep duration")
        recommendations.append("Improve sleep consistency and aim for 7–8 hours")
    if data.mood <= 2:
        factors.append("Low mood level")
        recommendations.append("Engage in activities you enjoy or talk to someone")
    elif data.mood <= 3:
        factors.append("Moderate mood level")
        recommendations.append("Practice mindfulness or relaxation techniques")
    if data.working_hours > 9:
        factors.append("Long working hours")
        recommendations.append("Maintain work-life balance and take breaks")
    if data.screen_time > 6:
        factors.append("Very high screen time")
        recommendations.append("Limit screen usage and take digital detox breaks")
    elif data.screen_time > 4:
        factors.append("High screen time")
        recommendations.append("Follow 20-20-20 rule to reduce eye strain")

    if stress_level == "High":
        summary = "You are experiencing high stress. Immediate lifestyle improvements are recommended."
    elif stress_level == "Medium":
        summary = "You have moderate stress. Small lifestyle adjustments can help improve your well-being."
    else:
        summary = "Your stress level is low. Maintain your current healthy habits."

    if not factors: factors.append("No major negative indicators detected")
    if not recommendations:
        if stress_level == "Low": recommendations.append("Maintain your current healthy lifestyle and routine")
        else: recommendations.append("Focus on improving daily habits like sleep and relaxation")

    return summary, factors, recommendations

# --- AUTHENTICATION ENDPOINTS (WITH HASHING) ---

@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Securely hash the password
    hashed_pwd = hash_password(user.password)
    db_user = models.User(full_name=user.full_name, email=user.email, password=hashed_pwd)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"user_id": db_user.id, "full_name": db_user.full_name}

@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    # Verify the hash
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"user_id": db_user.id, "full_name": db_user.full_name}

@app.put("/forgot-password")
def forgot_password(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Email not found")
    
    # Update with new hash
    db_user.password = hash_password(user.password)
    db.commit()
    return {"message": "Password updated successfully"}

# --- PREDICTION & HISTORY ENDPOINTS ---

@app.post("/predict")
def predict(data: schemas.UserInput, db: Session = Depends(get_db)):
    input_dict = data.dict()
    ml_features = {k: v for k, v in input_dict.items() if k != 'user_id'}
    df = pd.DataFrame([ml_features])

    try:
        prediction = model.predict(df)[0]
        stress_label = {0: "Low", 1: "Medium", 2: "High"}[int(prediction)]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model prediction failed: {str(e)}")

    summary, factors, recommendations = generate_recommendations(data, stress_label)

    user_record = models.UserData(
        user_id=data.user_id,
        bmi=data.bmi,
        resting_hr_bpm=data.resting_hr_bpm,
        spo2_avg_pct=data.spo2_avg_pct,
        sleep_duration_hours=data.sleep_duration_hours,
        mood=data.mood,
        working_hours=data.working_hours,
        screen_time=data.screen_time,
        stress_prediction=stress_label
    )
    db.add(user_record)
    db.commit()

    return {"stress_level": stress_label, "summary": summary, "factors": factors, "recommendations": recommendations}

@app.get("/history/{user_id}")
def get_history(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.UserData).filter(models.UserData.user_id == user_id).order_by(models.UserData.id.asc()).all()