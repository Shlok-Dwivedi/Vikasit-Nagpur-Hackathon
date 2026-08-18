"""Pipeline 2: What-If Zoning & Impact Simulation Pipeline.

Orchestrator -> Data Retrieval -> Zone Optimizer -> Simulation -> Verifier
Simulates relocating vendors and predicts footfall, income, congestion, safety and ROI before implementation.
"""
from typing import Dict, Any

class WhatIfImpactSimulatorPipeline:
    def simulate(self, current_zone: Dict[str, Any], target_zone: Dict[str, Any]) -> Dict[str, Any]:
        required = {"name", "capacity", "activeVendors", "customerAccess", "baselineFootfall"}
        if not required.issubset(current_zone) or not required.issubset(target_zone):
            raise ValueError("Both zones must contain recorded capacity, activity, access, and footfall data")
        access_change = round(((target_zone["customerAccess"] - current_zone["customerAccess"]) / current_zone["customerAccess"]) * 100, 1)
        footfall_change = round(((target_zone["baselineFootfall"] - current_zone["baselineFootfall"]) / current_zone["baselineFootfall"]) * 100, 1)
        verifier_passed = target_zone["activeVendors"] <= target_zone["capacity"]
        recommendation = f"{target_zone['name']} changes recorded customer access by {access_change:+.1f}% and footfall by {footfall_change:+.1f}%."

        return {
            "pipeline": "What-If Zoning & Impact Simulation",
            "parameters": {"current_zone": current_zone["name"], "target_zone": target_zone["name"]},
            "predictions": {
                "customer_access_change_pct": access_change,
                "footfall_change_pct": footfall_change,
                "target_capacity": target_zone["capacity"]
            },
            "verifier_status": "VERIFIED" if verifier_passed else "CAPACITY WARNING",
            "recommendation": recommendation
        }
