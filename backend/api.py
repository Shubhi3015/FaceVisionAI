import os
import base64
from contextlib import asynccontextmanager
from typing import Annotated

import io
import numpy as np
import torch
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image, ImageOps
from sqlalchemy.orm import Session
from torchvision import transforms

from database import get_db, init_db
from auth import get_optional_user
from auth_routes import router as auth_router
from inference.ensemble_predict import predict_issue
from models import User
from pipeline.stage_04_geometry import RegionExtractionPipeline
from recommendation import recommend_product
from skincare_chat import (
    SkincareChatRequest,
    SkincareChatResponse,
    generate_skincare_reply,
    sanitize_reply,
)
from user_api import router as user_router, save_user_scan


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ]
)

app = FastAPI(title="FaceVision AI – Skin Analyzer API", lifespan=lifespan)

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

# Initialize once (heavy models) - LAZY to avoid high RAM usage on container startup
region_pipeline: RegionExtractionPipeline | None = None


def get_region_pipeline() -> RegionExtractionPipeline:
    global region_pipeline
    if region_pipeline is None:
        region_pipeline = RegionExtractionPipeline(output_root="data/processed")
    return region_pipeline


app.include_router(auth_router)
app.include_router(user_router)


def _run_analysis(image_np: np.ndarray) -> dict:
    """Core analysis pipeline."""
    regions = get_region_pipeline().process_image(image_np, name="input", save_outputs=False)

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
    region_results: list[dict] = []

    for name, region_data in regions.items():
        region = region_data["image"]
        display_name = display_names.get(name, name)

        region_tensor = transform(Image.fromarray(region)).unsqueeze(0).to(device)  # type: ignore
        issue, percent, _ = predict_issue(region_tensor)
        product, severity = recommend_product(issue, percent)

        region_pil = Image.fromarray(region).convert("RGB")
        buf = io.BytesIO()
        region_pil.save(buf, format="PNG")
        region_b64 = base64.b64encode(buf.getvalue()).decode("ascii")

        region_results.append(
            {
                "region": name,
                "display_name": display_name,
                "issue": issue,
                "confidence": percent,
                "severity": severity,
                "recommendation": product,
                "region_image": region_b64,
            }
        )

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
        overall_product, overall_severity = recommend_product(dominant_issue, avg_scores[dominant_issue])
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


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/skincare-chat", response_model=SkincareChatResponse)
def skincare_chat(body: SkincareChatRequest):
    reply = sanitize_reply(generate_skincare_reply(body.messages))
    return SkincareChatResponse(reply=reply)


@app.get("/")
def root():
    if os.path.isdir(UI_BUILD_DIR):
        return FileResponse(os.path.join(UI_BUILD_DIR, "index.html"))
    return {
        "message": "FaceVision AI – Skin Analyzer API",
        "docs": "/docs",
        "health": "/health",
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Returns full per-region breakdown."""
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


@app.post("/analyze")
async def analyze(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_optional_user)],
    image: UploadFile = File(...),
):
    """React frontend endpoint."""
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

    severity_raw: str = overall.get("severity", "No Significant Issue")
    severity_map = {
        "No Significant Issue": "Low",
        "Mild": "Low",
        "Moderate": "Medium",
        "Severe": "High",
    }
    frontend_severity = severity_map.get(severity_raw, "Low")

    non_normal = [r for r in regions if r["issue"] != "Normal"]
    if non_normal:
        avg_confidence = sum(r["confidence"] for r in non_normal) / len(non_normal) / 100.0
    else:
        avg_confidence = 0.0

    face_b64 = _build_composite_image(image_np)
    heatmap_b64 = non_normal[0]["region_image"] if non_normal else face_b64

    response = {
        "regions_detected": len(regions),
        "processed": len(non_normal),
        "confidence": round(avg_confidence, 4),
        "severity": frontend_severity,
        "face_image": face_b64,
        "heatmap": heatmap_b64,
        "regions": regions,
        "overall": overall,
    }

    if current_user is not None:
        scan = save_user_scan(db, current_user.id, response)
        response["scan_id"] = scan.id

    return response


if os.path.isdir(UI_BUILD_DIR):
    app.mount(
        "/assets",
        StaticFiles(directory=os.path.join(UI_BUILD_DIR, "assets")),
        name="assets",
    )

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = os.path.join(UI_BUILD_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(UI_BUILD_DIR, "index.html"))

