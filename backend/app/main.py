import os
import sys
import hmac
import json
import secrets
import uuid
from pathlib import Path
from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Ensure the backend root is on the path so 'app.*' imports always resolve
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


from app.config import FOOTFALL_BASELINE, OFFICER_PASSKEY, SUPABASE_URL, SUPABASE_ANON_KEY, get_supabase_client
from app.footfall_fusion import FootfallFusionService
from app.opencv_service import OpenCVImageError, opencv_service
from app.pipelines.registry import PipelineRegistry
from app.pipelines.executor import DynamicPipelineExecutor
from app.pipelines.langgraph_orchestrator import LangGraphAgenticOrchestrator
from app.gemini_service import generate_simulation_analysis



app = FastAPI(
    title="Viksit Vyapari LangGraph Multi-Agent API",
    description="Full-stack AI Engine supporting Dynamic Pipeline Architecture and 5 Core Agentic Pipelines",
    version="3.5.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = get_supabase_client()
fusion_service = FootfallFusionService(dataset_baseline=FOOTFALL_BASELINE)

# Instantiate Dynamic Pipeline Framework Architecture
pipeline_registry = PipelineRegistry()
dynamic_executor = DynamicPipelineExecutor(registry=pipeline_registry, fusion_service=fusion_service)
langgraph_orchestrator = LangGraphAgenticOrchestrator()

# Pydantic Request Schemas
class LangGraphRunRequest(BaseModel):
    location_id: str
    target_vendors: int
    violations_count: int
    cv_count: float
    baseline_income: float
    current_income: float

class OfficerAuthRequest(BaseModel):
    badge_key: str
    officer_id: str

class VendorCreate(BaseModel):
    id: Optional[str] = None
    name: str
    stallName: str
    category: str
    location: str
    phone: str
    lat: Optional[float] = None
    lng: Optional[float] = None

class ZoneOptimizeRequest(BaseModel):
    location_id: str
    target_vendors: int
    cv_count: Optional[float] = None
    cv_confidence: Optional[float] = 0.85

class AIRezoneRequest(BaseModel):
    current_zone_id: str
    target_zone_id: str

class FootfallFusionRequest(BaseModel):
    cv_count: float
    cv_confidence: Optional[float] = 0.85
    frame_quality: Optional[float] = 0.90

class EnforcementHotspotRequest(BaseModel):
    location: str
    violations_count: int
    cv_count: float

class LivelihoodTrackerRequest(BaseModel):
    vendor_id: str
    vendor_name: str
    baseline_income: float
    current_income: float

class IncomeUpdateRequest(BaseModel):
    baseline_income: float
    current_income: float

class ViolationReport(BaseModel):
    vendor_id: str
    violation_type: str
    location: str
    inspector: str

# Replace these in-memory stores with repository/database calls for persistence.
vendors_db = []

alerts_db = []
violations_db = []

with (Path(__file__).parent / "data" / "zones.json").open("r", encoding="utf-8") as zones_file:
    zones_db = json.load(zones_file)["zones"]
officer_tokens: set[str] = set()

# Load vendors from Supabase on startup for persistence across restarts
try:
    _sb = get_supabase_client()
    if _sb:
        _res = _sb.table("vendors").select("*").execute()
        if _res.data:
            vendors_db = list(_res.data)
except Exception as _e:
    pass  # Supabase table may not exist yet; continue with empty in-memory list


def require_officer(authorization: Optional[str] = Header(default=None)) -> str:
    token = authorization.removeprefix("Bearer ").strip() if authorization else ""
    if not token or token not in officer_tokens:
        raise HTTPException(status_code=401, detail="Valid officer clearance is required")
    return token

def get_zone_or_404(zone_id: str):
    for zone in zones_db:
        if zone["id"].upper() == zone_id.upper():
            return zone
    raise HTTPException(status_code=404, detail=f"Zone {zone_id} not found")

def deduplicate_vendors():
    global vendors_db
    unique_dict = {}
    for v in reversed(vendors_db):
        key = v["name"].strip().lower()
        if key not in unique_dict or v.get("status") == "approved":
            unique_dict[key] = v
    vendors_db = list(unique_dict.values())

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Viksit Vyapari Dynamic Agentic Pipeline Architecture Active",
        "pipelines_registered": len(pipeline_registry.list_pipelines()),
        "active_vendors_count": len(vendors_db)
    }

