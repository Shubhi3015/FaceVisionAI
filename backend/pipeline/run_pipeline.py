import os
import cv2
import glob
import argparse
from tqdm import tqdm

from pipeline.stage_01_loader import ImageLoader
from pipeline.stage_02_face_detect import FaceDetector
from pipeline.stage_03_segmentation import FaceSegmenter
from pipeline.stage_04_geometry import RegionExtractor, RegionExtractionPipeline


class SkinProcessingPipeline:
    def __init__(self, output_root="data/processed"):
        self.output_root = output_root

        # Initialize the AI Models once (they are heavy)
        print("Initializing pipeline models...")
        self.loader = ImageLoader()
        self.detector = FaceDetector()
        self.segmenter = FaceSegmenter()
        self.extractor = RegionExtractor()
        print("Models ready.")

        # Create output directories if they don't exist
        self.regions = ["forehead", "left_cheek", "right_cheek", "chin"]
        for region in self.regions:
            os.makedirs(os.path.join(self.output_root, region), exist_ok=True)

    def process_single_image(self, image_path):
        """
        Runs the full pipeline on one image.
        """
        filename = os.path.basename(image_path)
        base_name = os.path.splitext(filename)[0]

        # --- STAGE 1: LOAD ---
        image = self.loader.load_from_path(image_path)
        if image is None:
            print(f"Could not load {filename}")
            return

        # --- STAGE 2: FACE DETECT ---
        cropped_face, _ = self.detector.detect_and_crop(image)
        if cropped_face is None:
            print(f"No face detected in {filename}")
            return

        # --- STAGE 3: SEGMENTATION ---
        _, skin_mask = self.segmenter.segment_face(cropped_face)

        # --- STAGE 4: REGION EXTRACTION ---
        regions = self.extractor.extract_regions(cropped_face, skin_mask)

        if not regions:
            print(f"Could not extract regions for {filename}")
            return

        # --- SAVE RESULTS ---
        for region_name, region_data in regions.items():
            # Convert RGB back to BGR for OpenCV saving
            save_img = cv2.cvtColor(region_data["image"], cv2.COLOR_RGB2BGR)

            # Construct save path: data/processed/forehead/my_selfie_forehead.jpg
            save_path = os.path.join(self.output_root, region_name, f"{base_name}_{region_name}.jpg")

            cv2.imwrite(save_path, save_img)

    def process_directory(self, input_dir):
        """
        Runs the pipeline on EVERY image in a folder.
        """
        # Get all jpg/png/jpeg files
        extensions = ["*.jpg", "*.jpeg", "*.png", "*.JPG", "*.PNG"]
        files = []
        for ext in extensions:
            files.extend(glob.glob(os.path.join(input_dir, ext)))

        print(f"Found {len(files)} images in {input_dir}")

        # Run with a progress bar
        for file_path in tqdm(files, desc="Processing Dataset"):
            self.process_single_image(file_path)


def process_stage4_only(input_path, output_root="data/processed"):
    """Directly run through Stage 4 (load->detect->segment->geometry) on a file or directory."""
    pipeline = RegionExtractionPipeline(output_root=output_root)

    if os.path.isdir(input_path):
        extensions = ["*.jpg", "*.jpeg", "*.png", "*.JPG", "*.PNG"]
        files = []
        for ext in extensions:
            files.extend(glob.glob(os.path.join(input_path, ext)))
        print(f"Stage4-only: Found {len(files)} images in {input_path}")
        for file_path in tqdm(files, desc="Stage4-only"):
            pipeline.process_path(file_path, save_outputs=True)
    else:
        if not os.path.exists(input_path):
            print(f"'{input_path}' does not exist")
            return
        pipeline.process_path(input_path, save_outputs=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Skin AI Pipeline")
    parser.add_argument("--mode", choices=["full", "stage4"], default="full", help="full: run all stages; stage4: run loader->detect->segment->geometry only")
    parser.add_argument("--input", default="data/raw", help="Input file or directory")
    parser.add_argument("--output", default="data/processed", help="Output root for processed regions")
    args = parser.parse_args()

    if args.mode == "stage4":
        process_stage4_only(args.input, output_root=args.output)
        print(f"Stage4-only complete. Results in: {args.output}")
    else:
        input_dir = args.input
        pipeline = SkinProcessingPipeline(output_root=args.output)
        if os.path.exists(input_dir) and os.listdir(input_dir):
            pipeline.process_directory(input_dir)
            print("Pipeline complete.")
            print(f"Check the results in: {pipeline.output_root}")
        else:
            print(f"'{input_dir}' is empty or does not exist. Put some selfies there!")
