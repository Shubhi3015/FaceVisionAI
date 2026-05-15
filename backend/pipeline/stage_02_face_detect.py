"""
stage_02_face_detect.py  –  Face detection using OpenCV DNN (ResNet-SSD).

Replaces the broken mediapipe-based detector.
mediapipe has no Python 3.13 support — mp.solutions is non-functional.

Model files (~2 MB total) are downloaded automatically on first run and
cached in pipeline/_face_model/ permanently.
"""

import os
import urllib.request
import cv2
import numpy as np

# ── Model paths ─────────────────────────────────────────────────────────────
_MODEL_DIR    = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_face_model")
_PROTO_PATH   = os.path.join(_MODEL_DIR, "deploy.prototxt")
_WEIGHTS_PATH = os.path.join(_MODEL_DIR, "res10_300x300_ssd_iter_140000.caffemodel")

_PROTO_URL   = (
    "https://raw.githubusercontent.com/opencv/opencv/master"
    "/samples/dnn/face_detector/deploy.prototxt"
)
_WEIGHTS_URL = (
    "https://github.com/opencv/opencv_3rdparty/raw/"
    "dnn_samples_face_detector_20170830"
    "/res10_300x300_ssd_iter_140000.caffemodel"
)


def _ensure_model():
    """Download DNN model files if not already present."""
    os.makedirs(_MODEL_DIR, exist_ok=True)
    if not os.path.isfile(_PROTO_PATH):
        print("[FaceDetector] Downloading prototxt (~25 KB)...")
        urllib.request.urlretrieve(_PROTO_URL, _PROTO_PATH)
    if not os.path.isfile(_WEIGHTS_PATH):
        print("[FaceDetector] Downloading weights (~2 MB)...")
        urllib.request.urlretrieve(_WEIGHTS_URL, _WEIGHTS_PATH)


class FaceDetector:
    """
    Detects and crops faces using OpenCV's ResNet-SSD DNN model.

    Public methods
    --------------
    detect(frame)            → list of (x, y, w, h) bounding boxes
    detect_and_crop(frame)   → (cropped_face_rgb, bbox) | (None, None)
    """

    CROP_PADDING = 0.10   # 10% padding on each side of the detected box

    def __init__(self, min_confidence: float = 0.5):
        _ensure_model()
        self.min_confidence = min_confidence
        self.net = cv2.dnn.readNetFromCaffe(_PROTO_PATH, _WEIGHTS_PATH)

    def detect(self, frame: np.ndarray) -> list:
        """
        Return list of (x, y, w, h) boxes sorted by confidence (best first).
        Accepts BGR frame.
        """
        h, w = frame.shape[:2]
        blob = cv2.dnn.blobFromImage(
            cv2.resize(frame, (300, 300)),
            scalefactor=1.0,
            size=(300, 300),
            mean=(104.0, 177.0, 123.0),
            swapRB=False,
            crop=False,
        )
        self.net.setInput(blob)
        detections = self.net.forward()

        boxes = []
        for i in range(detections.shape[2]):
            confidence = float(detections[0, 0, i, 2])
            if confidence < self.min_confidence:
                continue
            x1 = int(detections[0, 0, i, 3] * w)
            y1 = int(detections[0, 0, i, 4] * h)
            x2 = int(detections[0, 0, i, 5] * w)
            y2 = int(detections[0, 0, i, 6] * h)
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)
            bw, bh = x2 - x1, y2 - y1
            if bw > 0 and bh > 0:
                boxes.append((x1, y1, bw, bh))
        return boxes

    def detect_and_crop(self, frame: np.ndarray):
        """
        Detect the best face and return a padded RGB crop.

        Parameters
        ----------
        frame : RGB numpy array (H x W x 3)

        Returns
        -------
        (cropped_rgb, bbox)  or  (None, None)
        """
        if frame is None:
            return None, None

        bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        boxes = self.detect(bgr)
        if not boxes:
            return None, None

        x, y, w, h = boxes[0]
        pad_x = int(w * self.CROP_PADDING)
        pad_y = int(h * self.CROP_PADDING)
        fh, fw = frame.shape[:2]
        x1 = max(0, x - pad_x)
        y1 = max(0, y - pad_y)
        x2 = min(fw, x + w + pad_x)
        y2 = min(fh, y + h + pad_y)

        return frame[y1:y2, x1:x2], (x, y, w, h)