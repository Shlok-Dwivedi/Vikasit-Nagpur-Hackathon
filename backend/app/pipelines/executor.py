"""Dynamic Pipeline Executor Engine for Viksit Vyapari."""

from typing import Dict, Any, Optional
from app.pipelines.stages.base import PipelineContext
from app.pipelines.registry import PipelineRegistry

class DynamicPipelineExecutor:
    """Executes any pipeline dynamically loaded from configuration."""

    def __init__(self, registry: Optional[PipelineRegistry] = None, fusion_service=None):
        self.registry = registry or PipelineRegistry()
        self.fusion_service = fusion_service

    def execute_pipeline(self, pipeline_id: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Loads a pipeline definition and executes its stage chain dynamically."""
        pipeline_def = self.registry.get_pipeline(pipeline_id)
        if not pipeline_def:
            return {
                "status": "error",
                "message": f"Pipeline '{pipeline_id}' not found in registry.",
                "available_pipelines": [p["id"] for p in self.registry.list_pipelines()]
            }

        if not pipeline_def.enabled:
            return {
                "status": "disabled",
                "message": f"Pipeline '{pipeline_def.name}' is currently disabled in configuration."
            }

        # Create execution context
        context = PipelineContext(
            pipeline_id=pipeline_def.id,
            pipeline_name=pipeline_def.name,
            initial_params=params or {}
        )

        try:
            # Instantiate and execute ordered stage handlers dynamically
            for stage_info in pipeline_def.stages:
                stage_id = stage_info["id"]
                stage_type = stage_info["type"]
                stage_config = stage_info.get("config", {})

                handler_cls = self.registry.get_stage_handler_cls(stage_type)
                if not handler_cls:
                    context.log(stage_id, f"Stage handler for type '{stage_type}' not found!", level="ERROR")
                    continue

                # Instantiate stage handler (passing fusion_service if expected)
                if stage_type.lower() == "footfall_fusion" and self.fusion_service:
                    handler_instance = handler_cls(stage_id, stage_config, fusion_service=self.fusion_service)
                else:
                    handler_instance = handler_cls(stage_id, stage_config)

                # Execute stage logic
                context = handler_instance.execute(context)

            res = context.to_dict()
            res["status"] = "success"
            return res

        except Exception as e:
            context.error = str(e)
            res = context.to_dict()
            res["status"] = "error"
            return res
