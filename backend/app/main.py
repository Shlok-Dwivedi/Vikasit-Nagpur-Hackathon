import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Ensure package imports resolve properly on deployment servers
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.config import SUPABASE_URL, SARVAM_API_KEY
except ImportError:
    from config import SUPABASE_URL, SARVAM_API_KEY

app = FastAPI(
    title="Viksit Vyapari Live REST API",
    description="Dynamic Backend API for Civic Vendor Management & AI Zoning",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class VendorCreate(BaseModel):
    name: str
    stallName: str
    category: str
    location: str
    phone: str

class AIRezoneRequest(BaseModel):
    vendor_density: int
    traffic_weight: int
    target_zone: Optional[str] = "Zone B - VNIT Gate"

# Dynamic In-Memory Store
vendors_db = [
    {
        "id": "VV-2024-001",
        "name": "Ramesh Kumar",
        "stallName": "Ramesh Fresh Fruits",
        "category": "Perishable Produce",
        "location": "Zone A - Market Sq",
        "phone": "+91 98234 11290",
        "status": "approved",
        "joinedDate": "12 Jan 2024"
    },
    {
        "id": "VV-2024-042",
        "name": "Sunita Sharma",
        "stallName": "Sunita Fast Food & Snacks",
        "category": "Prepared Food",
        "location": "Zone B - VNIT Gate",
        "phone": "+91 97123 88401",
        "status": "approved",
        "joinedDate": "18 Feb 2024"
    },
    {
        "id": "VV-2024-089",
        "name": "Anil Patil",
        "stallName": "Nagpur Handloom Corner",
        "category": "Textiles & Goods",
        "location": "Zone C - Metro Corridor",
        "phone": "+91 94210 55920",
        "status": "pending",
        "joinedDate": "02 Aug 2024"
    },
    {
        "id": "VV-2024-115",
        "name": "Mohd Imran",
        "stallName": "Imran Tea & Refreshments",
        "category": "Beverages",
        "location": "Zone A - Station Rd",
        "phone": "+91 99812 33491",
        "status": "pending",
        "joinedDate": "10 Aug 2024"
    }
]

alerts_db = [
    {
        "id": 1,
        "type": "warning",
        "title": "High Pedestrian Density Warning",
        "message": "Zone C (Metro Corridor) reached 88% capacity. AI zone optimization recommended.",
        "time": "10 mins ago"
    },
    {
        "id": 2,
        "type": "success",
        "title": "Certificate Renewal Approved",
        "message": "Vendor V-1029 (Ramesh Fruit Stall) renewed 1-year vending permit.",
        "time": "25 mins ago"
    },
    {
        "id": 3,
        "type": "danger",
        "title": "Unauthorized Vending Logged",
        "message": "Inspector-04 logged 2 non-permitted stalls at Railway Gate #2.",
        "time": "1 hour ago"
    }
]

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Viksit Vyapari FastAPI dynamic backend operational.",
        "active_vendors": len(vendors_db),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/stats")
async def get_dashboard_stats():
    approved_count = len([v for v in vendors_db if v["status"] == "approved"])
    compliance = round((approved_count / len(vendors_db)) * 100, 1) if vendors_db else 0
    return {
        "total_vendors": 14290 + len(vendors_db) - 4,
        "active_zones": 42,
        "compliance_rate": compliance,
        "disbursed_amount": "₹1.28 Cr",
        "live_registered": len(vendors_db)
    }

@app.get("/api/alerts")
async def get_alerts():
    return {"alerts": alerts_db}

@app.get("/api/vendors")
async def get_vendors():
    return {"status": "success", "count": len(vendors_db), "vendors": vendors_db}

@app.post("/api/vendors")
async def create_vendor(vendor: VendorCreate):
    new_id = f"VV-2024-{len(vendors_db) + 140:03d}"
    new_vendor = {
        "id": new_id,
        "name": vendor.name,
        "stallName": vendor.stallName,
        "category": vendor.category,
        "location": vendor.location,
        "phone": vendor.phone,
        "status": "pending",
        "joinedDate": datetime.now().strftime("%d %b %Y")
    }
    vendors_db.insert(0, new_vendor)
    alerts_db.insert(0, {
        "id": len(alerts_db) + 1,
        "type": "info",
        "title": "New Vendor Application Submitted",
        "message": f"Application submitted by {vendor.name} ({new_id}) for {vendor.location}.",
        "time": "Just now"
    })
    return {"status": "success", "message": "Vendor registered in backend database", "vendor": new_vendor}

@app.put("/api/vendors/{vendor_id}/approve")
async def approve_vendor(vendor_id: str):
    for v in vendors_db:
        if v["id"] == vendor_id:
            v["status"] = "approved"
            alerts_db.insert(0, {
                "id": len(alerts_db) + 1,
                "type": "success",
                "title": "Permit Approved",
                "message": f"Vendor {v['name']} ({vendor_id}) permit approved by Municipal Officer.",
                "time": "Just now"
            })
            return {"status": "success", "message": f"Vendor {vendor_id} approved", "vendor": v}
    raise HTTPException(status_code=404, detail="Vendor not found")

@app.post("/api/ai-optimize")
async def ai_optimize_zone(req: AIRezoneRequest):
    congestion_reduction = int(req.traffic_weight * 0.42)
    income_increase = round(req.vendor_density * 0.28, 1)
    shifted_count = int(req.vendor_density * 0.2)
    return {
        "status": "success",
        "density_applied": req.vendor_density,
        "traffic_sensitivity": req.traffic_weight,
        "shifted_vendors": shifted_count,
        "congestion_reduction": f"↓ {congestion_reduction}%",
        "projected_income_growth": f"↑ {income_increase}%",
        "recommendation": f"AI Algorithm calculated: Relocating {shifted_count} stalls from Metro Corridor to {req.target_zone} reduces bottleneck congestion by {congestion_reduction}%."
    }
