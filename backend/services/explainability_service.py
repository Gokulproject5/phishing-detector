import shap
import numpy as np
import torch
import asyncio

class ExplainabilityService:
    def __init__(self, model_service):
        self.model_service = model_service
        # SHAP explainer for NLP models
        # Using a partition explainer which is optimized for transformers
        self.explainer = shap.Explainer(
            self.model_service.get_pipeline_callback(),
            self.model_service.tokenizer
        )

    async def get_explanation(self, text: str):
        # Wrap the CPU-intensive SHAP calculation in a thread to keep FastAPI responsive
        loop = asyncio.get_event_loop()
        shap_values = await loop.run_in_executor(None, lambda: self.explainer([text]))
        
        # Format for frontend visualization
        # Getting word importance from the first (and only) prediction
        # Focus on class index 1 (Phishing)
        
        words = shap_values.data[0].tolist()
        importances = shap_values.values[0][:, 1].tolist()
        base_value = float(shap_values.base_values[0][1])

        # Filter and clean up tokens (remove special tokens for cleaner UI)
        features = []
        for word, imp in zip(words, importances):
            clean_word = word.strip()
            if clean_word and clean_word not in ["[CLS]", "[SEP]", "[PAD]", "##"]:
                features.append({"token": clean_word, "score": float(imp)})

        # Sort by absolute impact
        features.sort(key=lambda x: abs(x["score"]), reverse=True)

        return {
            "top_features": features[:12],
            "base_value": base_value,
            "all_tokens": words,
            "all_scores": importances
        }
