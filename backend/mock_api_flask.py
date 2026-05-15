from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import time

app = Flask(__name__)
CORS(app)

# Mock response data
MOCK_RESPONSE = {
    "regions_detected": 4,
    "processed": 2,
    "confidence": 0.75,
    "severity": "Medium",
    "face_image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",  # 1x1 transparent PNG
    "heatmap": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "regions": [
        {
            "region": "forehead",
            "display_name": "Forehead",
            "issue": "Acne",
            "confidence": 85.5,
            "severity": "Moderate",
            "recommendation": "Use salicylic acid cleanser",
            "region_image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        },
        {
            "region": "left_cheek",
            "display_name": "Left Cheek",
            "issue": "Normal",
            "confidence": 95.2,
            "severity": "No Significant Issue",
            "recommendation": None,
            "region_image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        },
        {
            "region": "right_cheek",
            "display_name": "Right Cheek",
            "issue": "Pigmentation",
            "confidence": 72.3,
            "severity": "Mild",
            "recommendation": "Apply vitamin C serum",
            "region_image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        },
        {
            "region": "chin",
            "display_name": "Chin",
            "issue": "Normal",
            "confidence": 88.9,
            "severity": "No Significant Issue",
            "recommendation": None,
            "region_image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        }
    ],
    "overall": {
        "primary_concern": "Acne",
        "average_score": 85.5,
        "per_issue_avg": {
            "Acne": 85.5,
            "Pigmentation": 72.3,
            "Redness": 0.0
        },
        "severity": "Moderate",
        "recommendation": "Use salicylic acid cleanser"
    }
}

@app.route("/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/analyze", methods=["POST"])
def analyze():
    # Simulate processing time
    time.sleep(2)

    return jsonify(MOCK_RESPONSE)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)