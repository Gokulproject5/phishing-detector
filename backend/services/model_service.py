class ModelService:
    def __init__(self, model_name="ElSlay/BERT-Phishing-Email-Model"):
        self.model_name = model_name
        self.tokenizer = None
        self.model = None

    def _ensure_loaded(self):
        if self.model is None:
            from transformers import AutoTokenizer, AutoModelForSequenceClassification
            print(f"Loading Neural Engine models: {self.model_name}...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
            self.model.eval()
            print("Neural Engine ready.")

    def predict(self, text: str):
        self._ensure_loaded()
        import torch
        import torch.nn.functional as F
        
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            outputs = self.model(**inputs)
            probabilities = F.softmax(outputs.logits, dim=1)
            prediction = torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0][prediction].item()

        # Assuming index 1 is phishing and 0 is legitimate based on common dataset patterns
        # Adjusting labels for clarity
        label_mapping = {0: "Legitimate", 1: "Phishing"}
        
        return {
            "prediction": label_mapping.get(prediction, "Unknown"),
            "probability": confidence,
            "all_probabilities": {
                "legitimate": probabilities[0][0].item(),
                "phishing": probabilities[0][1].item()
            }
        }

    def get_pipeline_callback(self):
        # Helper for SHAP to handle tokenization and model call
        def pipeline_callback(texts):
            self._ensure_loaded()
            import torch
            import torch.nn.functional as F
            inputs = self.tokenizer(texts, return_tensors="pt", truncation=True, max_length=512, padding=True)
            with torch.no_grad():
                outputs = self.model(**inputs)
                return F.softmax(outputs.logits, dim=1).numpy()
        return pipeline_callback
