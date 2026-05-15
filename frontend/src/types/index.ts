// ---- Per-region result from /analyze ----
export interface ProductRecommendation {
  "Product Name": string;
  Company: string;
  "Medication Type": string;
  URL: string;
}

export interface RegionResult {
  region: string;
  display_name: string;
  issue: "Acne" | "Redness" | "Pigmentation" | "Normal";
  confidence: number;   // 0–100
  severity: string;
  recommendation: ProductRecommendation | null;
  region_image: string; // base64 PNG
}

export interface OverallResult {
  primary_concern: string;
  average_score: number;
  per_issue_avg: { Acne: number; Redness: number; Pigmentation: number };
  severity: string;
  recommendation: ProductRecommendation | null;
}

// ---- Main shape returned by POST /analyze ----
export interface AnalysisResult {
  // Summary fields (used by StatsCards, SeverityBadge, etc.)
  regions_detected: number;
  processed: number;
  confidence: number;   // 0.0–1.0
  severity: "Low" | "Medium" | "High";
  face_image: string;   // base64 PNG
  heatmap: string;      // base64 PNG

  // Detailed fields (used by RegionCards, OverallPanel)
  regions: RegionResult[];
  overall: OverallResult;
}

export type UploadMode = "upload" | "camera";

export interface AppState {
  selectedImage: File | null;
  previewURL: string | null;
  loading: boolean;
  results: AnalysisResult | null;
  mode: UploadMode;
  error: string | null;
}
