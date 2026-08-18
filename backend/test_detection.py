import cv2
from ultralytics import YOLO


# --------------------------------------------------
# INPUT / OUTPUT
# --------------------------------------------------

VIDEO_PATH = "app/data/zone_a/sample.mp4"
IMAGE_PATH = "app/data/zone_a/test_frame.jpg"


# --------------------------------------------------
# LOAD MODEL
# --------------------------------------------------

# YOLO11s is more accurate than YOLO11n,
# especially for smaller objects.
model = YOLO("yolo11s.pt")


# --------------------------------------------------
# OPEN VIDEO
# --------------------------------------------------

video = cv2.VideoCapture(VIDEO_PATH)

if not video.isOpened():
    raise RuntimeError(
        f"Could not open video: {VIDEO_PATH}"
    )


# --------------------------------------------------
# READ ONE FRAME
# --------------------------------------------------

success, frame = video.read()

if not success:
    video.release()
    raise RuntimeError("Could not read a frame from the video.")


# --------------------------------------------------
# YOLO DETECTION
# --------------------------------------------------

results = model(
    frame,

    # Higher resolution helps detect small people
    # in crowded CCTV footage.
    imgsz=1280,

    # Lower confidence threshold allows YOLO to
    # consider partially visible/distant people.
    conf=0.20,

    verbose=False,
)


# --------------------------------------------------
# DRAW DETECTIONS
# --------------------------------------------------

annotated_frame = results[0].plot()


# --------------------------------------------------
# SAVE RESULT
# --------------------------------------------------

cv2.imwrite(
    IMAGE_PATH,
    annotated_frame
)


# --------------------------------------------------
# PRINT RESULTS
# --------------------------------------------------

person_count = 0

for box in results[0].boxes:

    class_id = int(box.cls[0])
    class_name = model.names[class_id]

    if class_name == "person":
        person_count += 1


print("--------------------------------")
print("YOLO DETECTION TEST")
print("--------------------------------")
print(f"People detected: {person_count}")
print(f"Output image: {IMAGE_PATH}")
print("--------------------------------")


video.release()