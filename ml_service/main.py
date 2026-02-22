from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import datetime
import joblib
import os
from typing import List, Optional

app = FastAPI(title="EazyPost ML Scheduling Service")

MODEL_PATH = "model.joblib"

# Load persisted model if available, otherwise start fresh
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
else:
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
    full_week: Optional[bool] = False

def encode_cyclical_time(dt_str=None, hour=None, weekday=None):
    if dt_str:
        dt = datetime.datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
        h, d = dt.hour, dt.weekday()
    else:
        h, d = hour, weekday
        
    hour_sin = np.sin(2 * np.pi * h / 24.0)
    hour_cos = np.cos(2 * np.pi * h / 24.0)
    day_sin = np.sin(2 * np.pi * d / 7.0)
    day_cos = np.cos(2 * np.pi * d / 7.0)
    return [hour_sin, hour_cos, day_sin, day_cos]

@app.post("/predict")
async def predict_best_times(request: SuggestionRequest):
    if not request.historical_data:
        # Default fallback suggestions
        base_suggestions = [
            {"hour": 9, "score": 0.85, "confidence": "high"},
            {"hour": 13, "score": 0.75, "confidence": "medium"},
            {"hour": 19, "score": 0.90, "confidence": "high"}
        ]
        if request.full_week:
            # Generate dummy week heatmap for UI testing
            full_results = []
            for day in range(7):
                for hour in range(24):
                    score = 0.1
                    if hour in [9, 10, 11]: score = 0.6
                    elif hour in [18, 19, 20]: score = 0.9
                    full_results.append({"day": day, "hour": hour, "score": score})
            return {"suggestions": base_suggestions, "heatmap": full_results}
        return {"suggestions": base_suggestions}

    # 1. Feature Engineering
    df = pd.DataFrame([
        {
            "engagement": p.engagement,
            "platform": p.platform,
            **dict(zip(['h_sin', 'h_cos', 'd_sin', 'd_cos'], encode_cyclical_time(dt_str=p.publish_time)))
        } for p in request.historical_data
    ])

    # Simple training
    X = df[['h_sin', 'h_cos', 'd_sin', 'd_cos']]
    y = df['engagement']
    if len(df) > 5:
        model.fit(X, y)
        joblib.dump(model, MODEL_PATH)

    # 2. Generate Candidates
    candidates = []
    if request.full_week:
        for d in range(7):
            for h in range(24):
                candidates.append({"day": d, "hour": h, "features": encode_cyclical_time(hour=h, weekday=d)})
    else:
        now = datetime.datetime.now()
        for h in range(24):
            test_time = now + datetime.timedelta(hours=h)
            candidates.append({"hour": test_time.hour, "day": test_time.weekday(), "features": encode_cyclical_time(dt_str=test_time.isoformat())})

    # 3. Score & Rank
    X_test = pd.DataFrame([c['features'] for c in candidates], columns=['h_sin', 'h_cos', 'd_sin', 'd_cos'])
    
    if hasattr(model, "estimators_"):
        predictions = model.predict(X_test)
    else:
        predictions = []
        for c in candidates:
            score = 0.1
            if c['hour'] in [9, 10, 11]: score = 0.8
            elif c['hour'] in [13, 14]: score = 0.7
            elif c['hour'] in [19, 20, 21]: score = 0.9
            predictions.append(score)

    results = []
    for i, pred in enumerate(predictions):
        item = {"hour": candidates[i]["hour"], "score": float(pred), "confidence": "high" if len(df) > 20 else "medium"}
        if "day" in candidates[i]: item["day"] = candidates[i]["day"]
        results.append(item)

    if request.full_week:
        # Return all for heatmap + top 3 for suggestions
        heatmap = sorted(results, key=lambda x: (x.get('day', 0), x['hour']))
        suggestions = sorted(results, key=lambda x: x['score'], reverse=True)[:3]
        return {"suggestions": suggestions, "heatmap": heatmap}

    # Sort by score descending and return top 3
    results.sort(key=lambda x: x["score"], reverse=True)
    return {"suggestions": results[:3]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
