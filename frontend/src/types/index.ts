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
  confidence: number;
  severity: string;
  recommendation: ProductRecommendation | null;
  region_image?: string;
}

export interface OverallResult {
  primary_concern: string;
  average_score: number;
  per_issue_avg: { Acne: number; Redness: number; Pigmentation: number };
  severity: string;
  recommendation: ProductRecommendation | null;
}

export interface AnalysisResult {
  regions_detected: number;
  processed: number;
  confidence: number;
  severity: "Low" | "Medium" | "High";
  face_image?: string;
  heatmap?: string;
  regions: RegionResult[];
  overall: OverallResult;
  scan_id?: number;
}

export interface UserProfile {
  id: number;
  email: string;
  onboarding_completed: boolean;
  age?: number | null;
  gender?: string | null;
  skin_type?: string | null;
  allergies?: string | null;
  current_products?: string | null;
}

export interface ScanSummary {
  id: number;
  created_at: string;
  severity: string;
  confidence: number;
  regions_detected: number;
  processed: number;
  primary_concern: string;
}

export interface AnalyticsData {
  total_scans: number;
  average_confidence: number;
  most_common_condition: string | null;
  condition_counts: Record<string, number>;
  severity_counts: Record<string, number>;
  confidence_by_month: { month: string; average: number }[];
}

export interface OnboardingData {
  age: number;
  gender: string;
  skin_type: string;
  allergies: string;
  current_products: string;
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
