# API Integration Guide

## Overview

FaceAI Analyzer is a frontend-only application that communicates with a backend API for image analysis. This guide explains how to integrate your backend.

## API Endpoint Specification

### Analyze Face Image

**Endpoint**: `POST /analyze`

**Base URL**: Configured in `.env` (default: `http://localhost:8000`)

**Full URL**: `http://localhost:8000/analyze`

### Request

**Content-Type**: `multipart/form-data`

**Parameters**:
- `image` (File, required): The face image to analyze
  - Accepted formats: JPEG, PNG, JPG
  - Max size: 10MB

**Example cURL**:
```bash
curl -X POST \
  http://localhost:8000/analyze \
  -F "image=@/path/to/image.jpg"
```

**Example JavaScript/Axios** (as used in app):
```typescript
const formData = new FormData();
formData.append('image', imageFile);

const response = await axios.post('/analyze', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

### Response

**Status Code**: 200 (Success) or appropriate error code

**Content-Type**: `application/json`

**Response Body**:
```json
{
  "regions_detected": 42,
  "processed": 40,
  "confidence": 0.94,
  "severity": "Medium",
  "face_image": "iVBORw0KGgoAAAANSUhEUgAAAAUA...",
  "heatmap": "iVBORw0KGgoAAAANSUhEUgAAAAUA..."
}
```

**Field Descriptions**:

| Field | Type | Description |
|-------|------|-------------|
| `regions_detected` | integer | Total number of facial regions identified |
| `processed` | integer | Number of regions successfully processed |
| `confidence` | number | Analysis confidence score (0.0 - 1.0) |
| `severity` | string | Severity level: "Low", "Medium", or "High" |
| `face_image` | string | Base64-encoded PNG of detected face with grid overlay |
| `heatmap` | string | Base64-encoded PNG of heatmap visualization |

**Example Response**:
```json
{
  "regions_detected": 42,
  "processed": 40,
  "confidence": 0.9432,
  "severity": "Medium",
  "face_image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "heatmap": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
}
```

## Error Handling

### Error Responses

**400 Bad Request**
```json
{
  "error": "No image provided",
  "message": "Please upload an image file"
}
```

**413 Payload Too Large**
```json
{
  "error": "File too large",
  "message": "File size must be less than 10MB"
}
```

**422 Unprocessable Entity** (No face detected)
```json
{
  "error": "No face detected",
  "message": "Please upload a clear frontal face image"
}
```

**500 Internal Server Error**
```json
{
  "error": "Processing failed",
  "message": "An error occurred while processing the image"
}
```

### Frontend Error Handling

The app handles errors gracefully:

```typescript
try {
  const results = await analyzeImage(imageFile);
  // Display results
} catch (error) {
  // Show error message to user
  const errorMessage = error.response?.data?.message || 'Analysis failed';
}
```

## CORS Configuration

The backend should enable CORS for the frontend URL:

**For development** (localhost:5173):
```
Access-Control-Allow-Origin: http://localhost:5173
```

**For production** (your domain):
```
Access-Control-Allow-Origin: https://yourdomain.com
```

**Required Headers**:
```
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

### Example CORS Middleware (Node.js/Express)

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
```

## Base64 Image Encoding

The API must return images as Base64 strings. These are displayed in the frontend as:

```javascript
<img src={`data:image/png;base64,${base64String}`} />
```

### Python Example (generating Base64)
```python
import base64
from PIL import Image
from io import BytesIO

# Your image bytes
image_bytes = your_image.tobytes()

# Convert to PNG
img = Image.fromarray(image_bytes)
buffer = BytesIO()
img.save(buffer, format='PNG')

# Encode as Base64
base64_string = base64.b64encode(buffer.getvalue()).decode('utf-8')
```

## Configuration

### Frontend Configuration

Set the API base URL in `.env`:

```bash
VITE_API_URL=http://localhost:8000
```

Or in `src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

