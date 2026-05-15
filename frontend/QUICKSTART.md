# FaceAI Analyzer - Quick Start Guide

## 🚀 Getting Started

### Step 1: Setup Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your backend API URL (optional)
# Default is http://localhost:8000
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Development Server

```bash
npm run dev
```

The application will be available at **http://localhost:5173**

## 📋 Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linting
npm run lint
```

## 🔌 Backend Setup

Make sure your backend API is running and accessible at the configured URL.

The application expects the following endpoint:

**POST `/analyze`**
- Accepts: FormData with image file
- Returns: JSON with analysis results

Response format expected:
```json
{
  "regions_detected": 42,
  "processed": 40,
  "confidence": 0.94,
  "severity": "Medium",
  "face_image": "base64_string",
  "heatmap": "base64_string"
}
```

## 🧪 Testing the Application

1. Open http://localhost:5173 in your browser
2. Click "Start Analysis" or scroll down
3. Choose upload or camera mode
4. Select/capture an image
5. Click "Analyze Image"
6. View results dashboard
7. Download analysis report

## 🐛 Common Issues

### API Connection Failed
- Ensure backend is running on configured URL
- Check CORS settings on backend
- Verify `.env` has correct `VITE_API_URL`

### Camera Not Working
- Allow camera permissions when prompted
- Camera only works on HTTPS (production)
- Try a different browser

### Build Fails
- Delete `node_modules` and run `npm install`
- Clear npm cache: `npm cache clean --force`
- Check Node.js version: `node --version` (should be 18+)

## 📁 Project Structure

```
src/
├── components/       # React components
├── services/         # API client
├── types/           # TypeScript types
├── App.tsx          # Main app component
├── main.tsx         # React entry point
└── index.css        # Global styles
```

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: '#2563EB',        // Blue
  secondary: '#22C55E',      // Green
  accent: '#F97316',         // Orange
  background: '#F8FAFC',     // Light
  card: '#FFFFFF',           // White
}
```

### Modify API Endpoint

Edit `src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'YOUR_URL';
```

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Framer Motion Documentation](https://www.framer.com/motion/)

## ✨ Key Features

✅ Upload & camera capture  
✅ Responsive design  
✅ Real-time preview  
✅ Beautiful animations  
✅ Error handling  
✅ Report download  
✅ Mobile optimized  

---

**Happy analyzing! 🎉**
