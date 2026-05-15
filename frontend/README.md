# FaceAI Analyzer

A modern, responsive AI web interface for facial region analysis and visualization. This frontend-only application connects to a backend API for processing facial images.

## Features

✨ **Core Features**
- 📸 Upload or capture face images
- 🎯 Detect and visualize facial regions  
- 🔥 Heatmap visualization with intensity mapping
- 📊 Analysis metrics and confidence scores
- 🎨 Beautiful, medical-grade UI design
- 📱 Fully responsive layout (desktop & mobile)
- 📄 Export analysis reports as text files

## 🎨 Design System

### Colors
- **Primary**: #2563EB (Blue)
- **Secondary**: #22C55E (Green)
- **Accent**: #F97316 (Orange)
- **Background**: #F8FAFC (Light Blue-Gray)
- **Card**: #FFFFFF (White)

### Typography
- **Font**: Inter
- **Headings**: 600 weight
- **Body**: 400 weight

## 🚀 Tech Stack

- **React 19** - UI framework
- **Vite** - Fast build tool
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Axios** - HTTP client
- **Lucide Icons** - Beautiful icon set

## 📋 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Navbar.tsx
│   ├── HeroSection.tsx
│   ├── UploadBox.tsx
│   ├── AnalyzeButton.tsx
│   ├── Loader.tsx
│   ├── ImageViewer.tsx
│   ├── HeatmapViewer.tsx
│   ├── StatsCards.tsx
│   ├── SeverityBadge.tsx
│   ├── ReportButton.tsx
│   ├── ErrorAlert.tsx
│   ├── ResultsDashboard.tsx
│   ├── Footer.tsx
│   └── index.ts         # Component barrel export
├── services/            # API integration
│   └── api.ts
├── types/               # TypeScript definitions
│   └── index.ts
├── App.tsx              # Main application component
├── main.tsx             # React entry point
└── index.css            # Global styles + Tailwind
```

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation Steps

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔌 API Integration

### Connecting to Backend

The application expects a backend API at `http://localhost:8000`. Configure the API base URL in [src/services/api.ts](src/services/api.ts):

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

### Expected API Response Format

**POST `/analyze`**

**Request**: FormData with image file
```typescript
FormData {
  image: File
}
```

**Response JSON**:
```json
{
  "regions_detected": 42,
  "processed": 40,
  "confidence": 0.94,
  "severity": "Medium",
  "face_image": "base64_encoded_image",
  "heatmap": "base64_encoded_heatmap"
}
```

## 🧩 Component Overview

### Page Layout

**Navbar**
- Sticky navigation with blur effect
- Logo and navigation links
- Mobile-responsive menu

**HeroSection**
- Eye-catching heading and subtitle
- Call-to-action button
- Illustration placeholder

**UploadBox**
- Tab-based upload/camera modes
- Drag-and-drop support
- File validation (type & size < 10MB)
- Camera capture with preview

**ResultsDashboard**
- Grid layout showing analysis results
- Detected face panel
- Heatmap visualization with legend
- Metrics cards (regions, confidence)
- Severity badge indicator
- Report download button

**ErrorAlert**
- User-friendly error messages
- Dismissible notifications

**Footer**
- Copyright and disclaimer

## 🎨 State Management

Application state tracked in [src/App.tsx](src/App.tsx):

```typescript
interface AppState {
  selectedImage: File | null;           // Currently selected image
  previewURL: string | null;            # Data URL for preview
  loading: boolean;                     // Analysis in progress
  results: AnalysisResult | null;       // API response data
  mode: 'upload' | 'camera';           // Current input mode
  error: string | null;                // Error message
}
```

## 🔄 User Flow

1. **Upload/Capture**: User selects image via upload or camera
2. **Preview**: Image preview displayed before analysis  
3. **Analyze**: Click "Analyze Image" button
4. **Loading**: Animated scanning visualization
5. **Results**: Dashboard shows facial regions, heatmap, metrics
6. **Download**: Export analysis report as text file
7. **Retry**: Analyze another image or modify selection

## ⚙️ Configuration

### Environment Variables

Create a `.env` file for configuration:

```bash
# Backend API URL (defaults to http://localhost:8000)
VITE_API_URL=http://your-backend-api.com
```

### Tailwind Configuration

Customizable in [tailwind.config.js](tailwind.config.js):

```javascript
theme: {
  extend: {
    colors: {
      primary: '#2563EB',
      secondary: '#22C55E',
      accent: '#F97316',
      // ... more colors
    },
    // ... more customizations
  },
},
```

## 🧪 Validation

Frontend validation includes:

- ✅ File type check (image/jpeg, image/png)
- ✅ File size validation (< 10MB)
- ✅ Image selection required before analysis
- ✅ Camera/upload mode switching

## 📱 Responsive Design

- **Mobile** (< 768px): Stacked layout, optimized touch targets
- **Tablet** (768px - 1024px): 2-column grid for results
- **Desktop** (> 1024px): Full-width grid layouts

## 🎬 Animations

Using Framer Motion for smooth UX:

- **Fade-in** on page load
- **Hover scales** on interactive elements
- **Scanning animation** during analysis
- **Slide transitions** between states
- **Shimmer effects** on loading states

## 🐛 Troubleshooting

### API Connection Issues
- Verify backend is running at configured URL
- Check CORS settings on backend
- Inspect browser console for error details

### Camera Permission Denied
- Grant camera permissions in browser settings
- Use HTTPS in production (camera requires secure context)

### File Upload Failing
- Ensure file is valid image (JPG/PNG)
- Check file size is under 10MB
- Try uploading via file picker instead of drag-drop

## 📝 Development Guidelines

### Adding New Components

1. Create file in `src/components/YourComponent.tsx`
2. Export from `src/components/index.ts`
3. Use TypeScript for type safety
4. Apply Tailwind classes for styling
5. Add Framer Motion for animations

### Styling Conventions

- Use Tailwind utility classes
- Follow the color system defined in `tailwind.config.js`
- Use `rounded-lg` for medium radius, `rounded-2xl` for large
- Use `shadow-soft-lg` for subtle shadows
- Use `transition` on hover/interactive elements

### Component Props

Always define interfaces for component props:

```typescript
interface YourComponentProps {
  title: string;
  onClick: () => void;
  disabled?: boolean;
}
```

## 📚 Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev)
- [Vite Guide](https://vitejs.dev)

## ⚖️ License

This project is open source and available for medical and research purposes.

## ⚕️ Disclaimer

This AI-powered analysis tool is designed to assist medical professionals. It should not be used as the sole basis for diagnosis or treatment decisions. Always consult with qualified healthcare professionals.

---

Built with ❤️ for facial region analysis and visualization
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
