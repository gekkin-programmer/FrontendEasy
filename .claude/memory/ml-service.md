# ML Service Deep Dive — FastAPI (Smart Scheduling)

## 1. Overview
A Python-based microservice that predicts the best times to post on social media based on historical engagement data.

## 2. Tech Stack
- **Language:** Python 3.13.3
- **Framework:** FastAPI + Uvicorn (Port 8000)
- **Libraries:** `scikit-learn` (RandomForestRegressor), `pandas`, `numpy`, `xgboost`.

## 3. Core Logic: Engagement Prediction
- **Algorithm:** RandomForestRegressor (100 estimators).
- **Feature Engineering:** - Timestamps are converted to cyclical features using sine/cos transformations for both **Hour of Day** and **Day of Week**.
- **Cold Start Strategy:** - If < 6 data samples exist, the model falls back to hardcoded peak hours: **9 AM, 1 PM, 7 PM**.
- **Confidence Scoring:**
  - **High:** > 20 historical samples.
  - **Medium:** 6–20 historical samples.

## 4. API Specification
### `POST /predict`
**Input:**
```json
{
  "workspace_id": "string",
  "platform": "instagram",
  "historical_data": [
    { "publish_time": "ISO8601", "engagement": 100, "media_type": "image" }
  ]
}

Known Limitations & Prototype Status
No Persistence: Models are trained on-the-fly per request; no .pkl or .joblib files are saved.

No Auth: The service is internal-only and relies on the Backend (NestJS) for security.

Deployment: Deployed via the BackendEasy repository using the shared docker-compose.yml.

Requirements: requirements.txt must be UTF-8 encoded (fix applied for deployment).