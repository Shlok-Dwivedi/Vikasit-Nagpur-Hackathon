"""Base Stage Interface and Pipeline Execution Context."""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime

class PipelineContext:
    """Shared execution context passed across pipeline stages."""
    
    def __init__(self, pipeline_id: str, pipeline_name: str, initial_params: Optional[Dict[str, Any]] = None):
        self.pipeline_id: str = pipeline_id
        self.pipeline_name: str = pipeline_name
        self.params: Dict[str, Any] = initial_params or {}
        self.data: Dict[str, Any] = {}
        self.executed_stages: List[str] = []
        self.logs: List[Dict[str, Any]] = []
        self.metrics: Dict[str, Any] = {}
        self.verified: bool = False
        self.recommendation: str = ""
        self.error: Optional[str] = None
        self.start_time: datetime = datetime.now()

    def log(self, stage_id: str, message: str, level: str = "INFO"):
        self.logs.append({
            "timestamp": datetime.now().isoformat(),
            "stage_id": stage_id,
            "level": level,
            "message": message
        })

    def to_dict(self) -> Dict[str, Any]:
        return {
            "pipeline_id": self.pipeline_id,
            "pipeline": self.pipeline_name,
            "executed_stages": self.executed_stages,
            "data": self.data,
            "metrics": self.metrics,
            "verified": self.verified,
            "recommendation": self.recommendation,
            "error": self.error,
            "logs_count": len(self.logs),
            "execution_time_ms": round((datetime.now() - self.start_time).total_seconds() * 1000, 2),
            "timestamp": datetime.now().isoformat()
        }

class BaseStage(ABC):
    """Abstract Base Class for all pipeline stage handlers."""

    def __init__(self, stage_id: str, config: Optional[Dict[str, Any]] = None):
        self.stage_id: str = stage_id
        self.config: Dict[str, Any] = config or {}

    @abstractmethod
    def execute(self, context: PipelineContext) -> PipelineContext:
        """Execute stage logic and update pipeline context."""
        pass