# ========================================================
# DYNAMIC PIPELINE ENDPOINTS (POWERED BY PIPELINE EXECUTOR)
# ========================================================

@app.get("/api/pipelines/summary")
async def get_pipelines_summary():
    return {
        "status": "success",
        "count": len(pipeline_registry.list_pipelines()),
        "pipelines": pipeline_registry.list_pipelines()
    }

@app.post("/api/pipelines/ai-zone-optimization")
async def run_pipeline1_zone_optimizer(req: ZoneOptimizeRequest):
    zone = get_zone_or_404(req.location_id)
    params = req.model_dump() if hasattr(req, "model_dump") else req.dict()
    params.update({"base_capacity": zone["capacity"], "cv_count": req.cv_count or zone["baselineFootfall"]})
    return dynamic_executor.execute_pipeline("ai_vending_zone_optimization", params)

@app.post("/api/pipelines/what-if-simulation")
async def run_pipeline2_impact_simulator(req: AIRezoneRequest):
    current = get_zone_or_404(req.current_zone_id)
    target = get_zone_or_404(req.target_zone_id)
    params = {
        "location_id": current["id"], "target_zone": target["name"],
        "target_vendors": current["activeVendors"], "base_capacity": current["capacity"],
        "cv_count": current["baselineFootfall"], "current_zone": current, "simulated_zone": target,
    }
    return dynamic_executor.execute_pipeline("what_if_zoning_impact_simulation", params)


@app.post("/api/simulation/gemini-analysis")
async def run_gemini_simulation_analysis(req: AIRezoneRequest):
    """Calls Gemini AI to produce a detailed narrative advisory for zone relocation."""
    current = get_zone_or_404(req.current_zone_id)
    target = get_zone_or_404(req.target_zone_id)

    # Compute base metrics
    access_change = round(
        ((target["customerAccess"] - current["customerAccess"]) / max(current["customerAccess"], 0.01)) * 100, 1
    )
    footfall_change = round(
        ((target["baselineFootfall"] - current["baselineFootfall"]) / max(current["baselineFootfall"], 1)) * 100, 1
    )
    utilisation = round((target["activeVendors"] / max(target["capacity"], 1)) * 100, 1)
    verifier = "VERIFIED" if target["activeVendors"] < target["capacity"] else "CAPACITY WARNING"

    metrics = {
        "access_change": access_change,
        "footfall_change": footfall_change,
        "utilisation": utilisation,
        "verifier": verifier,
    }

    result = generate_simulation_analysis(current, target, metrics)
    return {
        "status": result["status"],
        "current_zone": current["name"],
        "target_zone": target["name"],
        "metrics": metrics,
        "gemini_analysis": result.get("analysis"),
        "model": result.get("model", "gemini-2.0-flash"),
        "error": result.get("message") if result["status"] != "success" else None,
    }


@app.post("/api/pipelines/footfall-fusion")
async def run_pipeline3_footfall_fusion(req: FootfallFusionRequest):
    return dynamic_executor.execute_pipeline("footfall_intelligence_fusion", req.model_dump() if hasattr(req, "model_dump") else req.dict())

