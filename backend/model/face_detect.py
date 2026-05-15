import cv2
import numpy as np

# Use OpenCV built-in Haar cascade
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)


def detect_face(image):
    """
    Detects the largest frontal/near-frontal face in the image.
    Rejects images without clear face.
    Returns cropped face region or None.
    """

    if image is None:
        return None

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

    # Detect faces
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=6,
        minSize=(120, 120)
    )

    if len(faces) == 0:
        return None

    # Select largest detected face
    x, y, w, h = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)[0]

    # Reject very small detections (avoid logos / background)
    if w < 150 or h < 150:
        return None

    # Add padding
    pad = int(0.15 * w)

    x1 = max(0, x - pad)
    y1 = max(0, y - pad)
    x2 = min(image.shape[1], x + w + pad)
    y2 = min(image.shape[0], y + h + pad)

    face_crop = image[y1:y2, x1:x2]

    # Final safety check
    if face_crop.size == 0:
        return None

    return face_crop
