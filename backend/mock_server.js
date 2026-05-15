const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = 8000;

// Enable CORS
app.use(cors());

// Mock response data
const MOCK_RESPONSE = {
  regions_detected: 4,
  processed: 2,
  confidence: 0.75,
  severity: "Medium",
  face_image: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  heatmap: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  regions: [
    {
      region: "forehead",
      display_name: "Forehead",
      issue: "Acne",
      confidence: 85.5,
      severity: "Moderate",
      recommendation: "Use salicylic acid cleanser",
      region_image: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    },
    {
      region: "left_cheek",
      display_name: "Left Cheek",
      issue: "Normal",
      confidence: 95.2,
      severity: "No Significant Issue",
      recommendation: null,
      region_image: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    },
    {
      region: "right_cheek",
      display_name: "Right Cheek",
      issue: "Pigmentation",
      confidence: 72.3,
      severity: "Mild",
      recommendation: "Apply vitamin C serum",
      region_image: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    },
    {
      region: "chin",
      display_name: "Chin",
      issue: "Normal",
      confidence: 88.9,
      severity: "No Significant Issue",
      recommendation: null,
      region_image: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    }
  ],
  overall: {
    primary_concern: "Acne",
    average_score: 85.5,
    per_issue_avg: {
      Acne: 85.5,
      Pigmentation: 72.3,
      Redness: 0.0
    },
    severity: "Moderate",
    recommendation: "Use salicylic acid cleanser"
  }
};

// Configure multer for file uploads
const upload = multer();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/analyze', upload.single('image'), (req, res) => {
  // Simulate processing time
  setTimeout(() => {
    res.json(MOCK_RESPONSE);
  }, 2000);
});

app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
});