@app.get("/api/zones/{zone_id}/performance")
async def get_zone_performance(zone_id: str):
    zone = get_zone_or_404(zone_id)
    latest = fusion_service.history[0] if fusion_service.history else None
    footfall = latest["footfall"] if latest and latest.get("live_cv_count") is not None else zone.get("baselineFootfall", 2000)
    occupancy = zone.get("activeVendors", 0) / max(zone.get("capacity", 1), 1)
    balance = round(max(0.0, min(10.0, 10 - abs(0.85 - occupancy) * 8)), 1)
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    base_ff = zone.get("baselineFootfall", 2000)
    base_v = zone.get("activeVendors", 30)
    activity_data = zone.get("activity", [int(base_ff * f) for f in [0.8, 0.85, 0.9, 0.95, 1.0, 1.15, 1.0]])
    vendor_activity_data = zone.get("vendorActivity", [int(base_v * f) for f in [0.85, 0.9, 0.95, 0.95, 1.0, 1.1, 1.0]])
    return {
        "status": "success", "zoneId": zone["id"], "footfall": footfall,
        "activeVendors": zone.get("activeVendors", 0), "capacity": zone.get("capacity", 1),
        "customerAccess": zone.get("customerAccess", 8.0), "zoneBalance": balance,
        "confidence": latest["confidence"] if latest else 0.78,
        "activity": [
            {"day": day, "footfall": value, "vendors": vendor_activity_data[index] if index < len(vendor_activity_data) else base_v}
            for index, (day, value) in enumerate(zip(days, activity_data))
        ],
        "source": "live-opencv-fusion" if latest and latest.get("live_cv_count") is not None else "configured-zone-baseline",
    }

@app.get("/api/cctv-analysis")
async def get_cctv_analysis():
    analysis_path = (
        Path(__file__).parent
        / "data"
        / "cctv_analysis.json"
    )

    if not analysis_path.exists():
        raise HTTPException(
            status_code=404,
            detail="CCTV analysis data not found"
        )

    with analysis_path.open(
        "r",
        encoding="utf-8"
    ) as analysis_file:
        analysis = json.load(analysis_file)

    return {
        "status": "success",
        "source": "cctv-yolo11s",
        "zones": analysis
    }

@app.post("/api/pipelines/enforcement-to-zoning")
async def run_pipeline4_enforcement_zoning(req: EnforcementHotspotRequest, _officer: str = Depends(require_officer)):
    return dynamic_executor.execute_pipeline("enforcement_to_permanent_zoning", req.model_dump() if hasattr(req, "model_dump") else req.dict())

@app.post("/api/pipelines/livelihood-tracking")
async def run_pipeline5_livelihood_tracker(req: LivelihoodTrackerRequest):
    return dynamic_executor.execute_pipeline("vendor_certification_livelihood_tracking", req.model_dump() if hasattr(req, "model_dump") else req.dict())

@app.post("/api/pipelines/langgraph-orchestrate")
async def run_langgraph_orchestration(req: LangGraphRunRequest):
    fused = fusion_service.set_cv(req.cv_count, available=True)
    return langgraph_orchestrator.run_graph(
        req.location_id, req.target_vendors, req.violations_count,
        fused["footfall"], fused["confidence"], req.baseline_income, req.current_income,
    )

# ========================================================
# AUTH & CIVIC REST API ENDPOINTS
# ========================================================

@app.post("/api/auth/officer-clearance")
async def verify_officer_clearance(req: OfficerAuthRequest):
    if not OFFICER_PASSKEY:
        raise HTTPException(status_code=503, detail="Officer authentication is not configured")
    if hmac.compare_digest(req.badge_key.strip(), OFFICER_PASSKEY):
        token = secrets.token_urlsafe(32)
        officer_tokens.add(token)
        return {"status": "success", "authenticated": True, "badge_verified": True, "officer_token": token}
    raise HTTPException(status_code=401, detail="Invalid Security Key")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "opencv": "ready"}

@app.post("/api/opencv/qr/decode")
async def decode_qr_with_opencv(file: UploadFile = File(...)):
    """Decode one or more QR codes from a camera frame or uploaded image."""
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Upload an image file")
    payload = await file.read()
    if len(payload) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be 10 MB or smaller")
    try:
        return {"status": "success", **opencv_service.decode_qr(payload)}
    except OpenCVImageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

