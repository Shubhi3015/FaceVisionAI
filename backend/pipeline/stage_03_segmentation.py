import numpy as np
import torch
import cv2
from transformers import SegformerImageProcessor, SegformerForSemanticSegmentation
from functools import lru_cache


class FaceSegmenter:
    def __init__(self, model_name="jonathandinu/face-parsing", target_size=512, use_half=True):
        self.model_name = model_name
        self.target_size = target_size

        # 1. Setup Device (GPU vs CPU)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        # Only use FP16 (Half Precision) if we are on a GPU
        self.use_half = use_half and self.device == "cuda"

        print(f"Loading Segmentation Model on {self.device} (FP16: {self.use_half})...")

        # 2. Load Resources (Cached to prevent reloading)
        self.processor, self.model = self._load_resources(self.model_name, self.device, self.use_half)
        print("Segmentation model ready.")

    @staticmethod
    @lru_cache(maxsize=1)
    def _load_resources(model_name, device, use_half):
        """
        Static method to load model once and cache it in RAM.
        """
        processor = SegformerImageProcessor.from_pretrained(model_name)
        model = SegformerForSemanticSegmentation.from_pretrained(model_name)

        # Move to GPU
        model.to(device)
        model.eval()

        # Convert weights to Half Precision (FP16) for speedup
        if use_half:
            model.half()

        return processor, model

    def segment_face(self, image):
        """
        Args:
            image: RGB numpy array (Any size)
        Returns:
            parsing_map: Class ID map
            skin_mask: Binary mask (0 or 255)
        """
        if image is None:
            return None, None

        h, w = image.shape[:2]

        # Resize to target size for speed
        if max(h, w) > self.target_size:
            small_image = cv2.resize(image, (self.target_size, self.target_size))
        else:
            small_image = image

        # Preprocess (Convert to Tensors)
        inputs = self.processor(images=small_image, return_tensors="pt")

        # Move Inputs to GPU & Match Precision
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        if self.use_half:
            # If model is FP16, input must be FP16 too
            inputs["pixel_values"] = inputs["pixel_values"].half()

        # Inference (No Gradient Calculation = Faster)
        with torch.no_grad():
            outputs = self.model(**inputs)

        # Post-process (Upscale back to original size)
        logits = outputs.logits

        upsampled_logits = torch.nn.functional.interpolate(
            logits,
            size=(h, w),
            mode="bilinear",
            align_corners=False,
        )

        # Get the class with highest probability for each pixel
        parsing_map = upsampled_logits.argmax(dim=1)[0].cpu().numpy()

        # Create Skin Mask (Skin=1, Nose=2)
        skin_mask = np.zeros_like(parsing_map, dtype=np.uint8)
        skin_mask[parsing_map == 1] = 255
        skin_mask[parsing_map == 2] = 255

        return parsing_map, skin_mask


if __name__ == "__main__":
    import time

    # Create dummy image (1024x1024) to simulate high-res input
    print("Generating dummy input...")
    dummy_img = np.random.randint(0, 255, (1024, 1024, 3), dtype=np.uint8)

    print("Initializing Segmenter...")
    seg = FaceSegmenter()

    print("Warmup Run...")
    seg.segment_face(dummy_img)

    print("Running Speed Test (Average of 10 runs)...")
    t0 = time.time()
    for _ in range(10):
        seg.segment_face(dummy_img)
    avg = (time.time() - t0) / 10

    print(f"Average Inference Time: {avg * 1000:.2f} ms")
    print("Target: < 50ms on GPU")
