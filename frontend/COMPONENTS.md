# Component Architecture

## Component Hierarchy

```
App
├── Navbar
├── HeroSection
├── UploadBox
│   ├── Upload Mode
│   │   └── Drag & Drop Area
│   ├── Camera Mode
│   │   ├── Video Feed
│   │   └── Canvas (hidden)
│   └── Preview Mode
└── AnalyzeButton
├── Loader (conditional)
├── ResultsDashboard (conditional)
│   ├── ImageViewer
│   │   └── Detected Face Image
│   ├── HeatmapViewer
│   │   ├── Heatmap Image
│   │   └── Intensity Legend
│   ├── StatsCards (3-column grid)
│   │   ├── Regions Detected Card
│   │   ├── Processed Regions Card
│   │   └── Confidence Score Card
│   ├── SeverityBadge
│   └── ReportButton
├── Footer
└── ErrorAlert (conditional)
```

## Component Details

### Navbar

**File**: `src/components/Navbar.tsx`

**Props**: None

**State**: None

**Features**:
- Sticky positioning with blur effect
- Responsive navigation
- Mobile menu button

**Styling**: Tailwind classes

```tsx
export const Navbar = () => {
  // Logo and navigation links
  // Mobile hamburger menu
}
```

---

### HeroSection

**File**: `src/components/HeroSection.tsx`

**Props**:
```typescript
interface Props {
  onStartAnalysis: () => void;
}
```

**Features**:
- Animated introduction
- Call-to-action button
- Hero illustration placeholder
- Smooth entrance animations

**Animations**:
- Fade-in from left/right
- Delayed stagger effect

---

### UploadBox

**File**: `src/components/UploadBox.tsx`

**Props**:
```typescript
interface UploadBoxProps {
  onImageSelect: (file: File, preview: string) => void;
  previewURL: string | null;
}
```

**State**:
```typescript
mode: 'upload' | 'camera'
isDragging: boolean
cameraActive: boolean
```

**Features**:
- **Upload Mode**:
  - Drag & drop area
  - File picker input
  - Accepts JPG, PNG, JPEG
  - Max 10MB validation

- **Camera Mode**:
  - Live video preview
  - Capture button
  - Camera permission handling
  
- **Preview Mode**:
  - Shows selected image
  - Replace option

**Methods**:
- `handleDrop()` - Process dropped files
- `handleFileInput()` - Process selected files
- `processFile()` - Validate and convert to preview
- `startCamera()` - Request camera access
- `capturePhoto()` - Take photo from video stream
- `stopCamera()` - Stop camera stream

---

### AnalyzeButton

**File**: `src/components/AnalyzeButton.tsx`

**Props**:
```typescript
interface Props {
  onClick: () => void;
  disabled: boolean;
}
```

**Features**:
- Disabled state when no image selected
- Hover and tap animations
- Large, prominent button

**States**:
- Enabled (clickable, blue)
- Disabled (grayed out)

---

### Loader

**File**: `src/components/Loader.tsx`

**Props**: None

**Features**:
- Animated scanning bar
- "Processing facial regions…" message
- Smooth vertical animation

**Animation**:
- Y-axis translation from -100% to +100%
- 2-second infinite loop

---

### ImageViewer

**File**: `src/components/ImageViewer.tsx`

**Props**:
```typescript
interface Props {
  imageData: string;  // Base64 encoded
  title: string;
}
```

**Features**:
- Displays Base64 images
- Rounded corners
- Soft shadow
- Responsive sizing

---

### HeatmapViewer

**File**: `src/components/HeatmapViewer.tsx`

**Props**:
```typescript
interface Props {
  heatmapData: string;  // Base64 encoded
}
```

**Features**:
- Displays heatmap image
- Intensity legend
- Color-coded indicators:
  - Blue: Low intensity
  - Yellow: Medium
  - Red: High intensity

---

### StatsCards

**File**: `src/components/StatsCards.tsx`

**Props**:
```typescript
interface Props {
  regionsDetected: number;
  processed: number;
  confidence: number;  // 0.0 - 1.0
}
```

**Featured Cards**:
1. **Total Regions** - regions_detected count
2. **Processed Regions** - processed count
3. **Analysis Confidence** - confidence as percentage

**Features**:
- 3-column responsive grid
- Large number display
- Icon indicators
- Staggered animations

**StatCard Component** (internal):
- Icon display
- Title and value
- Soft shadow styling

---

### SeverityBadge

**File**: `src/components/SeverityBadge.tsx`