@app.post("/api/opencv/footfall/count")
async def count_people_with_opencv(file: UploadFile = File(...)):
    """Count people in a CCTV frame and feed the observation into footfall fusion."""
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Upload an image frame")
    payload = await file.read()
    if len(payload) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be 10 MB or smaller")
    try:
        detection = opencv_service.count_people(payload)
        fused = fusion_service.set_cv(
            detection["people_count"], available=True,
            opencv_confidence=detection["detector_confidence"], frame_quality=1.0,
        )
        return {"status": "success", **detection, "fusion": fused}
    except OpenCVImageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

@app.get("/api/stats")
async def get_dashboard_stats():
    deduplicate_vendors()
    total_count = len(vendors_db)
    approved_vendors = [v for v in vendors_db if v.get("status") == "approved"]
    pending_vendors = [v for v in vendors_db if v.get("status") != "approved"]
    compliance_rate = round((len(approved_vendors) / max(total_count, 1)) * 100, 1) if total_count > 0 else 0.0
    disbursed_values = [v.get("disbursedAmount") for v in vendors_db if isinstance(v.get("disbursedAmount"), (int, float))]
    disbursed = sum(disbursed_values) if disbursed_values else None

    return {
        "total_vendors": total_count,
        "approved_vendors": len(approved_vendors),
        "pending_vendors": len(pending_vendors),
        "active_zones": len(zones_db),
        "compliance_rate": compliance_rate,
        "disbursed_amount": disbursed,
        "live_registered": total_count
    }

@app.get("/api/zones")
async def get_zones():
    return {"status": "success", "zones": zones_db}

@app.get("/api/zones/{zone_id}/full")
async def get_zone_full(zone_id: str):
    """Returns full zone data including boundary, center, rules for vendor display."""
    zone = get_zone_or_404(zone_id)
    return {"status": "success", "zone": zone}


@app.get("/api/alerts")
async def get_alerts():
    return {"status": "success", "alerts": alerts_db}

@app.get("/api/vendors")
async def get_vendors():
    deduplicate_vendors()
    return {"status": "success", "count": len(vendors_db), "vendors": vendors_db}

@app.get("/api/vendors/me")
async def get_my_vendor(email: Optional[str] = None, name: Optional[str] = None):
    """Returns the logged-in vendor's profile by email or name."""
    deduplicate_vendors()
    if email:
        for v in vendors_db:
            if str(v.get("email", "")).strip().lower() == email.strip().lower():
                return {"status": "success", "vendor": v}
    if name:
        for v in vendors_db:
            if str(v.get("name", "")).strip().lower() == name.strip().lower():
                return {"status": "success", "vendor": v}
    return {"status": "not_found", "vendor": None}


@app.post("/api/vendors")
async def create_or_update_vendor(vendor: VendorCreate):
    global vendors_db
    deduplicate_vendors()

    existing = None
    v_name_clean = vendor.name.strip().lower()
    for v in vendors_db:
        if (vendor.id and v.get("id") == vendor.id) or ((v.get("name") or "").strip().lower() == v_name_clean):
            existing = v
            break

    if existing:
        existing["stallName"] = vendor.stallName
        existing["category"] = vendor.category
        existing["location"] = vendor.location
        existing["phone"] = vendor.phone
        return {"status": "success", "message": f"Updated existing vendor ({existing['id']})", "vendor": existing}
    else:
        new_id = vendor.id if vendor.id else f"VV-{datetime.now().year}-{uuid.uuid4().hex[:8].upper()}"
        new_vendor = {
            "id": new_id,
            "name": vendor.name,
            "email": getattr(vendor, 'email', None) or "",
            "stallName": vendor.stallName,
            "category": vendor.category,
            "location": vendor.location,
            "phone": vendor.phone,
            "status": "approved",
            "assignedZone": getattr(vendor, 'assignedZone', None) or "ZONE-B",
            "lat": vendor.lat,
            "lng": vendor.lng,
            "joinedDate": datetime.now().strftime("%d %b %Y"),
            "feePaid": True,
            "svanidhiTier": None  # Assigned after livelihood pipeline assessment
        }
        vendors_db.insert(0, new_vendor)
        # Persist to Supabase
        try:
            _sb = get_supabase_client()
            if _sb:
                _sb.table("vendors").upsert(new_vendor).execute()
        except Exception:
            pass  # Graceful fallback to in-memory only

        return {"status": "success", "message": "New vendor registered & permit granted", "vendor": new_vendor}

