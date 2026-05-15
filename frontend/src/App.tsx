import { useState, useRef } from "react";
import type { AnalysisResult } from "./types";
import { analyzeImage } from "./services/api";
 
// ── Components ──────────────────────────────────────────────────────────────
// (These are your existing components — only ResultsDashboard is replaced)
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { UploadBox } from "./components/UploadBox";
import { AnalyzeButton } from "./components/AnalyzeButton";
import { Loader } from "./components/Loader";
import { ErrorAlert } from "./components/ErrorAlert";
import { Footer } from "./components/Footer";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { AnalysisHistory } from "./components/AnalysisHistory";
 
export default function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
 
  const resultsRef = useRef<HTMLDivElement>(null);
 
  // Called by UploadBox when the user picks / captures an image
  const handleImageSelect = (file: File, preview: string) => {
    setSelectedImage(file);
    setPreviewURL(preview);
    setResults(null);
    setError(null);
  };
 
  // Called when user clicks "Analyze Image"
  const handleAnalyze = async () => {
    if (!selectedImage) return;
 
    setLoading(true);
    setError(null);
    setResults(null);
 
    try {
      const data = await analyzeImage(selectedImage);
      setResults(data);
      // Add to history
      const event = new CustomEvent('addToHistory', { detail: data });
      window.dispatchEvent(event);
      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Analysis failed. Please make sure the backend is running and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };
 
  const handleScrollToUpload = () => {
    document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectFromHistory = (result: AnalysisResult) => {
    setResults(result);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };
 
  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 flex flex-col">
      <Navbar />
 
      <main className="flex-1">
        {/* Hero */}
        <HeroSection onStartAnalysis={handleScrollToUpload} />

        {/* History */}
        <section className="py-8">
          <AnalysisHistory onSelectResult={handleSelectFromHistory} />
        </section>
 
        {/* Upload Section */}
        <section id="upload-section" className="py-12 px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            <UploadBox onImageSelect={handleImageSelect} previewURL={previewURL} />
            <AnalyzeButton onClick={handleAnalyze} disabled={!selectedImage || loading} />
          </div>
        </section>
 
        {/* Error */}
        {error && (
          <div className="px-4 mb-6 max-w-2xl mx-auto">
            <ErrorAlert message={error} onDismiss={() => setError(null)} />
          </div>
        )}
 
        {/* Loader */}
        {loading && (
          <div className="py-12">
            <Loader />
          </div>
        )}
 
        {/* Results */}
        {results && !loading && (
          <section ref={resultsRef} className="py-12">
            <ResultsDashboard results={results} />
          </section>
        )}
      </main>
 
      <Footer />
    </div>
  );
}