### Timeout Configuration

Default timeout is handled by Axios. To customize, edit `src/services/api.ts`:

```typescript
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,  // 30 seconds
});
```

## Testing the Integration

### 1. Test with cURL

```bash
curl -X POST \
  http://localhost:8000/analyze \
  -F "image=@test-image.jpg"
```

### 2. Test with Python

```python
import requests

with open('test-image.jpg', 'rb') as f:
    files = {'image': f}
    response = requests.post('http://localhost:8000/analyze', files=files)
    print(response.json())
```

### 3. Test with Frontend

1. Start the dev server: `npm run dev`
2. Open http://localhost:5173
3. Upload/capture an image
4. Click "Analyze Image"
5. Check browser console for request/response details

## Performance Considerations

- **File Upload**: Validate file size before sending (< 10MB recommended)
- **Processing Time**: Estimated 2-5 seconds for analysis
- **Timeout**: Set server timeout to at least 30 seconds
- **Base64 Encoding**: Produces ~33% larger payload than binary

## Security Considerations

- **HTTPS**: Use HTTPS in production
- **Authentication**: Consider adding JWT/API key authentication
- **File Validation**: Validate file type and size on both frontend and backend
- **CORS**: Restrict origins to your frontend domain
- **Rate Limiting**: Implement rate limiting on the API

## Troubleshooting

### "Failed to analyze image" Error

**Issue**: Connection to backend fails
**Solution**: 
- Verify backend is running
- Check `.env` file has correct `VITE_API_URL`
- Open DevTools → Network tab to see request details

### "Cannot apply unknown utility class" Build Error

**Issue**: TailwindCSS compilation fails
**Solution**:
```bash
npm run build
# If error persists:
rm -rf node_modules
npm install
npm run build
```

### Base64 Images Not Displaying

**Issue**: Images show broken image icon
**Solution**:
- Verify Base64 string is valid
- Check it's properly formatted: `data:image/png;base64,{string}`
- Ensure no newlines in Base64 string

### Camera Permission Denied

**Issue**: "Unable to access camera" message
**Solution**:
- Grant camera permissions in browser settings
- Use HTTPS (camera requires secure context in production)
- Check browser support for MediaDevices API

## Example Backend Implementation (Python/Flask)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from io import BytesIO
from PIL import Image
import your_analysis_model

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173'])

@app.route('/analyze', methods=['POST', 'OPTIONS'])
def analyze():
    if request.method == 'OPTIONS':
        return '', 204
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    
    # Validate file
    if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
        return jsonify({'error': 'Invalid file type'}), 400
    
    if file.content_length > 10 * 1024 * 1024:
        return jsonify({'error': 'File too large'}), 413
    
    try:
        # Load and process image
        img = Image.open(file.stream)
        
        # Your analysis logic here
        results = your_analysis_model.analyze(img)
        
        # Convert outputs to Base64
        face_buffer = BytesIO()
        results['face_image'].save(face_buffer, format='PNG')
        face_b64 = base64.b64encode(face_buffer.getvalue()).decode()
        
        heatmap_buffer = BytesIO()
        results['heatmap'].save(heatmap_buffer, format='PNG')
        heatmap_b64 = base64.b64encode(heatmap_buffer.getvalue()).decode()
        
        return jsonify({
            'regions_detected': results['regions_count'],
            'processed': results['processed_count'],
            'confidence': results['confidence'],
            'severity': results['severity'],
            'face_image': face_b64,
            'heatmap': heatmap_b64
        })
    
    except Exception as e:
        return jsonify({'error': 'Processing failed', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)
```

## Next Steps

1. Implement backend API following this specification
2. Set `VITE_API_URL` in `.env` to your backend URL
3. Test the integration using the frontend
4. Deploy both frontend and backend

---

For more information, see [README.md](README.md) and [QUICKSTART.md](QUICKSTART.md)
