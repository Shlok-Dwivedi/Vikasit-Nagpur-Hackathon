"""Pipeline 1: AI Vending Zone Optimization Pipeline.

Orchestrator -> Data Retrieval -> Footfall Fusion -> Zone Optimizer -> Verifier
Finds the best vending locations while balancing vendor livelihood and pedestrian experience.
"""
from typing import Dict, Any, List
import math

class AIVendingZoneOptimizerPipeline:
    def __init__(self, fusion_service=None, zone_capacities=None):
        self.fusion_service = fusion_service
        self.zone_capacities = zone_capacities or {}

    def execute(self, location_id: str, target_vendors: int) -> Dict[str, Any]:
        # Step 1: Data Retrieval
        base_capacity = self.zone_capacities.get(location_id)
        if not base_capacity:
            raise ValueError(f"No capacity configured for zone {location_id}")
        
        # Step 2: Footfall Fusion
        if not self.fusion_service:
            raise ValueError("A footfall fusion service is required")
        fused_data = self.fusion_service.latest()
        if not fused_data.get("sources_used"):
            raise ValueError("No footfall source is available")
        footfall = fused_data["footfall"]

        # Step 3: Zone Optimizer Calculation
        pedestrian_capacity = max(100, footfall * 1.5)
        optimal_vendor_slots = min(base_capacity, int(pedestrian_capacity * 0.12))
        occupancy_rate = round((target_vendors / base_capacity) * 100, 1)

        # Safety & Livelihood Balance Calculation
        livelihood_score = round(min(100.0, (target_vendors / optimal_vendor_slots) * 85.0), 1) if optimal_vendor_slots > 0 else 50.0
        pedestrian_comfort_score = round(max(10.0, 100.0 - (occupancy_rate * 0.7)), 1)
        balance_index = round((livelihood_score * 0.5) + (pedestrian_comfort_score * 0.5), 1)

        # Step 4: Verification Guard
        verified = balance_index >= 45.0
        recommendation = (
            f"Zone {location_id} optimized: Allocated {optimal_vendor_slots} slots for {target_vendors} vendors. "
            f"Balance Index: {balance_index}/100. Pedestrian comfort maintained."
        ) if verified else (
            f"High congestion alert for {location_id}! Recommended re-routing {max(1, target_vendors - optimal_vendor_slots)} vendors to adjacent Zone B."
        )

        return {
            "pipeline": "AI Vending Zone Optimization",
            "location_id": location_id,
            "fused_footfall": footfall,
            "optimal_vendor_slots": optimal_vendor_slots,
            "target_vendors": target_vendors,
            "occupancy_rate": f"{occupancy_rate}%",
            "livelihood_score": f"{livelihood_score}/100",
            "pedestrian_comfort_score": f"{pedestrian_comfort_score}/100",
            "balance_index": balance_index,
            "verified": verified,
            "recommendation": recommendation
        }
