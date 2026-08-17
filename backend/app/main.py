import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure package imports resolve properly on deployment servers
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.config import SUPABASE_URL, SARVAM_API_KEY
except ImportError:
    from config import SUPABASE_URL, SARVAM_API_KEY

app = FastAPI(
    title="VNIT Hackathon Backend API",
    description="FastAPI REST API serving React UI and integrating Supabase & Sarvam AI",
    version="1.0.0"
)

# CORS Middleware allowing all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "VNIT Hackathon FastAPI backend is operational.",
        "services": {
            "supabase_configured": bool(SUPABASE_URL and "your-supabase" not in SUPABASE_URL),
            "sarvam_configured": bool(SARVAM_API_KEY)
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
