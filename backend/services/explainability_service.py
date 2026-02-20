import numpy as np
import torch
import asyncio

class ExplainabilityService:
    def __init__(self, model_service):
        self.model_service = model_service
        self.explainer = None

    def _ensure_explainer(self):
        if self.explainer is None:
            import shap
            print("Initializing Neuro-Diagnostic Engine (SHAP)...")
            self.explainer = shap.Explainer(
                self.model_service.get_pipeline_callback(),
                self.model_service.tokenizer # This will be loaded by callback if not yet
            )
            print("Diagnostic Engine ready.")

    async def get_explanation(self, text: str):
        self._ensure_explainer()
        try:
            # Wrap the CPU-intensive SHAP calculation in a thread to keep FastAPI responsive
            loop = asyncio.get_event_loop()
            shap_values = await loop.run_in_executor(None, lambda: self.explainer([text]))
            
            # Use safety checks for indexing
            if not shap_values or len(shap_values.data) == 0:
                raise ValueError("SHAP explainer returned empty values")

            words = shap_values.data[0].tolist()
            # Ensure we have at least 2 classes for indexing [:, 1]
            # If binary classification returns only 1 output, handle accordingly
            if shap_values.values[0].shape[-1] > 1:
                importances = shap_values.values[0][:, 1].tolist()
                base_value = float(shap_values.base_values[0][1])
            else:
                importances = shap_values.values[0].flatten().tolist()
                base_value = float(shap_values.base_values[0])

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
        except Exception as e:
            # Fallback for when SHAP fails but we want the app to stay alive
            return {
                "top_features": [{"token": "Diagnostic Error", "score": 0}],
                "base_value": 0,
                "error": str(e)
            }
