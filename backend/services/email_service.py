from imap_tools import MailBox, AND
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # Default IMAP settings for common providers
        self.providers = {
            "gmail": "imap.gmail.com",
            "outlook": "outlook.office365.com",
            "yahoo": "imap.mail.yahoo.com"
        }

    def fetch_recent_emails(self, email_user, email_password, provider="gmail", limit=10):
        email_user = email_user.strip()
        email_password = email_password.strip()
        imap_server = self.providers.get(provider.lower(), "imap.gmail.com")
        
        try:
            with MailBox(imap_server).login(email_user, email_password, 'INBOX') as mailbox:
                emails = []
                # Fetch recent emails
                for msg in mailbox.fetch(limit=limit, reverse=True):
                    emails.append({
                        "id": msg.uid,
                        "from": msg.from_,
                        "subject": msg.subject,
                        "body": msg.text or msg.html,
                        "preview": (msg.text or msg.html)[:150] + "...",
                        "time": msg.date.strftime("%Y-%m-%d %H:%M:%S"),
                        "status": "unread" if "UNSEEN" in msg.flags else "read"
                    })
                return emails
        except Exception as e:
            logger.error(f"Failed to fetch emails: {str(e)}")
            raise e

    def test_connection(self, email_user, email_password, provider="gmail"):
        email_user = email_user.strip()
        email_password = email_password.strip()
        imap_server = self.providers.get(provider.lower(), "imap.gmail.com")
        try:
            with MailBox(imap_server).login(email_user, email_password, 'INBOX') as mailbox:
                return True
        except Exception as e:
            logger.error(f"Connection test failed: {str(e)}")
            return False
