from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import pandas as pd
import joblib
import os
import requests

from database import engine, SessionLocal
import models
import schemas

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# MODEL CONFIG
MODEL_DIR = "model"
MODEL_FILENAME = "stress_model_with_smote.pkl"
MODEL_PATH = os.path.join(MODEL_DIR, MODEL_FILENAME)

DEFAULT_MODEL_URL = "https://drive.google.com/uc?id=1rafZBuY32GAGy5U11q2Uk1ZrbdAOqZe-"
MODEL_URL = os.getenv("MODEL_URL", DEFAULT_MODEL_URL)

model = None  # global model

# Download model from Google Drive
def download_file_from_drive(url, dest_path):
    session = requests.Session()
    response = session.get(url, stream=True)

    for key, value in response.cookies.items():
        if key.startswith("download_warning"):
            params = {"id": url.split("=")[-1], "confirm": value}
            response = session.get("https://drive.google.com/uc", params=params, stream=True)
            break

    with open(dest_path, "wb") as f:
        for chunk in response.iter_content(8192):
            if chunk:
                f.write(chunk)

# Load model
def load_model():
    try:
        os.makedirs(MODEL_DIR, exist_ok=True)

        if os.path.exists(MODEL_PATH) and os.path.getsize(MODEL_PATH) > 10_000_000:
            print("✅ Model exists, skipping download")
        else:
            print("⬇️ Downloading model...")
            download_file_from_drive(MODEL_URL, MODEL_PATH)
            print("✅ Download complete")

        print("📦 Loading model...")
        loaded_model = joblib.load(MODEL_PATH)
        print("✅ Model loaded")

        return loaded_model

    except Exception as e:
        print(f"❌ Model load error: {e}")
        return None

# DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Recommendation logic
def generate_recommendations(data, stress_level):
    factors = []
    recommendations = []

    if data.resting_hr_bpm > 80:
        factors.append("Elevated heart rate")
        recommendations.append("Try breathing exercises and light activity")

    if data.spo2_avg_pct < 95:
        factors.append("Low oxygen level")
        recommendations.append("Monitor health and consult doctor")

    if data.sleep_duration_hours < 6.5:
        factors.append("Low sleep")
        recommendations.append("Sleep at least 7–8 hours")

    if data.mood <= 2:
        factors.append("Low mood")
        recommendations.append("Talk to someone or relax")

    if data.working_hours > 9:
        factors.append("Long work hours")
        recommendations.append("Maintain work-life balance")

    if data.screen_time > 6:
        factors.append("High screen time")
        recommendations.append("Reduce screen usage")

    summary = {
        "High": "High stress detected",
        "Medium": "Moderate stress",
        "Low": "Low stress"
    }[stress_level]

    return summary, factors, recommendations

# AUTH APIs
@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email exists")

    db_user = models.User(
        full_name=user.full_name,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return {"user_id": db_user.id}

@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"user_id": db_user.id}

# 🚀 FIXED PREDICT API (LAZY LOADING)
@app.post("/predict")
def predict(data: schemas.UserInput, db: Session = Depends(get_db)):
    global model

    # Lazy load model
    if model is None:
        print("⚡ Loading model on demand...")
        model = load_model()

        if model is None:
            raise HTTPException(status_code=500, detail="Model load failed")

    input_dict = data.dict()
    ml_features = {k: v for k, v in input_dict.items() if k != "user_id"}
    df = pd.DataFrame([ml_features])

    try:
        prediction = model.predict(df)[0]
        stress_label = {0: "Low", 1: "Medium", 2: "High"}[int(prediction)]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    summary, factors, recommendations = generate_recommendations(data, stress_label)

    # Save data
    record = models.UserData(**input_dict, stress_prediction=stress_label)
    db.add(record)
    db.commit()

    return {
        "stress_level": stress_label,
        "summary": summary,
        "factors": factors,
        "recommendations": recommendations
    }

# History API
@app.get("/history/{user_id}")
def get_history(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.UserData).filter(
        models.UserData.user_id == user_id
    ).all()