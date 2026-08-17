from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import SUPABASE_URL, SARVAM_API_KEY

app = FastAPI(
    title="VNIT Hackathon Backend API",
    description="FastAPI REST API serving React UI and integrating Supabase & Sarvam AI",
    version="1.0.0"
)

# CORS Middleware allowing frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
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
