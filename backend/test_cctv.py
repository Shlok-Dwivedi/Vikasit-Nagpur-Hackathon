import cv2
from ultralytics import YOLO


VIDEO_PATH = "app/data/zone_a/sample.mp4"
OUTPUT_PATH = "app/data/zone_a/tracked_people.mp4"


def main():
    model = YOLO("yolo11n.pt")

    video = cv2.VideoCapture(VIDEO_PATH)

    if not video.isOpened():
        raise RuntimeError(f"Could not open video: {VIDEO_PATH}")

    fps = video.get(cv2.CAP_PROP_FPS)
    width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))

    output = cv2.VideoWriter(
        OUTPUT_PATH,
        cv2.VideoWriter_fourcc(*"mp4v"),
        fps,
        (width, height),
    )

    frame_number = 0

    # All unique person IDs seen during the video
    unique_people = set()

    # Statistics
    total_occupancy = 0
    frames_with_detections = 0
    peak_occupancy = 0

    while True:
        success, frame = video.read()

        if not success:
            break

        frame_number += 1

        results = model.track(
            frame,
            persist=True,
            verbose=False,
        )

        result = results[0]

        current_people = 0

        if result.boxes.id is not None:

            tracking_ids = result.boxes.id.int().cpu().tolist()
            class_ids = result.boxes.cls.int().cpu().tolist()

            for track_id, class_id in zip(tracking_ids, class_ids):

                class_name = model.names[class_id]

                # Only count people
                if class_name == "person":
                    current_people += 1
                    unique_people.add(track_id)

        # Update statistics
        if current_people > 0:
            frames_with_detections += 1

        total_occupancy += current_people
        peak_occupancy = max(
            peak_occupancy,
            current_people
        )

        # Draw tracking information
        annotated_frame = result.plot()

        # Display current occupancy on video
        cv2.putText(
            annotated_frame,
            f"People: {current_people}",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2,
        )

        output.write(annotated_frame)

        if frame_number % 30 == 0:
            print(
                f"Frame {frame_number} | "
                f"Current people: {current_people} | "
                f"Unique people: {len(unique_people)}"
            )

    video.release()
    output.release()

    average_occupancy = (
        total_occupancy / frames_with_detections
        if frames_with_detections > 0
        else 0
    )

    print("\n========== ZONE A ANALYTICS ==========")
    print(f"Total frames: {frame_number}")
    print(f"Unique people detected: {len(unique_people)}")
    print(f"Peak occupancy: {peak_occupancy}")
    print(f"Average occupancy: {average_occupancy:.2f}")
    print("======================================")
    print(f"Saved to: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()