**Props**:
```typescript
interface Props {
  severity: 'Low' | 'Medium' | 'High';
}
```

**Features**:
- Color-coded display
- Pill-shaped badge
- Border matching severity level

**Color Mapping**:
- Low: Green background/border
- Medium: Yellow background/border
- High: Red background/border

---

### ReportButton

**File**: `src/components/ReportButton.tsx`

**Props**:
```typescript
interface Props {
  onClick: () => void;
}
```

**Features**:
- Download icon
- Hover animation
- Secondary color (green)

---

### ErrorAlert

**File**: `src/components/ErrorAlert.tsx`

**Props**:
```typescript
interface Props {
  message: string;
  onDismiss: () => void;
}
```

**Features**:
- Red bordered box
- Alert icon
- Dismissible
- Slide-in/out animation

---

### ResultsDashboard

**File**: `src/components/ResultsDashboard.tsx`

**Props**:
```typescript
interface Props {
  results: AnalysisResult;
  onDownloadReport: () => void;
}
```

**Layout**:
- **Desktop**: 2-column grid (face + heatmap)
- **Mobile**: Stacked layout

**Sections**:
1. Face and Heatmap (grid)
2. Statistics cards
3. Severity badge
4. Download report button

---

### Footer

**File**: `src/components/Footer.tsx`

**Props**: None

**Features**:
- Dark background
- Copyright text
- Medical disclaimer

---

## State Management

All state is managed in `App.tsx`:

```typescript
interface AppState {
  selectedImage: File | null;
  previewURL: string | null;
  loading: boolean;
  results: AnalysisResult | null;
  mode: 'upload' | 'camera';
  error: string | null;
}
```

### State Flow

1. **Image Selection**: UploadBox → App.handleImageSelect()
2. **Analysis**: AnalyzeButton → App.handleAnalyze()
3. **Results**: API → setState({results})
4. **Error**: API fails → setState({error})
5. **Reset**: "Analyze Another" → setState({...initial})

---

## Styling Strategy

### Tailwind Classes Used

**Spacing**: `p-`, `m-`, `gap-`, `py-`, `px-`

**Layout**: `grid`, `flex`, `max-w-`, `mx-auto`

**Colors**: Primary (#2563EB), Secondary (#22C55E), Accent (#F97316)

**Borders**: `border`, `border-dashed`, `rounded-lg`, `rounded-2xl`, `rounded-full`

**Shadows**: `shadow-soft`, `shadow-soft-lg`

**Text**: `text-`, `font-bold`, `font-semibold`, `text-center`

**Effects**: `hover:`, `transition`, `opacity-`

### Animation Classes

**Fade**: `opacity-0` → `opacity-1`

**Scale**: `scale-95` → `scale-100`

**Slide**: `translate-y-`, `translate-x-`

**Custom**: @tailwind animations for scanning and shimmer

---

## Type Definitions

**File**: `src/types/index.ts`

```typescript
export interface AnalysisResult {
  regions_detected: number;
  processed: number;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High';
  face_image: string;  // Base64
  heatmap: string;     // Base64
}

export type UploadMode = 'upload' | 'camera';

export interface AppState {
  selectedImage: File | null;
  previewURL: string | null;
  loading: boolean;
  results: AnalysisResult | null;
  mode: UploadMode;
  error: string | null;
}
```

---

## API Service

**File**: `src/services/api.ts`

```typescript
export const analyzeImage = async (image: File): Promise<AnalysisResult>
```

- Creates FormData with image
- POST to `/analyze` endpoint
- Returns analysis results
- Throws error if request fails

---

## Component Export Pattern

**File**: `src/components/index.ts`

Barrel export for cleaner imports:

```typescript
export { Navbar } from './Navbar';
export { HeroSection } from './HeroSection';
// ... etc
```

---

## Best Practices

### Component Organization
✅ One component per file  
✅ Descriptive prop interfaces  
✅ Consistent naming conventions  

### Styling
✅ Use Tailwind utility classes  
✅ Follow color system  
✅ Consistent spacing  

### Animations
✅ Use Framer Motion for complex animations  
✅ Keep animations under 400ms  
✅ Provide visual feedback on interactions  

### Type Safety
✅ Define interfaces for all props  
✅ Use type-only imports  
✅ Avoid `any` type  

### Performance
✅ Memoize expensive components (if needed)  
✅ Lazy load heavy components  
✅ Optimize images  

---

For more information, see [README.md](README.md) and [API_INTEGRATION.md](API_INTEGRATION.md)
