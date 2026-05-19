import { useState, useRef, useEffect } from 'react';
import type { AnalysisResult } from '../types';
import { analyzeImage, getApiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HeroSection } from '../components/HeroSection';
import { UploadBox } from '../components/UploadBox';
import { AnalyzeButton } from '../components/AnalyzeButton';
import { Loader } from '../components/Loader';
import { ErrorAlert } from '../components/ErrorAlert';
import { ResultsDashboard } from '../components/ResultsDashboard';
import { AnalysisHistory } from '../components/AnalysisHistory';
import { OnboardingQuiz } from '../components/OnboardingQuiz';

export function HomePage() {
  const { user, saveOnboarding } = useAuth();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  const resultsRef = useRef<HTMLDivElement>(null);

  const showOnboarding = Boolean(user && !user.onboarding_completed);

  const handleImageSelect = (file: File, preview: string) => {
    if (user && !user.onboarding_completed) return;
    setSelectedImage(file);
    setPreviewURL(preview);
    setResults(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage || (user && !user.onboarding_completed)) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await analyzeImage(selectedImage);
      setResults(data);
      if (!user) {
        window.dispatchEvent(new CustomEvent('addToHistory', { detail: data }));
      }
      setHistoryKey((k) => k + 1);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(
          err,
          'Analysis failed. Please make sure the backend is running and try again.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleScrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectFromHistory = (result: AnalysisResult) => {
    setResults(result);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // After login (and on returning), automatically show the most recent analysis.
  useEffect(() => {
    const shouldAutoShow = window.localStorage.getItem('AUTO_SHOW_ANALYSIS') === '1';
    if (!shouldAutoShow) return;

    // Reset flag early to prevent loops.
    window.localStorage.removeItem('AUTO_SHOW_ANALYSIS');

    // For logged-in users, AnalysisHistory pulls from backend. For non-logged-in users, it uses localStorage.
    // We attempt to load the latest locally first; if user is logged in and local data is empty, the UI will stay on the page
    // and the user can click a history item.
    const saved = window.localStorage.getItem('analysisHistory');
    if (!saved) return;

    try {
      const parsed: Array<{ result: AnalysisResult; timestamp: string }>
        = JSON.parse(saved);
      const latest = parsed?.[0]?.result;
      if (latest) {
        setResults(latest);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <>
      <OnboardingQuiz
        open={showOnboarding}
        onComplete={saveOnboarding}
      />

      <HeroSection onStartAnalysis={handleScrollToUpload} />

      <section className="py-8">
        <AnalysisHistory key={historyKey} onSelectResult={handleSelectFromHistory} />
      </section>

      <section id="upload-section" className="py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {user && !user.onboarding_completed && (
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-sm text-text text-center">
              Complete the quick profile quiz above to unlock your first scan.
            </div>
          )}
          <UploadBox
            onImageSelect={handleImageSelect}
            previewURL={previewURL}
          />
          <AnalyzeButton
            onClick={handleAnalyze}
            disabled={!selectedImage || loading || Boolean(user && !user.onboarding_completed)}
          />
        </div>
      </section>

      {error && (
        <div className="px-4 mb-6 max-w-2xl mx-auto">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {loading && (
        <div className="py-12">
          <Loader />
        </div>
      )}

      {results && !loading && (
        <section ref={resultsRef} className="py-12">
          <ResultsDashboard results={results} profile={user} />
        </section>
      )}
    </>
  );
}
