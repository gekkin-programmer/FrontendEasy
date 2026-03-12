Add a new FastAPI endpoint to the EasyPostV2 ML service.

Endpoint name / purpose: $ARGUMENTS

All ML service code lives in a single file: `ml_service/main.py`. Read it first to understand the existing patterns, then add the new endpoint following the same conventions.

---

## Pattern to follow

### 1. Pydantic request model
```python
class <EndpointName>Request(BaseModel):
    workspace_id: str
    platform: str
    # Add relevant fields with type hints
    historical_data: List[<DataModel>]

class <DataModel>(BaseModel):
    # Define data fields
    field_name: str
    metric: int
```

### 2. Pydantic response model
```python
class <EndpointName>Response(BaseModel):
    results: List[<ResultItem>]

class <ResultItem>(BaseModel):
    # Define result fields
    value: float
    confidence: str  # "high" or "medium"
```

### 3. Feature engineering function
```python
def encode_features(data_point) -> dict:
    """Convert raw data into ML features."""
    # Use cyclical encoding for time-based features (like existing encode_cyclical_time)
    # Return dict of feature values
```

### 4. Endpoint handler
```python
@app.post("/<endpoint-path>", response_model=<EndpointName>Response)
def <endpoint_name>(request: <EndpointName>Request):
    # 1. Validate input — return fallback if insufficient data
    if not request.historical_data or len(request.historical_data) < 6:
        return <EndpointName>Response(results=<hardcoded_fallback>)

    # 2. Build feature matrix with pandas
    df = pd.DataFrame([...])
    X = df[['feature1', 'feature2', ...]].values
    y = df['target'].values

    # 3. Train model (or load pre-trained)
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    # 4. Generate predictions
    # ...

    # 5. Determine confidence
    confidence = "high" if len(request.historical_data) > 20 else "medium"

    # 6. Return top results
    return <EndpointName>Response(results=results[:3])
```

---

## Conventions
- Use Pydantic v2 models with type hints
- Always include a fallback for insufficient data (< 6 samples)
- Confidence: `"high"` if > 20 samples, `"medium"` otherwise
- Log important steps with `print()` (no logging framework yet)
- Keep the endpoint stateless — no file I/O or database connections
- Use `RandomForestRegressor` from scikit-learn as the default model (xgboost is available if better suited)
- Feature engineering: prefer cyclical encoding for time features (see existing `encode_cyclical_time`)

---

## After adding the endpoint

Show the complete curl command to test it:
```bash
curl -X POST http://localhost:8000/<endpoint-path> \
  -H "Content-Type: application/json" \
  -d '{"workspace_id": "test", "platform": "instagram", "historical_data": [...]}'
```

Also note what change (if any) is needed in `Nestjs_Backend/src/modules/ai/` or `smart-scheduling/` to call this new endpoint.
