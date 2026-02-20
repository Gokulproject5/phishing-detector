import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from services.model_service import ModelService
from services.explainability_service import ExplainabilityService
from services.chatbot_service import ChatbotService

from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="Explainable Phishing Detection API")

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_exceptions(request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logger.exception("Unhandle exception occurred")
        raise e

# Initialize services
model_service = ModelService()
explainer_service = ExplainabilityService(model_service)
chatbot_service = ChatbotService()

class PredictRequest(BaseModel):
    text: str

class ExplainRequest(BaseModel):
    text: str

class ChatRequest(BaseModel):
    message: str
    context: str = ""

@app.get("/")
async def root():
    return {"message": "Phishing Detection API is running"}

@app.post("/predict")
async def predict(request: PredictRequest):
    try:
        result = model_service.predict(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/explain")
async def explain(request: ExplainRequest):
    try:
        # Get model prediction first for context
        prediction_result = model_service.predict(request.text)

        # Get raw SHAP explanation (optimized async)
        explanation = await explainer_service.get_explanation(request.text)
        
        # Generate natural language explanation using Gemini
        ai_explanation = chatbot_service.explain_threat(
            prediction_result["prediction"], 
            explanation["top_features"]
        )
        
        return {
            "prediction": prediction_result,
            "shap_explanation": explanation,
            "ai_explanation": ai_explanation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        response = chatbot_service.get_response(request.message, request.context)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
