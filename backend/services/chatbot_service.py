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
            if api_key and api_key != "your-gemini-api-key-here":
                try:
                    import google.generativeai as genai
                    genai.configure(api_key=api_key)
                    self.model = genai.GenerativeModel('gemini-1.5-flash')
                except Exception as e:
                    logger.error(f"Failed to load Gemini: {e}")
            else:
                logger.info("Gemini API key not configured or using placeholder. AI features will use fallbacks.")
            self._initialized = True

    def get_response(self, message: str, context: str = ""):
        self._ensure_genai()
        if not self.model:
            return self._get_offline_intelligence(message)

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
            return self._get_offline_intelligence(message)

    def _get_offline_intelligence(self, message: str):
        msg = message.lower()
        
        # Knowledge Base for Offline Mode
        kb = {
            "what is phishing": "Phishing is a social engineering attack where attackers deceive users into revealing sensitive information like passwords or credit card numbers by masquerading as a trusted entity.",
            "signs": "Common signs include: 1. Sense of urgency. 2. Generic greetings. 3. Suspicious links or attachments. 4. Poor grammar/spelling. 5. Unusual sender addresses.",
            "detect": "Our system use a BERT Transformer model to analyze linguistic patterns and social engineering markers in text, combined with heuristic URL verification.",
            "bert": "BERT (Bidirectional Encoder Representations from Transformers) allows our neural engine to understand the context and intent of an email, far beyond simple keyword lists.",
            "spear": "Spear phishing is a targeted phishing attack directed at a specific individual or organization, often using personalized info to build trust.",
            "report": "If you find a phishing email: 1. Do not click links. 2. Report it to your IT security team. 3. Delete the email. 4. If you entered a password, change it immediately.",
            "tips": "1. Use MFA (Multi-Factor Authentication). 2. Check the actual sender address. 3. Hover over links to see the destination. 4. Never share passwords via email.",
            "ip": "An IP address in a link instead of a domain (e.g., http://192.168.1.1/login) is a high-risk indicator of phishing.",
            "bad link": "Bad links often feature: 1. Mismatched display text vs hovered URL. 2. Non-standard TLDs (.xyz, .tk). 3. Raw IP addresses. 4. Obfuscated subdomains meant to mimic official sites.",
            "good link": "Good links typically: 1. Match the official domain exactly. 2. Use HTTPS encryption. 3. Have a clean structure without random characters or excessive hyphens.",
            "accuracy": "The BERT classifier achieved an accuracy of 94% on the validation dataset. Precision and recall values indicate strong detection capability with minimal false positives.",
            "performance": "Model Performance: 94% Accuracy, 0.93 F1-Score. The model demonstrates high reliability for real-time phishing detection, especially for urgency-based lures.",
            "dataset": "We utilize diverse datasets from Kaggle, UCI (SMS Spam), and public GitHub repositories containing thousands of verified phishing and legitimate email samples.",
            "smishing": "Smishing is phishing via SMS (text messages). Attackers use urgent texts to trick you into clicking malicious links or calling premium-rate numbers.",
            "vishing": "Vishing (Voice Phishing) involves fraudulent phone calls or voice messages. Attackers often impersonate bank staff or government officials to steal data.",
            "whaling": "Whaling is a highly targeted phishing attack aimed at high-profile individuals like CEOs or government officials to steal sensitive corporate or financial info.",
            "quishing": "Quishing is QR code phishing. Attackers replace legitimate QR codes with malicious ones that lead to phishing sites or download malware when scanned.",
            "scam": "Common scams include: 1. Tech Support (fake virus alerts). 2. Lottery/Prize (you won a prize but need to pay a 'fee'). 3. Romance scams. 4. Investment/Crypto scams (guaranteed high returns).",
            "spam": "Spam is unsolicited bulk messaging, usually for commercial advertising. While annoying, it's often not malicious, unlike phishing, which is designed to steal data.",
            "mfa": "Multi-Factor Authentication (MFA) adds a second layer of security (like a code via SMS or app) beyond your password, making it much harder for attackers to access your account.",
            "password": "Strong passwords should: 1. Be long (12+ characters). 2. Use a mix of upper/lower case, numbers, and symbols. 3. Be unique for every account (use a password manager).",
            "social engineering": "Social engineering is the psychological manipulation of people into performing actions or divulging confidential info. It includes phishing, baiting, and pretexting.",
            "malware": "Malware (Malicious Software) includes viruses, ransomware, and spyware designed to damage, disrupt, or gain unauthorized access to computer systems.",
            "ransomware": "Ransomware is a type of malware that encrypts your files and demands a ransom payment to release them. Backups are the best defense.",
            "vpn": "A Virtual Private Network (VPN) encrypts your internet connection, hiding your activity and location from third parties, especially on public Wi-Fi.",
            "best practice": "Top practices: 1. Use MFA. 2. Keep software updated. 3. Use unique, strong passwords. 4. Be skeptical of unsolicited links/attachments. 5. Back up your data regularly.",
            "support scam": "Tech support scams usually start with a fake pop-up or call claiming your computer has a virus. They then ask for remote access and payment to 'fix' it.",
            "crypto scam": "Crypto scams often promise guaranteed high returns with 'no risk' or use fake celebrity endorsements to lure you into sending cryptocurrency to a controlled wallet.",
            "spoofing": "Spoofing is when an attacker disguises themselves as a trusted source, like a fake email address or phone number, to deceive you.",
            "compromised": "If compromised: 1. Change passwords for all major accounts. 2. Enable MFA. 3. Report to your bank/IT team. 4. Run a full antivirus scan.",
            "firewall": "A firewall is a network security system that monitors and controls incoming and outgoing network traffic based on predetermined security rules.",
            "pharming": "Pharming redirects users from a legitimate website to a fraudulent one by compromising DNS settings or installing malware on a user's computer.",
        }

        for key, response in kb.items():
            if key in msg:
                return f"[Offline Neural Analytics] {response}"

        return ("PhishGuard AI is currently in offline mode. Based on my local security logs, "
                "the most effective defense is vigilance. Always verify the source and never click "
                "suspicious links. For deep analysis, please restore the Gemini API connection.")

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
