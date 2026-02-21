import os
import logging

logger = logging.getLogger(__name__)

class ChatbotService:
    def __init__(self):
        self.model = None
        self._initialized = False

    def _ensure_genai(self):
        if not self._initialized:
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key:
                try:
                    import google.generativeai as genai
                    genai.configure(api_key=api_key)
                    self.model = genai.GenerativeModel('gemini-1.5-flash')
                except Exception as e:
                    logger.error(f"Failed to load Gemini: {e}")
            self._initialized = True

    def get_response(self, message: str, context: str = ""):
        self._ensure_genai()
        if not self.model:
            return "PhishGuard AI is currently in offline mode. To enable full neuro-linguistic analysis, please configure a valid GEMINI_API_KEY in the system settings."

        system_prompt = (
            "You are an expert Cybersecurity Assistant. Your goal is to help users identify phishing "
            "and provide actionable security advice. You are professional, concise, and helpful."
        )
        
        full_prompt = f"{system_prompt}\n\nContext about the current scan: {context}\n\nUser Question: {message}"
        
        try:
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API Error: {str(e)}")
            return "The AI engine is currently experiencing high load. Technical details: The prediction model detected specific linguistic markers common in social engineering. Recommended Action: Exercise caution and verify the sender via a secondary channel."

    def explain_threat(self, prediction: str, top_features: list):
        self._ensure_genai()
        if not self.model:
            return self._get_fallback_explanation(prediction, top_features)

        feature_str = ", ".join([f"'{f['token']}'" for f in top_features if f['score'] > 0])
        
        prompt = (
            f"A machine learning model detected this text as '{prediction}'. "
            f"The suspicious features identified are: {feature_str}. "
            "Please explain in simple terms why these words might indicate a phishing attempt "
            "and give 3 quick safety tips."
        )
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API Error: {str(e)}")
            return self._get_fallback_explanation(prediction, top_features)

    def _get_fallback_explanation(self, prediction: str, top_features: list):
        is_phish = prediction == "Phishing"
        if is_phish:
            return ("The system identified urgency and authority markers typical of phishing. "
                    "The top suspicious patterns found involve requests for immediate action or sensitive information. "
                    "Safety Tips: 1. Do not click links. 2. Verify sender address. 3. Report to IT.")
        else:
            return ("The message content aligns with legitimate communication patterns. "
                    "No significant threat vectors were identified by the Neural Engine. "
                    "Always remain vigilant even with safe ratings.")
