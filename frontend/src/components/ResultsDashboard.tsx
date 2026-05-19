import { motion } from "framer-motion";
import type { AnalysisResult, UserProfile } from "../types";
import { RegionCard } from "./RegionCard";
import { OverallSummary } from "./OverallSummary";
import { ProductRecommendations } from "./ProductRecommendations";
import { ReportGenerator } from "./ReportGenerator";

interface Props {
  results: AnalysisResult;
  profile?: UserProfile | null;
}

export const ResultsDashboard = ({ results, profile }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-12 px-4"
    >
      {profile?.skin_type && (
        <div className="max-w-5xl mx-auto glass-card rounded-2xl p-4 text-sm text-text">
          <span className="font-semibold text-primary">Personalized for you:</span>{' '}
          {profile.skin_type} skin
          {profile.allergies ? ` · avoid: ${profile.allergies}` : ''}
          {profile.current_products ? ` · building on your current routine` : ''}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <OverallSummary overall={results.overall} />
      </div>

      {/* Section header */}
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-text">Region-wise Analysis</h2>
        <p className="text-text/60 mt-2">
          {results.regions.length} facial regions analyzed • {results.processed} issues detected
        </p>
      </div>
 
      {/* Region cards grid */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {results.regions.map((region, i) => (
            <RegionCard key={region.region} result={region} index={i} />
          ))}
        </div>
      </div>

      {/* Product Recommendations */}
      <div className="max-w-5xl mx-auto">
        <ProductRecommendations regions={results.regions} profile={profile} />
      </div>

      {/* Report & Share Actions */}
      <div className="max-w-5xl mx-auto">
        <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-text mb-4">Export Your Results</h3>
          <ReportGenerator results={results} />
        </div>
      </div>
    </motion.div>
  );
};