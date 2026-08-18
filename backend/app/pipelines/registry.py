"""Pipeline Definition Loader and Stage Registry."""

import json
import os
from typing import Dict, Any, Type, Optional, List
from app.pipelines.stages.base import BaseStage
from app.pipelines.stages.handlers import (
    OrchestratorStage,
    DataRetrievalStage,
    FootfallFusionStage,
    ZoneOptimizerStage,
    SimulationStage,
    EnforcementIntelStage,
    CertificateManagerStage,
    LivelihoodImpactStage,
    NotificationStage,
    CitizenInterfaceStage,
    VerifierStage
)

class PipelineDefinition:
    """Represents a loaded Pipeline Configuration Schema."""
    
    def __init__(self, pipeline_dict: Dict[str, Any]):
        self.id: str = pipeline_dict["id"]
        self.name: str = pipeline_dict["name"]
        self.description: str = pipeline_dict.get("description", "")
        self.enabled: bool = pipeline_dict.get("enabled", True)
        self.stages: List[Dict[str, Any]] = pipeline_dict.get("stages", [])

class PipelineRegistry:
    """Registry managing dynamic Pipeline Definitions and Stage Handlers."""

    def __init__(self, config_path: Optional[str] = None):
        self._stage_handlers: Dict[str, Type[BaseStage]] = {}
        self._pipelines: Dict[str, PipelineDefinition] = {}
        
        # Register standard built-in stage handlers
        self.register_stage_handler("orchestrator", OrchestratorStage)
        self.register_stage_handler("data_retrieval", DataRetrievalStage)
        self.register_stage_handler("footfall_fusion", FootfallFusionStage)
        self.register_stage_handler("zone_optimizer", ZoneOptimizerStage)
        self.register_stage_handler("simulation", SimulationStage)
        self.register_stage_handler("enforcement_intel", EnforcementIntelStage)
        self.register_stage_handler("certificate_manager", CertificateManagerStage)
        self.register_stage_handler("livelihood_impact", LivelihoodImpactStage)
        self.register_stage_handler("notification", NotificationStage)
        self.register_stage_handler("citizen_interface", CitizenInterfaceStage)
        self.register_stage_handler("verifier", VerifierStage)

        # Load pipeline definitions from config
        default_config = os.path.join(os.path.dirname(__file__), "config", "pipelines_config.json")
        self.load_definitions(config_path or default_config)

    def register_stage_handler(self, stage_type: str, handler_cls: Type[BaseStage]):
        """Register a stage handler class."""
        self._stage_handlers[stage_type.lower()] = handler_cls

    def get_stage_handler_cls(self, stage_type: str) -> Optional[Type[BaseStage]]:
        """Get registered stage handler class."""
        return self._stage_handlers.get(stage_type.lower())

    def load_definitions(self, config_path: str):
        """Load pipeline definitions from a JSON file."""
        if not os.path.exists(config_path):
            raise FileNotFoundError(f"Pipeline config file not found: {config_path}")

        with open(config_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        for p_dict in data.get("pipelines", []):
            p_def = PipelineDefinition(p_dict)
            self._pipelines[p_def.id] = p_def

    def get_pipeline(self, pipeline_id: str) -> Optional[PipelineDefinition]:
        """Get pipeline definition by ID or fuzzy name match."""
        clean_id = pipeline_id.lower().replace("-", "_").replace(" ", "_")
        
        # Direct match
        if clean_id in self._pipelines:
            return self._pipelines[clean_id]

        # Name or substring match
        for p_def in self._pipelines.values():
            if p_def.name.lower() == pipeline_id.lower() or clean_id in p_def.id:
                return p_def
        return None

    def list_pipelines(self) -> List[Dict[str, Any]]:
        """List all loaded pipelines."""
        return [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "enabled": p.enabled,
                "stages_count": len(p.stages),
                "stages": [s["type"] for s in p.stages]
            }
            for p in self._pipelines.values()
        ]
