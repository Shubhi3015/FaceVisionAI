import cv2
import numpy as np

def draw_issue_boxes(image, cam, color):

    if cam is None:
        return image

    h, w, _ = image.shape
    cam = cv2.resize(cam, (w, h))
    cam_uint8 = np.uint8(255 * cam)

    thresh_val = np.percentile(cam_uint8, 85)
    _, thresh = cv2.threshold(cam_uint8, thresh_val, 255, cv2.THRESH_BINARY)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 500:
            continue

        x, y, w_box, h_box = cv2.boundingRect(cnt)
        cv2.rectangle(image, (x, y), (x + w_box, y + h_box), color, 2)

    return image