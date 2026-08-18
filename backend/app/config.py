import os
from dotenv import load_dotenv

# Load environment variables from .env file if available
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "").strip()
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SARVAM_API_KEY = ""  # Removed - Sarvam AI not used

OFFICER_PASSKEY = os.getenv("OFFICER_PASSKEY", "")
FOOTFALL_BASELINE = float(os.environ["FOOTFALL_BASELINE"]) if os.getenv("FOOTFALL_BASELINE") else None
NOTIFICATION_WEBHOOK_URL = os.getenv("NOTIFICATION_WEBHOOK_URL", "").strip()

PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")

def get_supabase_client():
    if SUPABASE_URL and SUPABASE_ANON_KEY and "your-supabase" not in SUPABASE_URL:
        try:
            from supabase import create_client
            return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        except Exception as e:
            print("Supabase client init note:", e)
    return None
