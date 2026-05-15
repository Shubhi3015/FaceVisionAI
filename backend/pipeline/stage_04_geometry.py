"""
stage_04_geometry.py  –  Region extraction from a cropped face image.

CHANGE FROM ORIGINAL:
  Removed mediapipe dependency (mp.solutions.face_mesh is broken on Python 3.13).
  Replaced with a geometry-based fallback that divides the face into 4 regions
  (forehead, left cheek, right cheek, chin) using the face bounding box and
  proportional splits — no landmark model required.

  If you later want landmark-based precision, install mediapipe on Python ≤3.11
  or integrate dlib's 68-point predictor. The interface (_run / process_image /
  process_path) is unchanged so api.py and app.py need NO edits.
"""

import os
import cv2
import numpy as np

from pipeline.stage_01_loader import ImageLoader
from pipeline.stage_02_face_detect import FaceDetector
from pipeline.stage_03_segmentation import FaceSegmenter


class RegionExtractor:
    """
    Splits a cropped face image into 4 non-overlapping regions using
    proportional geometry (no external landmark model needed).

    Region layout (approximate % of face height):
        Forehead   : top 0% – 30%
        Left Cheek : 30% – 75%, right half  (image-left = person's left)
        Right Cheek: 30% – 75%, left half
        Chin       : 75% – 100%
    """

    # Vertical split ratios (fraction of image height)
    FOREHEAD_BOTTOM = 0.30
    CHEEK_BOTTOM    = 0.75

    def extract_regions(self, image: np.ndarray, skin_mask: np.ndarray):
        """
        Parameters
        ----------
        image     : RGB numpy array (H x W x 3) — already cropped to face
        skin_mask : uint8 binary mask (H x W), 255 = skin

        Returns
        -------
        dict of { region_name: { image, mask, bbox, contour } }
        or None if the image is too small.
        """
        if image is None or skin_mask is None:
            return None

        h, w = image.shape[:2]
        if h < 20 or w < 20:
            return None

        # Vertical band boundaries (pixels)
        forehead_y2 = int(h * self.FOREHEAD_BOTTOM)
        cheek_y2    = int(h * self.CHEEK_BOTTOM)
        mid_x       = w // 2

        # Define rectangular masks for each region
        zone_masks = {
            "forehead":    self._rect_mask(h, w, 0,           forehead_y2, 0,     w),
            "left_cheek":  self._rect_mask(h, w, forehead_y2, cheek_y2,    mid_x, w),
            "right_cheek": self._rect_mask(h, w, forehead_y2, cheek_y2,    0,     mid_x),
            "chin":        self._rect_mask(h, w, cheek_y2,    h,           0,     w),
        }

        regions = {}
        for name, zone_mask in zone_masks.items():
            # Intersect with skin mask so we only keep actual skin pixels
            final_mask = cv2.bitwise_and(zone_mask, skin_mask)

            x, y, w_r, h_r = cv2.boundingRect(final_mask)
            if w_r < 5 or h_r < 5:
                continue

            region_crop = cv2.bitwise_and(image, image, mask=final_mask)
            region_crop = region_crop[y: y + h_r, x: x + w_r]
            region_mask = final_mask[y: y + h_r, x: x + w_r]

            contours, _ = cv2.findContours(
                final_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            largest_contour = max(contours, key=cv2.contourArea) if contours else None

            regions[name] = {
                "image":   region_crop,
                "mask":    region_mask,
                "bbox":    (x, y, w_r, h_r),
                "contour": largest_contour,
            }

        return regions if regions else None

    @staticmethod
    def _rect_mask(h, w, y1, y2, x1, x2):
        mask = np.zeros((h, w), dtype=np.uint8)
        mask[y1:y2, x1:x2] = 255
        return mask


class RegionExtractionPipeline:
    """
    Convenience runner: raw image (path or numpy array) → region dict.
    Used directly by api.py and app.py.
    """

    def __init__(
        self,
        output_root="data/processed",
        target_width=1024,
        loader=None,
        detector=None,
        segmenter=None,
        extractor=None,
    ):
        self.output_root = output_root
        self.loader    = loader    or ImageLoader(target_width=target_width)
        self.detector  = detector  or FaceDetector()
        self.segmenter = segmenter or FaceSegmenter()
        self.extractor = extractor or RegionExtractor()

        for region in ["forehead", "left_cheek", "right_cheek", "chin"]:
            os.makedirs(os.path.join(self.output_root, region), exist_ok=True)

    # ------------------------------------------------------------------ #
    def process_path(self, image_path: str, save_outputs: bool = True):
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        image = self.loader.load_from_path(image_path)
        return self._run(image, base_name, save_outputs)

    def process_image(self, image: np.ndarray, name: str = "image", save_outputs: bool = True):
        return self._run(image, name, save_outputs)

    # ------------------------------------------------------------------ #
    def _run(self, image, base_name, save_outputs):
        if image is None:
            return {}

        cropped_face, _ = self.detector.detect_and_crop(image)
        if cropped_face is None:
            return {}

        _, skin_mask = self.segmenter.segment_face(cropped_face)
        if skin_mask is None:
            return {}

        regions = self.extractor.extract_regions(cropped_face, skin_mask)
        if not regions:
            return {}

        if save_outputs:
            for region_name, region_data in regions.items():
                save_img  = cv2.cvtColor(region_data["image"], cv2.COLOR_RGB2BGR)
                save_path = os.path.join(
                    self.output_root, region_name, f"{base_name}_{region_name}.jpg"
                )
                cv2.imwrite(save_path, save_img)

        return regions