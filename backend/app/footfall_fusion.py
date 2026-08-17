"""Reliable, source-agnostic footfall fusion used by the agent pipelines.

The class accepts the latest CV/YOLO reading without importing or replacing a
camera worker.  It combines it with a static historical baseline and always
returns a usable result when either source becomes unavailable.
"""
from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any, Optional


def _clamp(value: float) -> float:
    return max(0.0, min(1.0, value))


class FootfallFusionService:
    def __init__(self, dataset_baseline: float = 480.0) -> None:
        self.dataset_value: Optional[float] = dataset_baseline
        self.dataset_available = True
        self.dataset_quality = 0.78
        self.cv_value: Optional[float] = None
        self.cv_available = False
        self.cv_quality = 0.0
        self.estimate: Optional[float] = None
        self.variance = 100.0
        self.process_noise = 6.0
        self.history: list[dict[str, Any]] = []

    def set_cv(
        self,
        count: Optional[float],
        available: bool = True,
        opencv_confidence: float = 0.85,
        frame_quality: float = 0.90,
        occlusion_level: float = 0.0,
        temporal_anomaly_score: float = 0.0,
    ) -> dict[str, Any]:
        self.cv_value = count
        self.cv_available = bool(available and count is not None)
        self.cv_quality = _clamp(
            opencv_confidence
            * frame_quality
            * (1 - _clamp(occlusion_level))
            * (1 - _clamp(temporal_anomaly_score))
        ) if self.cv_available else 0.0
        return self.fuse()

    def set_dataset(
        self, value: Optional[float], available: bool = True,
        freshness_hours: float = 24.0, spatial_coverage: float = 0.90,
        historical_outlier_score: float = 0.0,
    ) -> dict[str, Any]:
        self.dataset_value = value
        self.dataset_available = bool(available and value is not None)
        freshness_factor = math.exp(-max(0.0, freshness_hours) / 168.0)
        self.dataset_quality = _clamp(
            freshness_factor * spatial_coverage * (1 - _clamp(historical_outlier_score))
        ) if self.dataset_available else 0.0
        return self.fuse()

    def _kalman_update(self, measurements: list[tuple[float, float]]) -> tuple[float, float]:
        if self.estimate is None:
            self.estimate = sum(value for value, _ in measurements) / len(measurements)
            self.variance = min(noise for _, noise in measurements)
        else:
            self.variance += self.process_noise
            for value, noise in measurements:
                gain = self.variance / (self.variance + noise)
                self.estimate += gain * (value - self.estimate)
                self.variance *= 1 - gain
        return self.estimate, math.sqrt(max(self.variance, 0.01))

    def fuse(self) -> dict[str, Any]:
        quality_total = self.cv_quality + self.dataset_quality
        cv_weight = self.cv_quality / quality_total if quality_total else 0.0
        dataset_weight = self.dataset_quality / quality_total if quality_total else 0.0
        measurements: list[tuple[float, float]] = []
        if self.cv_available and self.cv_value is not None:
            measurements.append((self.cv_value, 250.0 / max(self.cv_quality, 0.05)))
        if self.dataset_available and self.dataset_value is not None:
            measurements.append((self.dataset_value, 350.0 / max(self.dataset_quality, 0.05)))

        if measurements:
            estimate, uncertainty = self._kalman_update(measurements)
        elif self.estimate is not None:
            self.variance += self.process_noise * 4
            estimate, uncertainty = self.estimate, math.sqrt(self.variance)
        else:
            estimate, uncertainty = 0.0, 0.0

        sources = (["cv"] if self.cv_available else []) + (["dataset"] if self.dataset_available else [])
        fallback_reason = None if len(sources) == 2 else (
            "dataset-only" if self.dataset_available else "cctv-only" if self.cv_available else "no-source"
        )
        result = {
            "footfall": round(max(estimate, 0)),
            "uncertainty": round(uncertainty, 2),
            "confidence": round(_clamp(quality_total / 2), 3),
            "sources_used": sources,
            "cv_weight": round(cv_weight, 3),
            "dataset_weight": round(dataset_weight, 3),
            "fallback_mode": len(sources) != 2,
            "fallback_reason": fallback_reason,
            "live_cv_count": round(self.cv_value) if self.cv_value is not None else None,
            "dataset_baseline": round(self.dataset_value) if self.dataset_value is not None else None,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self.history.insert(0, result)
        self.history = self.history[:500]
        return result

    def latest(self) -> dict[str, Any]:
        """Return the current fused state for downstream pipelines."""
        return self.fuse()
