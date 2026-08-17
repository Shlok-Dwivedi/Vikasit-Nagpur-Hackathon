import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

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

# CORS Middleware allowing Vercel and all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Schemas
class Vendor(BaseModel):
    id: str
    name: str
    stallName: str
    category: str
    location: str
    phone: str
    status: str

class AIRezoneRequest(BaseModel):
    vendor_density: int
    traffic_weight: int
    target_zone: Optional[str] = "Zone B - VNIT Gate"

# In-memory database state
vendors_db = [
    {
        "id": "VV-2024-001",
        "name": "Ramesh Kumar",
        "stallName": "Ramesh Fresh Fruits",
        "category": "Perishable Produce",
        "location": "Zone A - Market Sq",
        "phone": "+91 98234 11290",
        "status": "approved"
    },
    {
        "id": "VV-2024-042",
        "name": "Sunita Sharma",
        "stallName": "Sunita Fast Food & Snacks",
        "category": "Prepared Food",
        "location": "Zone B - VNIT Gate",
        "phone": "+91 97123 88401",
        "status": "approved"
    },
    {
        "id": "VV-2024-089",
        "name": "Anil Patil",
        "stallName": "Nagpur Handloom Corner",
        "category": "Textiles & Goods",
        "location": "Zone C - Metro Corridor",
        "phone": "+91 94210 55920",
        "status": "pending"
    }
]

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

@app.get("/api/vendors")
async def get_vendors():
    return {"status": "success", "count": len(vendors_db), "vendors": vendors_db}

@app.post("/api/vendors")
async def create_vendor(vendor: Vendor):
    vendors_db.insert(0, vendor.dict())
    return {"status": "success", "message": "Vendor registered successfully", "vendor": vendor}

@app.post("/api/ai-optimize")
async def ai_optimize_zone(req: AIRezoneRequest):
    return {
        "status": "optimized",
        "density_applied": req.vendor_density,
        "traffic_sensitivity": req.traffic_weight,
        "recommendation": f"Shifting 15 vendors to {req.target_zone} reduces congestion by {int(req.traffic_weight * 0.42)}%.",
        "projected_income_growth": "+18.4%"
    }