@app.put("/api/vendors/{vendor_id}/approve")
async def approve_vendor(vendor_id: str, _officer: str = Depends(require_officer)):
    global vendors_db
    target_clean = vendor_id.strip().upper()
    
    for v in vendors_db:
        if str(v.get("id", "")).strip().upper() == target_clean:
            v["status"] = "approved"
            v["svanidhiTier"] = v.get("svanidhiTier") or "Eligibility not assessed"

            return {"status": "success", "message": f"Vendor {vendor_id} approved", "vendor": v}
    raise HTTPException(status_code=404, detail="Vendor not found")

@app.put("/api/vendors/{vendor_id}/income")
async def update_vendor_income(vendor_id: str, req: IncomeUpdateRequest):
    if req.baseline_income <= 0 or req.current_income < 0:
        raise HTTPException(status_code=422, detail="Income values must be valid non-negative amounts")
    for vendor in vendors_db:
        if str(vendor.get("id", "")).strip().upper() == vendor_id.strip().upper():
            vendor["baselineIncome"] = req.baseline_income
            vendor["currentIncome"] = req.current_income
            result = dynamic_executor.execute_pipeline("vendor_certification_livelihood_tracking", {
                "vendor_id": vendor["id"], "vendor_name": vendor.get("name", ""),
                "baseline_income": req.baseline_income, "current_income": req.current_income,
            })
            if isinstance(result, dict) and result.get("status") == "success" and "data" in result:
                vendor["svanidhiTier"] = result["data"].get("svanidhi_tier", vendor.get("svanidhiTier"))
            return {"status": "success", "vendor": vendor, "pipeline": result}
    raise HTTPException(status_code=404, detail="Vendor not found")

@app.get("/api/impact")
async def get_impact_analytics():
    deduplicate_vendors()
    total = len(vendors_db)
    approved_list = [v for v in vendors_db if v.get("status") == "approved"]
    approved_count = len(approved_list)

    growth_values = []
    for vendor in vendors_db:
        baseline = vendor.get("baselineIncome")
        current = vendor.get("currentIncome")
        if isinstance(baseline, (int, float)) and baseline > 0 and isinstance(current, (int, float)):
            growth_values.append(((current - baseline) / baseline) * 100)
    avg_growth = round(sum(growth_values) / len(growth_values), 1) if growth_values else None
    income_str = f"Calculated from {len(growth_values)} income record(s)" if growth_values else "No income records"

    tier_counts = {"tier1": 0, "tier2": 0, "tier3": 0}
    for vendor in vendors_db:
        tier = str(vendor.get("svanidhiTier", "")).lower().replace(" ", "").replace("-", "")
        for key in tier_counts:
            if key in tier:
                tier_counts[key] += 1

    return {
        "status": "success",
        "avg_vendor_income_growth": avg_growth,
        "income_range": income_str,
        "repayment_rate": None,
        "digital_payment_adoption": f"{approved_count} Approved Vendors",
        "total_active_vendors": total,
        "pm_svanidhi_tiers": {
            key: {"label": key.title(), "count": count, "percentage": round(count / total * 100, 1) if total else 0}
            for key, count in tier_counts.items()
        },
        "dispute_reduction": f"{approved_count} Vending Permits Geotag Verified"
    }
