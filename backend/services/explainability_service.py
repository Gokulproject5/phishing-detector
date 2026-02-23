class ExplainabilityService:
    def __init__(self, model_service):
        self.model_service = model_service
        self.explainer = None

    def _ensure_explainer(self):
        if self.explainer is None:
            import shap
            import logging
            inner_logger = logging.getLogger("shap")
            inner_logger.setLevel(logging.ERROR) # Suppress shap warnings
            
            self.model_service._ensure_loaded()
            print("Initializing Neuro-Diagnostic Engine (SHAP)...")
            try:
                # Use a proper Text masker for BERT models to ensure stable tokenization
                masker = shap.maskers.Text(self.model_service.tokenizer)
                self.explainer = shap.Explainer(
                    self.model_service.get_pipeline_callback(),
                    masker=masker,
                    output_names=["Legitimate", "Phishing"]
                )
                print("Diagnostic Engine ready.")
            except Exception as e:
                print(f"SHAP Initialization failed: {e}")
                # We'll try to re-init on next call if it failed
                self.explainer = None

    async def get_explanation(self, text: str):
        import asyncio
        import numpy as np
        import logging
        
        try:
            self._ensure_explainer()
            if self.explainer is None:
                raise RuntimeError("SHAP explainer not initialized")
                
            # Wrap the CPU-intensive SHAP calculation in a thread
            loop = asyncio.get_event_loop()
            # Increase max_evals for better resolution if needed, but 100 is usually enough for testing
            shap_values = await loop.run_in_executor(None, lambda: self.explainer([text]))
            
            if shap_values is None or len(shap_values.values) == 0:
                raise ValueError("SHAP returned no values")

            # Explanation object indexing: shap_values[batch_idx, token_idx, class_idx]
            # We want the 'Phishing' class (index 1)
            vals = shap_values.values[0]
            base_vals = shap_values.base_values[0]
            data = shap_values.data[0]

            if len(vals.shape) > 1 and vals.shape[-1] > 1:
                importances = vals[:, 1].tolist()
                base_value = float(base_vals[1])
            else:
                importances = vals.flatten().tolist()
                base_value = float(base_vals)

            features = []
            for word, imp in zip(data, importances):
                clean_word = str(word).strip()
                # Skip padding or empty tokens
                if clean_word and clean_word not in ["[PAD]", "[CLS]", "[SEP]"]:
                    features.append({"token": clean_word, "score": float(imp)})

            # Sort by absolute impact
            features.sort(key=lambda x: abs(x["score"]), reverse=True)

            return {
                "top_features": features[:12],
                "base_value": base_value,
                "status": "success"
            }
        except Exception as e:
            import traceback
            print(f"SHAP Error for text '{text[:50]}...':")
            traceback.print_exc()
            return {
                "top_features": [{"token": "Diagnostic Error", "score": 0}],
                "base_value": 0,
                "error": str(e),
                "status": "error"
            }
