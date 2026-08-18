"""PyTest Suite for Viksit Vyapari Dynamic Agentic Pipeline Architecture."""

import pytest
import json
import os
import sys

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.pipelines.registry import PipelineRegistry, PipelineDefinition
from app.pipelines.executor import DynamicPipelineExecutor
from app.pipelines.stages.base import PipelineContext, BaseStage
from app.footfall_fusion import FootfallFusionService

@pytest.fixture
def registry():
    return PipelineRegistry()

@pytest.fixture
def executor(registry):
    return DynamicPipelineExecutor(registry=registry, fusion_service=FootfallFusionService())

@pytest.fixture
def zones():
    path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "data", "zones.json")
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)["zones"]

def test_registry_loading(registry):
    """Verify registry loads all 5 pipelines from JSON schema configuration."""
    pipelines = registry.list_pipelines()
    assert len(pipelines) == 5
    
    pipeline_ids = [p["id"] for p in pipelines]
    assert "ai_vending_zone_optimization" in pipeline_ids
    assert "what_if_zoning_impact_simulation" in pipeline_ids
    assert "footfall_intelligence_fusion" in pipeline_ids
    assert "enforcement_to_permanent_zoning" in pipeline_ids
    assert "vendor_certification_livelihood_tracking" in pipeline_ids

def test_pipeline_1_execution(executor):
    """Verify Pipeline 1: AI Vending Zone Optimization."""
    res = executor.execute_pipeline("ai_vending_zone_optimization", {"location_id": "ZONE-A", "target_vendors": 33, "base_capacity": 40, "cv_count": 2480})
    assert res["status"] == "success"
    assert res["pipeline"] == "AI Vending Zone Optimization"
    assert "data_retrieval" in res["executed_stages"]
    assert "footfall_fusion" in res["executed_stages"]
    assert "zone_optimizer" in res["executed_stages"]
    assert "verifier" in res["executed_stages"]
    assert res["verified"] is True

def test_pipeline_2_execution(executor, zones):
    """Verify Pipeline 2: What-If Zoning & Impact Simulation."""
    res = executor.execute_pipeline("what_if_zoning_impact_simulation", {
        "location_id": "ZONE-B", "target_vendors": 31, "base_capacity": 35, "cv_count": 2140,
        "current_zone": zones[0], "simulated_zone": zones[1], "target_zone": zones[1]["name"]
    })
    assert res["status"] == "success"
    assert res["pipeline"] == "What-If Zoning & Impact Simulation"
    assert "simulation" in res["executed_stages"]
    assert "customer_access_change_pct" in res["metrics"]
    assert res["data"]["comparison"]["simulated"]["id"] == "ZONE-A"

def test_pipeline_3_execution(executor):
    """Verify Pipeline 3: Footfall Intelligence & Fusion."""
    res = executor.execute_pipeline("footfall_intelligence_fusion", {"cv_count": 523.0})
    assert res["status"] == "success"
    assert res["pipeline"] == "Footfall Intelligence & Fusion"
    assert res["metrics"]["footfall"] == 523

def test_pipeline_4_execution(executor):
    """Verify Pipeline 4: Enforcement-to-Permanent-Zoning Pipeline."""
    res = executor.execute_pipeline("enforcement_to_permanent_zoning", {"location": "Nagpur Metro Corridor", "violations_count": 4, "cv_count": 1800})
    assert res["status"] == "success"
    assert res["pipeline"] == "Enforcement-to-Permanent-Zoning Pipeline"
    assert "enforcement_intel" in res["executed_stages"]
    assert res["metrics"]["enforcement_decision"] == "RECOMMEND PERMANENT ZONING"

def test_pipeline_5_execution(executor):
    """Verify Pipeline 5: Vendor Certification & Livelihood Tracking."""
    res = executor.execute_pipeline("vendor_certification_livelihood_tracking", {
        "vendor_id": "VV-2024-001",
        "vendor_name": "Sujal Tembhare",
        "baseline_income": 12400.0,
        "current_income": 15920.0
    })
    assert res["status"] == "success"
    assert res["pipeline"] == "Vendor Certification & Livelihood Tracking"
    assert "certificate_manager" in res["executed_stages"]
    assert "livelihood_impact" in res["executed_stages"]
    assert "pm_svanidhi_tier" in res["metrics"]

def test_invalid_pipeline_id_handling(executor):
    """Verify executor handles unknown pipeline IDs gracefully."""
    res = executor.execute_pipeline("non_existent_pipeline_id")
    assert res["status"] == "error"
    assert "not found" in res["message"]

def test_custom_stage_handler_registration(registry, executor):
    """Verify registering custom stage handler at runtime."""
    class CustomStage(BaseStage):
        def execute(self, context: PipelineContext) -> PipelineContext:
            context.data["custom_stage_executed"] = True
            context.executed_stages.append(self.stage_id)
            return context

    registry.register_stage_handler("custom_test", CustomStage)
    assert registry.get_stage_handler_cls("custom_test") == CustomStage
