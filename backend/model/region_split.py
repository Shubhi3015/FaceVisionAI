import numpy as np

def split_face_regions(face):
    """
    Splits the detected face into anatomical regions.
    Returns dictionary of region_name : region_image
    """

    if face is None:
        return {}

    h, w, _ = face.shape
    regions = {}

    # Vertical divisions
    forehead_end = int(h * 0.22)
    eye_end = int(h * 0.42)
    nose_end = int(h * 0.70)
    chin_start = int(h * 0.80)

    # Horizontal divisions
    left_end = int(w * 0.33)
    right_start = int(w * 0.66)

    center_left = int(w * 0.40)
    center_right = int(w * 0.60)

    # -------- Regions --------

    # Forehead
    regions["Forehead"] = face[0:forehead_end, :]

    # Left Eye
    regions["Left Eye"] = face[forehead_end:eye_end, 0:left_end]

    # Right Eye
    regions["Right Eye"] = face[forehead_end:eye_end, right_start:w]

    # Nose
    regions["Nose"] = face[eye_end:nose_end, center_left:center_right]

    # Left Cheek
    regions["Left Cheek"] = face[eye_end:nose_end, 0:left_end]

    # Right Cheek
    regions["Right Cheek"] = face[eye_end:nose_end, right_start:w]

    # Chin
    regions["Chin"] = face[chin_start:h, :]

    # Remove empty regions safely
    clean_regions = {}
    for name, region in regions.items():
        if region is not None and region.size != 0:
            clean_regions[name] = region

    return clean_regions
