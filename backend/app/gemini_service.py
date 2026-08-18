"""
Gemini AI Service — Detailed What-If Simulation Analysis
Uses Google Gemini API to generate a comprehensive narrative analysis
of zone relocation impact for street vendors.

Tries multiple models in order until one succeeds.
"""
import json
import urllib.request
import urllib.error
from typing import Dict, Any
from .config import GEMINI_API_KEY

_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

# Models tried in order — first available one wins
_MODEL_FALLBACK_CHAIN = [
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
]

_PROMPT_TEMPLATE = """You are an expert urban planning analyst advising a street vendor in Nagpur, India.

The vendor is currently in {current_name} and is considering moving to {target_name}.
Here is the simulation data from our system:

CURRENT ZONE — {current_name}:
- Customer Access Score: {current_access}/10
- Pedestrian Footfall: {current_footfall} people/hr
- Vendor Capacity: {current_capacity} total slots, {current_active} currently active
- Livelihood Potential: {current_livelihood}/10
- Operating Hours: {current_hours}

TARGET ZONE — {target_name}:
- Customer Access Score: {target_access}/10
- Pedestrian Footfall: {target_footfall} people/hr
- Vendor Capacity: {target_capacity} total slots, {target_active} currently active
- Livelihood Potential: {target_livelihood}/10
- Operating Hours: {target_hours}

COMPUTED IMPACT:
- Customer Access Change: {access_change:+.1f}%
- Footfall Change: {footfall_change:+.1f}%
- Target Zone Capacity Utilisation: {utilisation:.1f}%
- Verifier Status: {verifier}

Write a detailed analysis with these EXACT 5 section headings. Under each heading write 2-4 sentences of real analysis based on the numbers above:

## Livelihood Impact
[Write analysis about how income and trade viability changes based on the footfall and livelihood numbers]

## Zone Suitability
[Write analysis about whether the target zone is operationally better or worse based on the scores]

## Capacity & Congestion Risk
[Write analysis about vendor density risk using the capacity utilisation number]

## Accessibility Score Change
[Explain what the {access_change:+.1f}% access change means for the vendor in practice]

## AI Recommendation
[Give a clear final verdict: MOVE / STAY / CONDITIONAL MOVE with specific reasoning from the numbers]

Important: Write real sentences with actual numbers from the data. Do not write a document header, simulation ID, or applicant name. Start directly with the first section heading.
"""


def _build_prompt(current: Dict, target: Dict, metrics: Dict) -> str:
    return _PROMPT_TEMPLATE.format(
        current_name=current.get("name", "Current Zone"),
        current_capacity=current.get("capacity", "N/A"),
        current_active=current.get("activeVendors", "N/A"),
        current_access=current.get("customerAccess", "N/A"),
        current_footfall=current.get("baselineFootfall", "N/A"),
        current_livelihood=current.get("livelihoodPotential", "N/A"),
        current_hours=current.get("operatingHours", "N/A"),
        target_name=target.get("name", "Target Zone"),
        target_capacity=target.get("capacity", "N/A"),
        target_active=target.get("activeVendors", "N/A"),
        target_access=target.get("customerAccess", "N/A"),
        target_footfall=target.get("baselineFootfall", "N/A"),
        target_livelihood=target.get("livelihoodPotential", "N/A"),
        target_hours=target.get("operatingHours", "N/A"),
        access_change=metrics.get("access_change", 0.0),
        footfall_change=metrics.get("footfall_change", 0.0),
        utilisation=metrics.get("utilisation", 0.0),
        verifier=metrics.get("verifier", "N/A"),
    )


def _call_model(model: str, payload: bytes) -> Dict[str, Any]:
    """Attempt one model. Returns dict with 'ok', 'text', 'error', 'status_code'."""
    url = _BASE_URL.format(model=model) + f"?key={GEMINI_API_KEY}"
    req = urllib.request.Request(
        url, data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read().decode("utf-8"))
        text = (
            body.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
            .strip()
        )
        return {"ok": bool(text), "text": text, "body": body, "error": None, "status_code": 200}
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="ignore")
        return {"ok": False, "text": "", "error": error_body[:400], "status_code": exc.code}
    except Exception as exc:
        return {"ok": False, "text": "", "error": str(exc), "status_code": 0}


def generate_simulation_analysis(
    current_zone: Dict[str, Any],
    target_zone: Dict[str, Any],
    metrics: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Calls Gemini API with automatic model fallback.
    Tries each model in _MODEL_FALLBACK_CHAIN until one succeeds.
    """
    if not GEMINI_API_KEY:
        return {
            "status": "unavailable",
            "message": "Gemini API key not configured.",
            "analysis": None,
        }

    prompt = _build_prompt(current_zone, target_zone, metrics)
    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 2048,
            "topP": 0.95,
        },
    }).encode("utf-8")

    last_error = "No models available."
    for model in _MODEL_FALLBACK_CHAIN:
        result = _call_model(model, payload)

        if result["ok"]:
            return {
                "status": "success",
                "model": model,
                "analysis": result["text"],
                "token_usage": result.get("body", {}).get("usageMetadata", {}),
            }

        # 404 = model not found, 429 = quota exceeded → try next model
        if result["status_code"] in (404, 429):
            last_error = result["error"]
            continue

        # Any other HTTP error — stop and report
        return {
            "status": "api_error",
            "message": f"Gemini API HTTP {result['status_code']}: {result['error']}",
            "analysis": None,
        }

    return {
        "status": "api_error",
        "message": f"All Gemini models exhausted. Last error: {last_error}",
        "analysis": None,
    }
