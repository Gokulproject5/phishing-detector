class ModelService:
    def __init__(self, model_name="ElSlay/BERT-Phishing-Email-Model"):
        self.model_name = model_name
        self.tokenizer = None
        self.model = None
        self._cache = {} # Inference Cache
        self.device = "cuda" if import_torch_and_check_gpu() else "cpu"

    def _ensure_loaded(self):
        if self.model is None:
            from transformers import AutoTokenizer, AutoModelForSequenceClassification
            import torch
            print(f"Loading Neural Engine models: {self.model_name} on {self.device}...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name).to(self.device)
            self.model.eval()
            print("Neural Engine ready.")

    def predict(self, text: str):
        if not text.strip():
            return self._empty_result()
            
        # 0. Optimization: Cache Check
        cache_key = hash(text)
        if cache_key in self._cache:
            return self._cache[cache_key]

        self._ensure_loaded()
        import torch
        import torch.nn.functional as F
        import re
        
        # 1. BERT Neural Prediction
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512).to(self.device)
        with torch.no_grad():
            outputs = self.model(**inputs)
            probabilities = F.softmax(outputs.logits, dim=1)
            prediction_idx = torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0][prediction_idx].item()

        # 2. Advanced Heuristic Verification
        heuristics = []
        heuristic_score = 0
        
        # Enhanced URL/Domain detection (Catches http:// AND naked domains like youtube.com)
        url_pattern = r'(?:http[s]?://)?(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        potential_urls = re.findall(url_pattern, text)
        
        trusted_domains = [
            "google.com", "microsoft.com", "apple.com", "amazon.com", "github.com", 
            "linkedin.com", "netflix.com", "youtube.com", "facebook.com", "twitter.com",
            "instagram.com", "paypal.com", "chase.com", "bankofamerica.com", "wellsfargo.com",
            "gmail.com", "outlook.com", "yahoo.com"
        ]
        
        is_trusted_site = False
        critical_flags = 0
        malicious_tlds = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".pw", ".bid", ".club"]

        for item in potential_urls:
            # Clean domain extraction
            domain = item.lower().split('/')[0]
            if "://" in domain:
                domain = domain.split("://")[1]
            
            # Trust Check
            if any(domain == td or domain.endswith("." + td) for td in trusted_domains):
                is_trusted_site = True
            
            # Threat Analysis
            if not is_trusted_site:
                if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', domain): 
                    heuristics.append("Critical: IP-based destination detected.")
                    heuristic_score += 0.4
                    critical_flags += 1
                if any(tld in domain for tld in malicious_tlds):
                    heuristics.append(f"Suspicious: High-risk TLD detected ({domain}).")
                    heuristic_score += 0.2
        
        # 3. Decision Logic Optimization
        phishing_prob = probabilities[0][1].item()
        
        # Whitelist Force-Correction
        if is_trusted_site and critical_flags == 0:
            phishing_prob = min(phishing_prob, 0.01) # Reduce to <1%
            heuristic_score = -0.6
        
        # Final probability clamping
        if heuristic_score != 0:
            phishing_prob = max(0.001, min(0.999, phishing_prob + heuristic_score))
        
        final_prediction = "Phishing" if phishing_prob > 0.5 else "Legitimate"
        
        result = {
            "prediction": final_prediction,
            "probability": phishing_prob if final_prediction == "Phishing" else (1 - phishing_prob),
            "all_probabilities": {
                "legitimate": 1 - phishing_prob,
                "phishing": phishing_prob
            },
            "heuristics": heuristics,
            "threat_markers": len(heuristics),
            "processing_engine": "BERT-Hybrid (Optimized)"
        }
        
        # Save to cache
        self._cache[cache_key] = result
        return result

    def _empty_result(self):
        return {
            "prediction": "Legitimate",
            "probability": 1.0,
            "all_probabilities": {"legitimate": 1.0, "phishing": 0.0},
            "heuristics": [],
            "threat_markers": 0
        }

def import_torch_and_check_gpu():
    try:
        import torch
        return torch.cuda.is_available()
    except:
        return False

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
