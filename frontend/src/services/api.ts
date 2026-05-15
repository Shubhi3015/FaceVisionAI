import axios from "axios";
import type { AnalysisResult } from "../types";

// Reads VITE_API_URL from .env, falls back to same-origin (prod) or localhost (dev)
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:8000" : "");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000, // 60 s — model inference can be slow
});

/**
 * Send image to POST /analyze.
 * Field name MUST be "image" to match the FastAPI parameter.
 */
export async function analyzeImage(imageFile: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("image", imageFile); // ← must match FastAPI: image: UploadFile = File(...)

  const response = await api.post<AnalysisResult>("/analyze", formData);

  return response.data;
}

export default api;
