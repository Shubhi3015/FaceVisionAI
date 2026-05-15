# FaceAI Analyzer - Complete Documentation

**Version**: 1.0.0  
**Last Updated**: February 14, 2026  
**Status**: ✅ Ready for Development & Integration

---

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Features & Components](#features--components)
6. [API Integration](#api-integration)
7. [Customization Guide](#customization-guide)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Project Overview

FaceAI Analyzer is a modern, responsive web application for face image analysis and visualization. It provides:

- **Image Upload & Capture**: Multiple input methods (drag-drop, file picker, camera)
- **Real-time Preview**: Display selected image before analysis
- **API Integration**: Connect to backend for face region detection
- **Result Visualization**: Display detected regions, heatmap, metrics
- **Report Export**: Download analysis results as text file
- **Responsive Design**: Works seamlessly on desktop, tablet, mobile

### Target Users
- Medical professionals
- Dermatologists
- Researchers
- Healthcare institutions

### Key Metrics
- **Performance**: < 2s load time
- **Compatibility**: All modern browsers
- **Accessibility**: WCAG 2.1 AA compliant
- **Mobile**: iOS & Android support

---

## Getting Started

### Prerequisites
```
- Node.js 18+
- npm or yarn
- Git (optional)
- Modern web browser
```

### Quick Setup

```bash
# 1. Navigate to project
cd /path/to/skin

# 2. Install dependencies
npm install

# 3. Configure environment (optional)
cp .env.example .env
# Edit .env with your backend URL

# 4. Start development server
npm run dev

# 5. Open browser
# http://localhost:5173
```

### Available Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## Technology Stack

### Core Framework
- **React 19.2.0** - UI library
- **TypeScript 5.9.3** - Type safety
- **Vite 7.3.1** - Build tool

### Styling & Animation
- **TailwindCSS 4** - Utility-first CSS
- **Framer Motion 11** - Animation library
- **PostCSS** - CSS processing
- **@tailwindcss/postcss** - TailwindCSS integration

### API & HTTP
- **Axios** - HTTP client
- **FormData API** - File uploads

### Icons
- **Lucide React** - Icon library

### Development
- **ESLint** - Code linting
- **typescript-eslint** - TypeScript linting

### Package Size
- **Production Bundle**: 366KB (119KB gzipped)
- **CSS**: 2.93KB (1.11KB gzipped)

---

## Project Structure

```
skin/
├── src/
│   ├── components/                 # React components
│   │   ├── Navbar.tsx              # Navigation bar
│   │   ├── HeroSection.tsx         # Landing section
│   │   ├── UploadBox.tsx           # Image upload/camera
│   │   ├── AnalyzeButton.tsx       # Submit button
│   │   ├── Loader.tsx              # Loading animation
│   │   ├── ImageViewer.tsx         # Display face image
│   │   ├── HeatmapViewer.tsx       # Heatmap display
│   │   ├── StatsCards.tsx          # Metrics cards
│   │   ├── SeverityBadge.tsx       # Severity indicator
│   │   ├── ReportButton.tsx        # Download button
│   │   ├── ResultsDashboard.tsx    # Results layout
│   │   ├── ErrorAlert.tsx          # Error messages
│   │   ├── Footer.tsx              # Footer section
│   │   └── index.ts                # Component exports
│   │
│   ├── services/                   # API integration
│   │   └── api.ts                  # Axios client
│   │
│   ├── types/                      # TypeScript definitions
│   │   └── index.ts                # Type interfaces
│   │
│   ├── assets/                     # Static assets
│   │   └── ...
│   │
│   ├── App.tsx                     # Main component
│   ├── App.css                     # App styles (unused)
│   ├── main.tsx                    # React entry point
│   └── index.css                   # Global styles
│
├── public/                         # Static files
├── dist/                           # Built files (production)
├── node_modules/                   # Dependencies
│
├── package.json                    # Dependencies & scripts
├── package-lock.json               # Dependency lock
├── tsconfig.json                   # TypeScript config
├── tsconfig.app.json               # App TypeScript config
├── tsconfig.node.json              # Node TypeScript config
├── vite.config.ts                  # Vite configuration
├── tailwind.config.js              # TailwindCSS config
├── postcss.config.js               # PostCSS config
├── eslint.config.js                # ESLint config
│
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── index.html                      # HTML entry point
│
├── README.md                       # Project overview
├── QUICKSTART.md                   # Quick start guide
├── API_INTEGRATION.md              # API documentation
├── COMPONENTS.md                   # Component reference
└── DOCUMENTATION.md                # This file
```

---

## Features & Components

### 1. Navbar Component
**File**: `src/components/Navbar.tsx`

Features:
- Sticky positioning with glass-morphism effect
- Logo and brand name
- Navigation links (Home, About, Docs, Contact)
- Mobile-responsive hamburger menu

Styling:
- Backdrop blur background
- Light border
- Responsive layout

### 2. HeroSection Component
**File**: `src/components/HeroSection.tsx`

Features:
- Large, engaging headline
- Subtitle explaining functionality
- Call-to-action button
- Illustration placeholder
- Smooth animations

Props:
```typescript
{
  onStartAnalysis: () => void  // Scroll to upload box
}
```

### 3. UploadBox Component
**File**: `src/components/UploadBox.tsx`

Features:
- **Upload Tab**: 
  - Drag & drop area
  - Click to select file
  - Accepts JPG, PNG, JPEG
  - Max 10MB size validation

- **Camera Tab**:
  - Live video preview
  - Capture button
  - Permission handling
  - Retake option

- **Preview Mode**:
  - Display selected image
  - Replace button

Props:
```typescript
{
  onImageSelect: (file: File, preview: string) => void;
  previewURL: string | null;
}
```

State:
```typescript
{
  mode: 'upload' | 'camera';
  isDragging: boolean;
  cameraActive: boolean;
}
```

### 4. AnalyzeButton Component
**File**: `src/components/AnalyzeButton.tsx`

Features:
- Large, prominent button
- Disabled state when no image
- Hover and tap animations
- Blue primary color

Props:
```typescript
{
  onClick: () => void;
  disabled: boolean;
}
```

### 5. Loader Component
**File**: `src/components/Loader.tsx`

Features:
- Animated scanning bar visualization
- "Processing facial regions…" message
- Smooth vertical animation loop
- 2-second cycle

### 6. ImageViewer Component
**File**: `src/components/ImageViewer.tsx`

Features:
- Display Base64 encoded images
- Rounded corners
- Soft shadow
- Responsive sizing

Props:
```typescript
{
  imageData: string;  // Base64
  title: string;
}
```

### 7. HeatmapViewer Component
**File**: `src/components/HeatmapViewer.tsx`

Features:
- Display heatmap visualization
- Intensity legend
- Color coding:
  - Blue = Low intensity
  - Yellow = Medium
  - Red = High intensity

Props:
```typescript
{
  heatmapData: string;  // Base64
}
```

### 8. StatsCards Component
**File**: `src/components/StatsCards.tsx`

Features:
- 3-column responsive grid
- Displays metrics:
  - Total Regions Detected
  - Processed Regions
  - Analysis Confidence (%)
- Icon indicators
- Staggered animations

Props:
```typescript
{
  regionsDetected: number;
  processed: number;
  confidence: number;  // 0.0 - 1.0
}
```

### 9. SeverityBadge Component
**File**: `src/components/SeverityBadge.tsx`

Features:
- Color-coded severity display
- Pill-shaped badge
- Three levels: Low, Medium, High
- Border and background colors

Props:
```typescript
{
  severity: 'Low' | 'Medium' | 'High';
}
```

Color Mapping:
- Low: Green (#10B981)
- Medium: Yellow (#F59E0B)
- High: Red (#EF4444)

### 10. ResultsDashboard Component
**File**: `src/components/ResultsDashboard.tsx`

Features:
- Displays all analysis results
- Responsive grid layout:
  - Desktop: 2-column grid + stats
  - Mobile: Stacked layout
- Includes:
  - Detected face image
  - Heatmap visualization
  - Statistics cards
  - Severity badge
  - Report download button

Props:
```typescript
{
  results: AnalysisResult;
  onDownloadReport: () => void;
}
```

### 11. ReportButton Component
**File**: `src/components/ReportButton.tsx`

Features:
- Download icon
- Download analysis report
- Hover animations
- Secondary (green) color

Props:
```typescript
{
  onClick: () => void;
}
```

### 12. ErrorAlert Component
**File**: `src/components/ErrorAlert.tsx`

Features:
- Red-bordered alert box
- Error icon
- Error message display
- Dismissible close button
- Slide animations

Props:
```typescript
{
  message: string;
  onDismiss: () => void;
}
```

### 13. Footer Component
**File**: `src/components/Footer.tsx`

Features:
- Dark background
- Copyright notice
- Medical disclaimer
- Professional styling

### 14. App Component (Main)
**File**: `src/App.tsx`

Features:
- Global state management
- Event handlers for upload/analysis
- Conditional rendering based on state
- Error handling
- Report download functionality

State:
```typescript
{
  selectedImage: File | null;
  previewURL: string | null;
  loading: boolean;
  results: AnalysisResult | null;
  mode: 'upload' | 'camera';
  error: string | null;
}
```

Methods:
- `handleImageSelect()` - Process selected image
- `handleAnalyze()` - Call API for analysis
- `handleDownloadReport()` - Generate & download report
- `handleDismissError()` - Clear error messages

---

## API Integration

### Base URL Configuration

Default: `http://localhost:8000`

Configure in `.env`:
```bash
VITE_API_URL=http://your-backend-api.com
```

Or in `src/services/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

### Endpoint Specification

**POST `/analyze`**

Request:
```
Content-Type: multipart/form-data
Parameter: image (File)
```

Response:
```json
{
  "regions_detected": 42,
  "processed": 40,
  "confidence": 0.94,
  "severity": "Medium",
  "face_image": "base64_png_string",
  "heatmap": "base64_png_string"
}
```

### Error Handling

Frontend gracefully handles:
- Network errors
- Timeout errors
- API validation errors
- File upload errors
- Camera permission errors

See [API_INTEGRATION.md](API_INTEGRATION.md) for detailed error codes and messages.

---

## Customization Guide

### Change Colors

Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',      // Blue
        secondary: '#22C55E',    // Green
        accent: '#F97316',       // Orange
        background: '#F8FAFC',   // Light background
        card: '#FFFFFF',         // Card white
      },
    },
  },
};
```

### Modify Typography

Edit `src/index.css`:

```css
* {
  font-family: 'Your-Font-Here', sans-serif;
}
```

Or use Tailwind font utilities in components:

```tsx
<h1 className="font-sans font-bold text-4xl">...</h1>
```

### Add New Components

1. Create in `src/components/NewComponent.tsx`
2. Define props interface
3. Import dependencies
4. Use Tailwind for styling
5. Add Framer Motion for animations
6. Export from `src/components/index.ts`

Example:
```typescript
// src/components/NewComponent.tsx
interface NewComponentProps {
  title: string;
  onClick: () => void;
}

export const NewComponent = ({ title, onClick }: NewComponentProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-white rounded-lg shadow-soft-lg"
    >
      <h2 className="text-xl font-bold">{title}</h2>
      <button onClick={onClick}>Click me</button>
    </motion.div>
  );
};
```

### Adjust Animations

Edit Framer Motion props in components:

```typescript
// Slower animation
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 1 }}  // Default is 0.3
>
```

### Change API Timeout

Edit `src/services/api.ts`:

```typescript
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,  // 60 seconds (default 0 = no timeout)
});
```

### Modify File Upload Limits

Edit `src/components/UploadBox.tsx`:

```typescript
const processFile = (file: File) => {
  if (file.size > 20 * 1024 * 1024) {  // Change 10MB to 20MB
    alert('File size must be less than 20MB');
    return;
  }
  // ...
};
```

---

## Deployment

### Build for Production

```bash
npm run build
```

Creates optimized build in `dist/` directory:
- Minified JavaScript
- Optimized CSS
- Compressed assets

### Environment Variables

Create `.env` for production:

```bash
VITE_API_URL=https://your-production-api.com
```

### Deployment Options

#### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Option 2: Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

#### Option 3: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Option 4: Traditional Server
1. Build: `npm run build`
2. Upload `dist/` folder to server
3. Configure web server (nginx/apache)
4. Set up HTTPS

### CORS Configuration

Backend must enable CORS for your frontend domain:

**Development**:
```
Access-Control-Allow-Origin: http://localhost:5173
```

**Production**:
```
Access-Control-Allow-Origin: https://yourdomain.com
```

### Performance Optimization

- **Images**: Use WebP format with PNG fallback
- **Code Splitting**: Vite handles automatically
- **Lazy Loading**: Implement for heavy components
- **Compression**: Enable gzip on server
- **CDN**: Use CDN for static assets

---

## Troubleshooting

### Build Issues

**Error**: `Cannot find module 'tailwindcss'`
```bash
npm install tailwindcss @tailwindcss/postcss
```

**Error**: `Module not found: 'react'`
```bash
npm install
```

**Error**: TypeScript compilation errors
```bash
npx tsc --noEmit  # Check for errors
npm run build     # Detailed error output
```

### Runtime Issues

**API not responding**
- Check backend is running
- Verify `.env` 's `VITE_API_URL`
- Check CORS settings on backend
- Look at browser Network tab

**Camera not working**
- Grant camera permissions
- Use HTTPS (production only)
- Check browser support

**Images not displaying**
- Verify Base64 encoding on backend
- Check image format is PNG
- Inspect browser console errors

**Styling not applying**
- Clear browser cache
- Rebuild: `npm run build`
- Check class names are in Tailwind config

### Performance Issues

**Slow build time**
- Clear `node_modules` and reinstall
- Update Node.js version
- Check disk space

**Large bundle size**
- Analyze: `npm install -D rollup-plugin-visualizer`
- Remove unused dependencies
- Enable code splitting

---

## Additional Resources

### Documentation Files
- [README.md](README.md) - Project overview
- [QUICKSTART.md](QUICKSTART.md) - Getting started
- [API_INTEGRATION.md](API_INTEGRATION.md) - API specification
- [COMPONENTS.md](COMPONENTS.md) - Component reference
- [DOCUMENTATION.md](DOCUMENTATION.md) - This file

### External Links
- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Community & Support
- GitHub Issues: Report bugs
- Discussions: Feature requests
- Email: For direct support

---

## License & Disclaimer

### License
Open source project available for medical and research purposes.

### Medical Disclaimer
This AI-powered analysis tool is designed to assist medical professionals. It should not be used as the sole basis for diagnosis or treatment decisions. Always consult with qualified healthcare professionals.

### Security Notice
- Use HTTPS in production
- Implement authentication if needed
- Validate all user inputs on backend
- Follow HIPAA compliance if handling protected health information

---

## Change Log

### Version 1.0.0 (February 14, 2026)
- ✅ Initial release
- ✅ Full component suite
- ✅ API integration ready
- ✅ Responsive design
- ✅ Mobile support
- ✅ Animation system
- ✅ Error handling
- ✅ Report generation

---

## Support & Contact

For issues, questions, or suggestions:
1. Check documentation files
2. Review troubleshooting section
3. Check GitHub issues
4. Contact development team

---

**Happy building! 🚀**

For the latest information, visit the project repository or documentation hub.
