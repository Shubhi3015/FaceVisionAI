import os
import base64

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import io
import numpy as np
from PIL import Image, ImageOps
import torch
from torchvision import transforms

from pipeline.stage_04_geometry import RegionExtractionPipeline
from inference.ensemble_predict import predict_issue
from recommendation import recommend_product


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

app = FastAPI(title="FaceVision AI – Skin Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UI_BUILD_DIR = os.environ.get("UI_BUILD_DIR", os.path.join(BASE_DIR, "dist"))

# Initialize once (heavy models)
region_pipeline = RegionExtractionPipeline(output_root="data/processed")


# ------------------------------------------------------------------ #
#  Shared analysis logic (used by both /predict and /analyze)         #
# ------------------------------------------------------------------ #
def _run_analysis(image_np: np.ndarray) -> dict:
    """
    Core analysis pipeline.
    Returns a dict with:
      - regions: list of per-region results
      - overall: aggregated result
    """
    regions = region_pipeline.process_image(image_np, name="input", save_outputs=False)
    if not regions:
        raise HTTPException(status_code=400, detail="No valid face/regions detected.")

    display_names = {
        "forehead": "Forehead",
        "left_cheek": "Left Cheek",
        "right_cheek": "Right Cheek",
        "chin": "Chin",
    }

    overall_scores = {"Acne": 0.0, "Redness": 0.0, "Pigmentation": 0.0}
    issue_count = {"Acne": 0, "Redness": 0, "Pigmentation": 0}
    region_results = []

    for name, region_data in regions.items():
        region = region_data["image"]
        display_name = display_names.get(name, name)

        region_tensor = transform(Image.fromarray(region)).unsqueeze(0).to(device)  # type: ignore
        issue, percent, _ = predict_issue(region_tensor)
        product, severity = recommend_product(issue, percent)

        # Encode region image as base64
        region_pil = Image.fromarray(region).convert("RGB")
        buf = io.BytesIO()
        region_pil.save(buf, format="PNG")
        region_b64 = base64.b64encode(buf.getvalue()).decode("ascii")

        region_results.append({
            "region": name,
            "display_name": display_name,
            "issue": issue,
            "confidence": percent,
            "severity": severity,
            "recommendation": product,
            "region_image": region_b64,
        })

        if issue != "Normal":
            overall_scores[issue] += percent
            issue_count[issue] += 1

    total_issues = sum(issue_count.values())

    if total_issues > 0:
        avg_scores = {
            k: (overall_scores[k] / issue_count[k]) if issue_count[k] > 0 else 0.0
            for k in overall_scores
        }
        dominant_issue = max(avg_scores, key=avg_scores.get)  # type: ignore
        overall_product, overall_severity = recommend_product(
            dominant_issue, avg_scores[dominant_issue]
        )
        overall = {
            "primary_concern": dominant_issue,
            "average_score": round(avg_scores[dominant_issue], 2),
            "per_issue_avg": {k: round(v, 2) for k, v in avg_scores.items()},
            "severity": overall_severity,
            "recommendation": overall_product,
        }
    else:
        avg_scores = {"Acne": 0.0, "Redness": 0.0, "Pigmentation": 0.0}
        overall = {
            "primary_concern": "Normal",
            "average_score": 0.0,
            "per_issue_avg": avg_scores,
            "severity": "No Significant Issue",
            "recommendation": None,
        }

    return {"regions": region_results, "overall": overall}


def _build_composite_image(image_np: np.ndarray) -> str:
    """Return the original face image as a base64 PNG string."""
    pil = Image.fromarray(image_np).convert("RGB")
    buf = io.BytesIO()
    pil.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("ascii")


# ------------------------------------------------------------------ #
#  /health                                                             #
# ------------------------------------------------------------------ #
@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    if os.path.isdir(UI_BUILD_DIR):
        return FileResponse(os.path.join(UI_BUILD_DIR, "index.html"))
    return {"message": "FaceVision AI – Skin Analyzer API", "docs": "/docs", "health": "/health"}


# ------------------------------------------------------------------ #
#  /predict  – original detailed endpoint (kept for Streamlit / tests) #
# ------------------------------------------------------------------ #
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Returns full per-region breakdown.
    Used by the Streamlit app and direct API consumers.
    """
    if file.content_type is None or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    data = await file.read()
    try:
        image = Image.open(io.BytesIO(data))
        image = ImageOps.exif_transpose(image).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid image file.") from exc

    image_np = np.array(image)
    return _run_analysis(image_np)


# ------------------------------------------------------------------ #
#  /analyze  – React frontend endpoint                                #
#                                                                     #
#  Contract (matches src/types/index.ts AnalysisResult):             #
#  {                                                                  #
#    regions_detected: number,    // total regions found              #
#    processed: number,           // regions with detected issues     #
#    confidence: number,          // 0–1 overall confidence           #
#    severity: "Low"|"Medium"|"High",                                 #
#    face_image: string,          // base64 PNG of original face      #
#    heatmap: string,             // base64 PNG – first affected      #
#                                 //   region image (or same as face) #
#    regions: RegionResult[],     // per-region detail array          #
#    overall: OverallResult,      // aggregate result                 #
#  }                                                                  #
# ------------------------------------------------------------------ #
@app.post("/analyze")
async def analyze(image: UploadFile = File(...)):
    """
    React frontend endpoint.
    Accepts field name 'image' (FormData), returns AnalysisResult shape.
    """
    if image.content_type is None or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    data = await image.read()
    try:
        pil_image = Image.open(io.BytesIO(data))
        pil_image = ImageOps.exif_transpose(pil_image).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid image file.") from exc

    image_np = np.array(pil_image)
    result = _run_analysis(image_np)

    regions: list = result["regions"]
    overall: dict = result["overall"]

    # ---- Map internal severity string → frontend Low/Medium/High ----
    severity_raw: str = overall.get("severity", "No Significant Issue")
    severity_map = {
        "No Significant Issue": "Low",
        "Mild": "Low",
        "Moderate": "Medium",
        "Severe": "High",
    }
    frontend_severity = severity_map.get(severity_raw, "Low")

    # ---- Aggregate confidence: average of non-Normal region confidences ----
    non_normal = [r for r in regions if r["issue"] != "Normal"]
    if non_normal:
        avg_confidence = sum(r["confidence"] for r in non_normal) / len(non_normal) / 100.0
    else:
        avg_confidence = 0.0

    # ---- face_image: full original frame ----
    face_b64 = _build_composite_image(image_np)

    # ---- heatmap: first affected region image, or face if all normal ----
    if non_normal:
        heatmap_b64 = non_normal[0]["region_image"]
    else:
        heatmap_b64 = face_b64

    return {
        # Frontend AnalysisResult fields
        "regions_detected": len(regions),
        "processed": len(non_normal),
        "confidence": round(avg_confidence, 4),
        "severity": frontend_severity,
        "face_image": face_b64,
        "heatmap": heatmap_b64,
        # Extended fields (frontend uses these for per-region detail)
        "regions": regions,
        "overall": overall,
    }


# ------------------------------------------------------------------ #
#  UI (Production SPA)                                                #
# ------------------------------------------------------------------ #
if os.path.isdir(UI_BUILD_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(UI_BUILD_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = os.path.join(UI_BUILD_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(UI_BUILD_DIR, "index.html"))
