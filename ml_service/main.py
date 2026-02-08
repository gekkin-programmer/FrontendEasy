from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import datetime
from typing import List, Optional

app = FastAPI(title="EasyPost ML Scheduling Service")

# Mock Model - In a real production environment, this would be a pre-trained model loaded via joblib/pickle
model = RandomForestRegressor(n_estimators=100)

class PostData(BaseModel):
    publish_time: str # ISO Format
    platform: str
    engagement: int
    media_type: str

class SuggestionRequest(BaseModel):
    workspace_id: str
    platform: str
    historical_data: List[PostData]

def encode_cyclical_time(dt_str):
    dt = datetime.datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
    # Hour sin/cos
    hour_sin = np.sin(2 * np.pi * dt.hour / 24.0)
    hour_cos = np.cos(2 * np.pi * dt.hour / 24.0)
    # Day of week sin/cos
    day_sin = np.sin(2 * np.pi * dt.weekday() / 7.0)
    day_cos = np.cos(2 * np.pi * dt.weekday() / 7.0)
    return [hour_sin, hour_cos, day_sin, day_cos]

@app.post("/predict")
async def predict_best_times(request: SuggestionRequest):
    if not request.historical_data:
        # Default fallback suggestions if no data exists (e.g. 9 AM, 1 PM, 7 PM)
        return {
            "suggestions": [
                {"hour": 9, "score": 0.85, "confidence": "high"},
                {"hour": 13, "score": 0.75, "confidence": "medium"},
                {"hour": 19, "score": 0.90, "confidence": "high"}
            ]
        }

    # 1. Feature Engineering
    df = pd.DataFrame([
        {
            "engagement": p.engagement,
            "platform": p.platform,
            **dict(zip(['h_sin', 'h_cos', 'd_sin', 'd_cos'], encode_cyclical_time(p.publish_time)))
        } for p in request.historical_data
    ])

    # Simple training on the fly for the prototype (In production, load a saved model)
    X = df[['h_sin', 'h_cos', 'd_sin', 'd_cos']]
    y = df['engagement']
    
    # Train if we have enough samples
    if len(df) > 5:
        model.fit(X, y)

    # 2. Generate 168 Candidates (24h * 7 days)
    # For simplification, we'll check next 24 hours
    candidates = []
    now = datetime.datetime.now()
    for h in range(24):
        test_time = now + datetime.timedelta(hours=h)
        features = encode_cyclical_time(test_time.isoformat())
        candidates.append({
            "hour": test_time.hour,
            "day": test_time.weekday(),
            "features": features
        })

    # 3. Score & Rank
    X_test = pd.DataFrame([c['features'] for c in candidates], columns=['h_sin', 'h_cos', 'd_sin', 'd_cos'])
    predictions = model.predict(X_test) if hasattr(model, "estimators_") else [0.5] * 24

    results = []
    for i, pred in enumerate(predictions):
        results.append({
            "hour": candidates[i]["hour"],
            "score": float(pred),
            "confidence": "high" if len(df) > 20 else "medium"
        })

    # Sort by score descending and return top 3
    results.sort(key=lambda x: x["score"], reverse=True)
    return {"suggestions": results[:3]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
