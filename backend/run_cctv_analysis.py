import cv2
import json
import os
from ultralytics import YOLO


# ============================================================
# CONFIGURATION
# ============================================================

ZONES = {
    "ZONE_A": "app/data/zone_a/sample.mp4",
    "ZONE_B": "app/data/zone_b/sample.mp4.mov",
    "ZONE_C": "app/data/zone_c/sample.mp4.mp4",
    "ZONE_D": "app/data/zone_d/sample.mp4.mp4",
}

OUTPUT_JSON = "app/data/cctv_analysis.json"


# ============================================================
# ANALYZE ONE ZONE
# ============================================================

def analyze_zone(model, zone_id, video_path):

    print()
    print(f"========== {zone_id} ==========")

    if not os.path.exists(video_path):
        print(f"Video not found: {video_path}")
        return None

    video = cv2.VideoCapture(video_path)

    if not video.isOpened():
        print(f"Could not open: {video_path}")
        return None

    total_frames = int(
        video.get(cv2.CAP_PROP_FRAME_COUNT)
    )

    # Analyze 20 representative frames
    sample_count = min(20, total_frames)

    people_counts = []
    vehicle_counts = []

    for i in range(sample_count):

        frame_index = int(
            i * total_frames / sample_count
        )

        video.set(
            cv2.CAP_PROP_POS_FRAMES,
            frame_index
        )

        success, frame = video.read()

        if not success:
            continue

        results = model(
            frame,
            imgsz=1280,
            conf=0.20,
            verbose=False
        )

        people = 0
        vehicles = 0

        for box in results[0].boxes:

            class_id = int(box.cls[0])
            class_name = model.names[class_id]

            if class_name == "person":
                people += 1

            elif class_name in {
                "car",
                "motorcycle",
                "bus",
                "truck"
            }:
                vehicles += 1

        people_counts.append(people)
        vehicle_counts.append(vehicles)

        print(
            f"Sample {i + 1}/{sample_count} | "
            f"People: {people} | "
            f"Vehicles: {vehicles}"
        )

    video.release()

    if not people_counts:
        return None

    average_people = (
        sum(people_counts) /
        len(people_counts)
    )

    peak_people = max(people_counts)

    average_vehicles = (
        sum(vehicle_counts) /
        len(vehicle_counts)
    )

    peak_vehicles = max(vehicle_counts)

    # Prototype congestion indicator.
    # This will later be replaced with your
    # actual zone-calibrated formula.
    congestion_score = min(
        100,
        round(
            (average_people /
             max(peak_people, 1)) * 100
        )
    )

    return {
        "zone_id": zone_id,
        "frames_analyzed": len(people_counts),
        "average_people": round(
            average_people, 2
        ),
        "peak_people": peak_people,
        "average_vehicles": round(
            average_vehicles, 2
        ),
        "peak_vehicles": peak_vehicles,
        "congestion_score": congestion_score
    }


# ============================================================
# MAIN
# ============================================================

def main():

    print("Loading YOLO11s...")

    model = YOLO("yolo11s.pt")

    all_results = {}

    for zone_id, video_path in ZONES.items():

        result = analyze_zone(
            model,
            zone_id,
            video_path
        )

        if result is not None:
            all_results[zone_id] = result

    # --------------------------------------------------------
    # SAVE JSON
    # --------------------------------------------------------

    with open(
        OUTPUT_JSON,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            all_results,
            file,
            indent=4
        )

    print()
    print("======================================")
    print("       CCTV ANALYSIS COMPLETE")
    print("======================================")

    print(
        json.dumps(
            all_results,
            indent=4
        )
    )

    print("======================================")
    print(f"Saved to: {OUTPUT_JSON}")


if __name__ == "__main__":
    main()