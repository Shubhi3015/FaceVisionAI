import cv2
import numpy as np
from PIL import Image, ImageOps


class ImageLoader:
    def __init__(self, target_width=1024):
        """
        Args:
            target_width (int): Width to resize image to (maintaining aspect ratio).
                                1024px is a sweet spot for quality vs. speed.
        """
        self.target_width = target_width

    def load_from_path(self, path):
        """
        Loads an image from a file path, fixes rotation, and converts to RGB.
        """
        try:
            # use PIL to open because it handles EXIF rotation automatically
            pil_image = Image.open(path)
            pil_image = ImageOps.exif_transpose(pil_image)

            # Convert to RGB (standard for AI models)
            if pil_image is not None and pil_image.mode != "RGB":
                pil_image = pil_image.convert("RGB")

            # Convert to NumPy array (OpenCV format)
            img_array = np.array(pil_image)

            # Resize
            img_resized = self._resize_maintain_aspect(img_array)
            return img_resized

        except Exception as e:
            print(f"Error loading image: {e}")
            return None

    def load_from_webcam(self, cap_device=0):
        """
        Captures a single frame from the webcam.
        """
        cap = cv2.VideoCapture(cap_device)
        if not cap.isOpened():
            print("Error: Could not open webcam.")
            return None

        ret, frame = cap.read()
        cap.release()

        if ret:
            # Webcam returns BGR, convert to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            return self._resize_maintain_aspect(frame_rgb)
        else:
            print("Error: Could not read frame.")
            return None

    def _resize_maintain_aspect(self, image):
        """
        Resizes image to target_width while keeping aspect ratio.
        """
        h, w = image.shape[:2]
        if w > self.target_width:
            scale = self.target_width / w
            new_h = int(h * scale)
            # INTER_AREA is best for shrinking images (keeps texture sharp)
            resized = cv2.resize(image, (self.target_width, new_h), interpolation=cv2.INTER_AREA)
            return resized
        return image

    def enhance_contrast(self, image):
        """
        OPTIONAL: Apply CLAHE (Contrast Limited Adaptive Histogram Equalization).
        Great for bringing out acne/pore texture in flat lighting.
        """
        # CLAHE works on the L (Lightness) channel of LAB color space
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)

        # Clip limit: 2.0 (standard), Tile size: 8x8
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)

        limg = cv2.merge((cl, a, b))
        final = cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)
        return final


if __name__ == "__main__":
    loader = ImageLoader()

    # Simulate loading
    img = loader.load_from_path("data/raw/test_selfie.jpg")

    if img is not None:
        print(f"Image Loaded Successfully. Shape: {img.shape}")

        # Optional: enhance texture for better detection later
        enhanced_img = loader.enhance_contrast(img)

        # Save to check quality (convert back to BGR for OpenCV saving)
        cv2.imwrite("debug_step1_output.jpg", cv2.cvtColor(enhanced_img, cv2.COLOR_RGB2BGR))
        print("Saved debug_step1_output.jpg")
