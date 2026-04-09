# Jiovio - Stress Level Checker Application

A full-stack web application that uses machine learning to assess stress levels based on health metrics and provides personalized recommendations for stress management.

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Setup Instructions](#setup-instructions)
4. [API Documentation](#api-documentation)
5. [ML Model Explanation](#ml-model-explanation)
6. [Technology Stack](#technology-stack)
7. [Features](#features)
8. [Project Structure](#project-structure)

---

## Project Overview

**Jiovio** is an intelligent stress monitoring application that analyzes multiple health indicators and predicts stress levels using a machine learning model trained with SMOTE (Synthetic Minority Over-sampling Technique). The application provides users with:

- Real-time stress level predictions
- Personalized recommendations based on health metrics
- Historical tracking of stress assessments
- Voice assistant for accessibility
- Secure user authentication

**Target Users:** Individuals seeking to monitor and manage their mental health and stress levels

**Key Value Proposition:** Non-invasive stress assessment using wearable and self-reported health data

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Components:                                          │   │
│  │ • Auth.js - User login/registration                │   │
│  │ • StressForm.js - Input health metrics             │   │
│  │ • StressChart.js - Visualize predictions           │   │
│  │ • StressHistory.js - View past assessments         │   │
│  │ • VoiceButton.js - Voice assistant control        │   │
│  │ • useVoiceAssistant.js - Voice interaction hook   │   │
│  └──────────────────────────────────────────────────────┘   │
│           ↓ HTTP/CORS (localhost:3000)                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Endpoints:                                           │   │
│  │ • POST /register - User registration               │   │
│  │ • POST /login - User authentication                │   │
│  │ • PUT /forgot-password - Password recovery         │   │
│  │ • POST /predict - ML stress prediction             │   │
│  │ • GET /history/{user_id} - Fetch user history     │   │
│  │ • generate_recommendations() - Insight generation  │   │
│  └──────────────────────────────────────────────────────┘   │
│           ↓ SQL Queries (localhost:8000)                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  ML Model (scikit-learn)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Model: stress_model_with_smote.pkl                  │   │
│  │ Type: Classification (3 classes)                    │   │
│  │ Classes: Low, Medium, High stress                   │   │
│  │ Input Features: 7 health metrics                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Database (PostgreSQL)                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Tables:                                              │   │
│  │ • users - User accounts                             │   │
│  │ • user_data - Assessment records                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Input (Health Metrics)
        ↓
React Form Component
        ↓
HTTP POST /predict
        ↓
FastAPI Backend (Validation)
        ↓
ML Model Inference
        ↓
generate_recommendations() Function
        ↓
Save to PostgreSQL Database
        ↓
Return: Stress Level + Summary + Factors + Recommendations
        ↓
React Components Display Results
        ↓
Voice Assistant Optional Read-Aloud
```

---

## Setup Instructions

### Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 14+** and **npm** (for frontend)
- **PostgreSQL 12+** (for database)
- **Git**

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd d:\Jiovio\backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On macOS/Linux: source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure the database connection:**
   - Open `database.py`
   - Update the `DATABASE_URL` with your PostgreSQL credentials:
     ```python
     DATABASE_URL = "postgresql://postgres:your_password@localhost:5432/stress_dbb"
     ```

5. **Ensure the ML model is present:**
   - Verify that `backend/model/stress_model_with_smote.pkl` exists
   - This is the pre-trained scikit-learn model

6. **Start the backend server:**
   ```bash
   uvicorn main:app --reload
   ```
   - Server will run at `http://127.0.0.1:8000`
   - API documentation available at `http://127.0.0.1:8000/docs`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd d:\Jiovio\stress-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   - Application opens at `http://localhost:3000`

4. **Build for production (optional):**
   ```bash
   npm run build
   ```

### PostgreSQL Database Setup

1. **Create the database:**
   ```sql
   CREATE DATABASE stress_dbb;
   ```

2. **The backend automatically creates tables on startup:**
   - `users` table (for user accounts)
   - `user_data` table (for assessment records)

---

## Render Deployment

This repository is configured for Render using `render.yaml`.

### Backend
- Service root: `backend/`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port ${PORT}`
- Required environment variables:
  - `DATABASE_URL`
  - `MODEL_URL` (or add the model file to `backend/model/stress_model_with_smote.pkl`)
- Live deployment: `https://stresssync-ai.onrender.com/`
- Public API docs: `https://stresssync-ai.onrender.com/docs`

### Frontend
- Service root: `stress-frontend/`
- Build command: `npm install && npm run build`
- Publish directory: `build`
- Required environment variable:
  - `REACT_APP_API_BASE_URL` (set to your backend URL)
- Live deployment: `https://stresssyncai.onrender.com/`

### Local fallback
- Frontend uses `http://127.0.0.1:8000` when `REACT_APP_API_BASE_URL` is not set.
- Backend downloads the model file at startup if `MODEL_URL` is set.

---

## API Documentation

### Base URL
```
http://127.0.0.1:8000
```

### Live Deployment
- Backend: `https://stresssync-ai.onrender.com/`
- API docs: `https://stresssync-ai.onrender.com/docs`
- Frontend: `https://stresssyncai.onrender.com/`

### Endpoints

#### 1. User Registration
**POST** `/register`

Create a new user account.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "user_id": 1,
  "full_name": "John Doe"
}
```

**Error Response (400 Bad Request):**
```json
{
  "detail": "Email already registered"
}
```

---

#### 2. User Login
**POST** `/login`

Authenticate a user account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "user_id": 1,
  "full_name": "John Doe"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "detail": "Invalid credentials"
}
```

---

#### 3. Password Recovery
**PUT** `/forgot-password`

Reset a user's password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password updated successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "detail": "Email not found"
}
```

---

#### 4. Stress Level Prediction
**POST** `/predict`

Predict stress level based on health metrics.

**Request Body:**
```json
{
  "user_id": 1,
  "bmi": 24.5,
  "resting_hr_bpm": 72,
  "spo2_avg_pct": 98.5,
  "sleep_duration_hours": 8.0,
  "mood": 4,
  "working_hours": 8.5,
  "screen_time": 5.0
}
```

**Response (200 OK):**
```json
{
  "stress_level": "Low",
  "summary": "Your stress level is low. Maintain your current healthy habits.",
  "factors": ["No major negative indicators detected"],
  "recommendations": ["Maintain your current healthy lifestyle and routine"]
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "detail": "Model prediction failed: [error message]"
}
```

**Input Parameters:**
| Parameter | Type | Range | Description |
|-----------|------|-------|-------------|
| `user_id` | int | - | User ID from registration |
| `bmi` | float | 10-50 | Body Mass Index |
| `resting_hr_bpm` | float | 40-120 | Resting heart rate (beats per minute) |
| `spo2_avg_pct` | float | 85-100 | Blood oxygen saturation percentage |
| `sleep_duration_hours` | float | 3-12 | Average sleep duration per night |
| `mood` | int | 1-5 | Self-reported mood on a 1-5 scale |
| `working_hours` | float | 0-24 | Average working hours per day |
| `screen_time` | float | 0-24 | Daily screen time in hours |

---

#### 5. User Assessment History
**GET** `/history/{user_id}`

Retrieve all past stress assessments for a user.

**URL Parameter:**
- `user_id` (int): The user's ID

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "created_at": "2024-01-15T10:30:00",
    "bmi": 24.5,
    "resting_hr_bpm": 72,
    "spo2_avg_pct": 98.5,
    "sleep_duration_hours": 8.0,
    "mood": 4,
    "working_hours": 8.5,
    "screen_time": 5.0,
    "stress_prediction": "Low"
  },
  {
    "id": 2,
    "user_id": 1,
    "created_at": "2024-01-20T14:45:00",
    "bmi": 25.0,
    "resting_hr_bpm": 85,
    "spo2_avg_pct": 96.5,
    "sleep_duration_hours": 6.5,
    "mood": 2,
    "working_hours": 10.0,
    "screen_time": 7.0,
    "stress_prediction": "High"
  }
]
```

**Empty Response (200 OK):**
```json
[]
```

---

## ML Model Explanation

### Model Overview

| Aspect | Details |
|--------|---------|
| **Model Type** | Classification (Supervised Learning) |
| **Algorithm** | Scikit-learn based (likely ensemble method) |
| **Output Classes** | 3 (Low: 0, Medium: 1, High: 2) |
| **Training Data Technique** | SMOTE (Synthetic Minority Over-sampling) |
| **Model File** | `backend/model/stress_model_with_smote.pkl` |

### Input Features (7 Health Metrics)

1. **BMI (Body Mass Index)**
   - Range: 10-50 kg/m²
   - Impact: Higher BMI can correlate with increased stress and health concerns
   - Calculation: weight_kg / (height_m²)

2. **Resting Heart Rate (BPM)**
   - Range: 40-120 beats per minute
   - Impact: Elevated resting HR (>80 BPM) indicates higher stress and cardiovascular strain
   - Normal range: 60-100 BPM

3. **SpO2 Average (%)**
   - Range: 85-100%
   - Impact: Lower oxygen saturation (<95%) indicates respiratory issues or stress
   - Normal range: 95-100%

4. **Sleep Duration (Hours)**
   - Range: 3-12 hours per night
   - Impact: Insufficient sleep (<7 hours) increases stress levels
   - Recommended: 7-9 hours per night

5. **Mood (1-5 Scale)**
   - Range: 1 (very sad) to 5 (very happy)
   - Impact: Lower mood directly correlates with higher stress
   - Interpretation:
     - 1-2: Low mood → Risk factor
     - 3: Moderate mood → Neutral
     - 4-5: Good mood → Protective factor

6. **Working Hours (per day)**
   - Range: 0-24 hours
   - Impact: Excessive working hours (>9 hours) increase stress
   - Healthy range: 6-8 hours per day

7. **Screen Time (per day)**
   - Range: 0-24 hours
   - Impact: High screen time (>6 hours) correlates with eye strain and stress
   - Healthy range: <4 hours per day

### Model Training Approach

**SMOTE (Synthetic Minority Over-sampling Technique):**
- Addresses class imbalance in stress classification
- Creates synthetic samples of minority classes
- Ensures the model learns patterns from all stress level categories
- Improves balanced accuracy across Low, Medium, and High stress predictions

### Output: Stress Level Classification

The model outputs one of three stress levels:

| Level | Characteristics | Recommendations |
|-------|-----------------|-----------------|
| **Low** | Healthy baseline, good habits | Maintain current routine |
| **Medium** | Manageable stress, minor improvements needed | Lifestyle adjustments (sleep, exercise) |
| **High** | Significant stress indicators present | Immediate interventions (relaxation, professional help) |

### Recommendation Engine

The system generates personalized recommendations based on flagged health metrics:

**Thresholds for Factor Detection:**

```
Heart Rate:
  - > 80 BPM → Flag elevated rate → Recommend breathing exercises

SpO2:
  - < 95% → Flag low oxygen → Recommend health check

Sleep:
  - < 6.5 hours → Flag critical sleep → Recommend 7-8 hours
  - 6.5-7.5 hours → Flag moderate sleep → Recommend consistency

Mood:
  - ≤ 2 → Flag low mood → Recommend social/recreational activities
  - ≤ 3 → Flag moderate mood → Recommend mindfulness

Working Hours:
  - > 9 hours → Flag overwork → Recommend work-life balance

Screen Time:
  - > 6 hours → Flag critical screen use → Recommend digital detox
  - 4-6 hours → Flag high screen use → Recommend 20-20-20 rule
```

### Model Limitations

- Predictions are based on self-reported and wearable health metrics
- Should not replace professional medical or mental health evaluation
- Accuracy depends on accurate data input from users
- Does not account for contextual factors (major life events, medical conditions)
- Model must be retrained periodically with new data for improved accuracy

---

## Technology Stack

### Backend
- **Framework:** FastAPI (Python web framework)
- **Database:** PostgreSQL (relational database)
- **ORM:** SQLAlchemy (database abstraction)
- **ML Library:** scikit-learn (machine learning)
- **Serialization:** Joblib (model persistence)
- **Server:** Uvicorn (ASGI server)
- **Data Processing:** Pandas (data manipulation)

**Version Requirements:**
```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
pandas==2.1.4
scikit-learn==1.6.1
joblib==1.3.2
python-multipart==0.0.6
passlib==1.7.4
python-jose==3.3.0
email-validator==2.1.0
pydantic==2.4.2
```

### Frontend
- **Framework:** React 19.2.4 (UI library)
- **HTTP Client:** Axios (API requests)
- **UI Library:** Bootstrap 5.3.8 (CSS framework)
- **Charting:** Recharts 3.8.1 (data visualization)
- **Build Tool:** Create React App (project scaffolding)
- **Testing:** Jest & React Testing Library

### Infrastructure
- **Database:** PostgreSQL 12+ (local or cloud)
- **Hosting Options:** 
  - Backend: Heroku, AWS EC2, Railway, Render
  - Frontend: Vercel, Netlify, AWS S3 + CloudFront
  - Database: AWS RDS, Heroku Postgres, Railway

---

## Features

### User Management
- ✅ User registration with email validation
- ✅ Secure login functionality
- ✅ Password recovery
- ✅ Session persistence using sessionStorage

### Stress Assessment
- ✅ Comprehensive health metric input form
- ✅ Real-time stress level prediction
- ✅ Historical tracking of all assessments
- ✅ Visual representation of stress trends (charts)

### Personalization
- ✅ AI-generated personalized recommendations
- ✅ Health factor analysis and explanations
- ✅ Customized advice based on detected issues

### Accessibility
- ✅ Voice assistant for hands-free interaction
- ✅ Voice-based stress result reading
- ✅ Recommendation narration
- ✅ Web Speech API integration

### Data Management
- ✅ Persistent user data storage
- ✅ Assessment history with timestamps
- ✅ User-specific data isolation
- ✅ Query and filtering capabilities

---

## Project Structure

```
d:\Jiovio\
├── README.md                          # This file
├── stress_checker.py                  # CLI standalone stress checker
├── stress_form.html                   # HTML form (alternative UI)
│
├── backend/                           # FastAPI backend
│   ├── main.py                        # Main API application
│   ├── database.py                    # Database configuration
│   ├── models.py                      # Database models (User, UserData)
│   ├── schemas.py                     # Pydantic request/response schemas
│   ├── requirements.txt               # Python dependencies
│   └── model/
│       └── stress_model_with_smote.pkl # Trained ML model
│
└── stress-frontend/                   # React frontend
    ├── package.json                   # Node dependencies
    ├── public/
    │   ├── index.html                 # Main HTML file
    │   ├── manifest.json              # PWA manifest
    │   └── robots.txt                 # SEO robots file
    └── src/
        ├── App.js                     # Main App component
        ├── App.css                    # App styles
        ├── index.js                   # React entry point
        ├── components/
        │   ├── Auth.js                # Login/Registration component
        │   ├── StressForm.js          # Health metrics input form
        │   ├── StressChart.js         # Results visualization
        │   ├── StressHistory.js       # Assessment history view
        │   └── VoiceButton.js         # Voice assistant button
        └── hooks/
            └── useVoiceAssistant.js   # Voice interaction hook
```

---

## Troubleshooting

### Backend Issues

| Problem | Solution |
|---------|----------|
| PostgreSQL connection failed | Verify DATABASE_URL credentials and PostgreSQL is running |
| Model file not found | Ensure `stress_model_with_smote.pkl` exists in `backend/model/` |
| CORS errors | Check CORS middleware in `main.py` allows frontend origin |
| Port 8000 in use | Run `uvicorn main:app --reload --port 8001` |

### Frontend Issues

| Problem | Solution |
|---------|----------|
| Cannot connect to backend | Verify FastAPI server is running on port 8000 |
| Voice assistant not working | Check browser supports Web Speech API (Chrome, Edge, Safari) |
| sessionStorage empty after refresh | Browser privacy mode disables sessionStorage |
| npm install fails | Delete `node_modules` and `package-lock.json`, then retry |

### Database Issues

| Problem | Solution |
|---------|----------|
| Tables not created | FastAPI automatically creates on startup; check PostgreSQL connection |
| Data not persisting | Verify database connection and `db.commit()` is called |
| Foreign key errors | Ensure user_id exists before inserting user_data |

---

## Future Enhancements

- 🔐 JWT authentication with token refresh
- 📱 Mobile app (React Native)
- 📊 Advanced analytics and ML model explainability (SHAP/LIME)
- 🔔 Push notifications for high stress alerts
- 🧠 Integration with wearable devices (Fitbit, Apple Watch)
- 🌐 Multi-language support
- 🎯 Personalized intervention programs
- 📈 Comparative stress analysis with anonymized peer data

---

## License

This project is confidential and proprietary. All rights reserved.

---

## Contact & Support

For issues or questions regarding this application, please contact the development team.

**Last Updated:** April 2026
