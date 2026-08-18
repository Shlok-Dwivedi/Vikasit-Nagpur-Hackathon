"""OpenCV-powered image analysis for field inspection and footfall input."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import cv2
import numpy as np


class OpenCVImageError(ValueError):
    """Raised when uploaded bytes are not a decodable image."""


@dataclass
class OpenCVService:
    max_dimension: int = 1920

    def _decode(self, payload: bytes) -> np.ndarray:
        if not payload:
            raise OpenCVImageError("The uploaded image is empty")
        encoded = np.frombuffer(payload, dtype=np.uint8)
        image = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
        if image is None:
            raise OpenCVImageError("OpenCV could not decode the uploaded image")

        height, width = image.shape[:2]
        longest = max(height, width)
        if longest > self.max_dimension:
            scale = self.max_dimension / longest
            image = cv2.resize(image, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
        return image

    def decode_qr(self, payload: bytes) -> dict[str, Any]:
        image = self._decode(payload)
        detector = cv2.QRCodeDetector()
        values: list[str] = []

        if hasattr(detector, "detectAndDecodeMulti"):
            ok, decoded, _points, _straight = detector.detectAndDecodeMulti(image)
            if ok:
                values.extend(value.strip() for value in decoded if value and value.strip())

        if not values:
            value, _points, _straight = detector.detectAndDecode(image)
            if value and value.strip():
                values.append(value.strip())

        return {
            "detected": bool(values),
            "values": list(dict.fromkeys(values)),
            "image_width": int(image.shape[1]),
            "image_height": int(image.shape[0]),
            "engine": f"OpenCV {cv2.__version__}",
        }

    def count_people(self, payload: bytes) -> dict[str, Any]:
        """Detect people in a CCTV frame using OpenCV's built-in HOG detector."""
        image = self._decode(payload)
        hog = cv2.HOGDescriptor()
        hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
        boxes, weights = hog.detectMultiScale(image, winStride=(8, 8), padding=(8, 8), scale=1.05)
        confidences = [float(weight) for weight in weights]
        mean_confidence = sum(confidences) / len(confidences) if confidences else 0.0
        return {
            "people_count": len(boxes),
            "detector_confidence": round(min(1.0, mean_confidence), 3),
            "detections": [
                {"x": int(x), "y": int(y), "width": int(w), "height": int(h), "confidence": round(confidences[index], 3)}
                for index, (x, y, w, h) in enumerate(boxes)
            ],
            "image_width": int(image.shape[1]),
            "image_height": int(image.shape[0]),
            "engine": f"OpenCV {cv2.__version__} HOG",
        }


opencv_service = OpenCVService()
