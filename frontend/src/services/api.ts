import axios, { isAxiosError } from "axios";
import type {
  AnalysisResult,
  AnalyticsData,
  OnboardingData,
  ScanSummary,
  UserProfile,
} from "../types";

const configuredApiUrl = (import.meta.env.VITE_API_URL || "").trim();
const isLocalApiUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(
  configuredApiUrl
);
const API_BASE_URL =
  configuredApiUrl && (import.meta.env.DEV || !isLocalApiUrl)
    ? configuredApiUrl
    : import.meta.env.DEV
    ? "http://localhost:8000"
    : "";
const API_TARGET_LABEL =
  API_BASE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "this site");

const TOKEN_KEY = "facevision_token";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
});

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Turn axios / network errors into user-readable messages */
export function getApiErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (isAxiosError(err)) {
    if (err.code === "ECONNABORTED") {
      return "Analysis timed out. On CPU the first scan can take 1–2 minutes — please wait and try again.";
    }
    if (!err.response) {
      return `Cannot reach the backend at ${API_TARGET_LABEL}. Please refresh this page and try again.`;
    }
    const detail = err.response.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d: { msg?: string }) => d.msg)
        .filter(Boolean)
        .join(", ");
    }
  }
  return fallback;
}

export async function analyzeImage(imageFile: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("image", imageFile);
  const response = await api.post<AnalysisResult>("/analyze", formData, {
    timeout: 300_000, // ML inference on CPU can exceed 60s
  });
  return response.data;
}

export type SkincareChatRole = "user" | "assistant";

export interface SkincareChatMessage {
  role: SkincareChatRole;
  content: string;
}

export async function sendSkincareChat(
  messages: SkincareChatMessage[]
): Promise<string> {
  const response = await api.post<{ reply: string }>("/skincare-chat", {
    messages,
  });
  return response.data.reply;
}

export async function registerUser(
  email: string,
  password: string
): Promise<{ access_token: string; user: UserProfile }> {
  const response = await api.post<{ access_token: string; user: UserProfile }>(
    "/auth/register",
    { email, password }
  );
  return response.data;
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ access_token: string; user: UserProfile }> {
  const response = await api.post<{ access_token: string; user: UserProfile }>(
    "/auth/login",
    { email, password }
  );
  return response.data;
}

export async function fetchMe(): Promise<UserProfile> {
  const response = await api.get<UserProfile>("/auth/me");
  return response.data;
}

export async function updateProfile(
  data: Partial<OnboardingData> & { onboarding_completed?: boolean }
): Promise<UserProfile> {
  const response = await api.put<UserProfile>("/auth/profile", data);
  return response.data;
}

export async function fetchScans(): Promise<ScanSummary[]> {
  const response = await api.get<ScanSummary[]>("/api/scans");
  return response.data;
}

export async function fetchScanDetail(
  id: number
): Promise<{ result: AnalysisResult } & ScanSummary> {
  const response = await api.get<{ result: AnalysisResult } & ScanSummary>(
    `/api/scans/${id}`
  );
  return response.data;
}

export async function deleteScan(id: number): Promise<void> {
  await api.delete(`/api/scans/${id}`);
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const response = await api.get<AnalyticsData>("/api/analytics");
  return response.data;
}

export default api;
