import gc
from pathlib import Path

import torch
import torch.nn as nn
from torchvision.models import convnext_tiny
from torchvision.models import efficientnet_b4
from inference.thresholds import THRESHOLD

ROOT_DIR = Path(__file__).resolve().parent.parent
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
REDNESS_MODEL_PATH = ROOT_DIR / "models" / "redness_model.pth"
ACNE_PIG_MODEL_PATH = ROOT_DIR / "models" / "acne_pigmentation_model.pth"
torch.set_num_threads(1)
torch.set_num_interop_threads(1)


class ModelUnavailableError(RuntimeError):
    """Raised when trained model weights are not available in the deployment."""


# ---------------- REDNESS MODEL (ConvNeXt) ----------------
def load_redness_model(path):
    model = convnext_tiny(weights=None)
    model.classifier[2] = nn.Linear(model.classifier[2].in_features, 2)  # type: ignore
    model.load_state_dict(torch.load(path, map_location=device))
    model.to(device)
    model.eval()
    return model


# ---------------- ACNE vs PIG MODEL (EfficientNet-B4) ----------------
def load_acne_pig_model(path):
    model = efficientnet_b4(weights=None)

    model.classifier[1] = nn.Linear(
        model.classifier[1].in_features, # type: ignore
        2
    )

    model.load_state_dict(torch.load(path, map_location=device))
    model.to(device)
    model.eval()
    return model


def ensure_model_files():
    missing = [
        str(path.relative_to(ROOT_DIR))
        for path in (REDNESS_MODEL_PATH, ACNE_PIG_MODEL_PATH)
        if not path.exists()
    ]
    if missing:
        raise ModelUnavailableError(
            "Model weights are missing from this deployment: " + ", ".join(missing)
        )


def release_model(model):
    del model
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()


# ---------------- Prediction Function ----------------
def predict_issue(region_tensor):
    ensure_model_files()

    # -------- Stage 1: Redness --------
    redness_model = load_redness_model(str(REDNESS_MODEL_PATH))
    try:
        with torch.inference_mode():
            output = redness_model(region_tensor)
            probs = torch.softmax(output, dim=1)
            redness_prob = probs[0][1].item()

        if redness_prob > THRESHOLD:
            return "Redness", round(redness_prob * 100), None
    finally:
        release_model(redness_model)

    # -------- Stage 2: Acne vs Pigmentation --------
    acne_pig_model = load_acne_pig_model(str(ACNE_PIG_MODEL_PATH))
    try:
        with torch.inference_mode():
            output = acne_pig_model(region_tensor)
            probs = torch.softmax(output, dim=1)

            acne_prob = probs[0][0].item()
            pig_prob = probs[0][1].item()
    finally:
        release_model(acne_pig_model)

    max_prob = max(acne_prob, pig_prob)

    if max_prob < 0.4:
        return "Normal", 0, None

    if acne_prob > pig_prob:
        return "Acne", round(acne_prob * 100), None
    else:
        return "Pigmentation", round(pig_prob * 100), None
