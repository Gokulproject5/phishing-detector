import os
import google.generativeai as genai

class ChatbotService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    def get_response(self, message: str, context: str = ""):
        if not self.model:
            return "Gemini API key is not configured. Please set GEMINI_API_KEY in your environment."

        system_prompt = (
            "You are an expert Cybersecurity Assistant. Your goal is to help users identify phishing "
            "and provide actionable security advice. Be professional, concise, and helpful."
        )
        
        full_prompt = f"{system_prompt}\n\nContext about the current scan: {context}\n\nUser Question: {message}"
        
        try:
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            return f"Error generating response: {str(e)}"

    def explain_threat(self, prediction: str, top_features: list):
        if not self.model:
            return "AI explanation unavailable (API key missing)."

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
            return f"Error: {str(e)}"
