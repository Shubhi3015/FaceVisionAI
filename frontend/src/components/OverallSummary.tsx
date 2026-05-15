import { motion } from "framer-motion";
import { ExternalLink, TrendingUp } from "lucide-react";
import type { OverallResult } from "../types";
 
interface Props {
  overall: OverallResult;
}
 
const concernColors: Record<string, string> = {
  Acne: { bar: "bg-orange-400", text: "text-orange-700", bg: "bg-orange-50 border-orange-300" } as unknown as string,
  Redness: { bar: "bg-red-400", text: "text-red-700", bg: "bg-red-50 border-red-300" } as unknown as string,
  Pigmentation: { bar: "bg-purple-400", text: "text-purple-700", bg: "bg-purple-50 border-purple-300" } as unknown as string,
  Normal: { bar: "bg-teal-400", text: "text-teal-700", bg: "bg-teal-50 border-teal-300" } as unknown as string,
};
 
interface ColorSet {
  bar: string;
  text: string;
  bg: string;
}
 
function getColors(concern: string): ColorSet {
  return (concernColors[concern] as unknown as ColorSet) ?? {
    bar: "bg-gray-400",
    text: "text-gray-700",
    bg: "bg-gray-50 border-gray-300",
  };
}
 
export const OverallSummary = ({ overall }: Props) => {
  const colors = getColors(overall.primary_concern);
  const issues = ["Acne", "Redness", "Pigmentation"] as const;
  const maxScore = Math.max(...Object.values(overall.per_issue_avg), 1);
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className={`px-6 py-5 border-b ${colors.bg} border-inherit`}>
        <div className="flex items-center gap-3">
          <TrendingUp className={`w-5 h-5 ${colors.text}`} />
          <h2 className="text-lg font-bold text-gray-800">Overall Skin Assessment</h2>
        </div>
        <div className="mt-3 flex items-baseline gap-3 flex-wrap">
          <span className={`text-2xl font-black ${colors.text}`}>
            {overall.primary_concern}
          </span>
          <span className="text-sm text-gray-500">
            Primary concern · {overall.average_score}% avg severity
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${colors.bg}`}>
            {overall.severity}
          </span>
        </div>
      </div>
 
      <div className="p-6 grid md:grid-cols-2 gap-6">
        {/* Issue Distribution */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-4">Issue Distribution</h3>
          <div className="space-y-3">
            {issues.map((issue) => {
              const score = overall.per_issue_avg[issue];
              const c = getColors(issue);
              return (
                <div key={issue}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span className="font-medium">{issue}</span>
                    <span>{score.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${c.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(score / maxScore) * 100}%` }}
                      transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
 
        {/* Overall Product Recommendation */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-4">Recommended Product</h3>
          {overall.recommendation ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2 h-full flex flex-col justify-between">
              <div className="space-y-1">
                <p className="font-bold text-gray-900 text-sm leading-snug">
                  {overall.recommendation["Product Name"]}
                </p>
                <p className="text-xs text-gray-500">{overall.recommendation["Company"]}</p>
                <p className="text-xs text-gray-400 italic">
                  {overall.recommendation["Medication Type"]}
                </p>
              </div>
              {overall.recommendation.URL && overall.recommendation.URL !== "#" && (
                <a
                  href={overall.recommendation.URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors mt-2"
                >
                  View Product <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-sm text-teal-700 font-medium">
              ✓ Skin appears healthy — no product recommendation needed.
            </div>
          )}
        </div>
      </div>
 
      {/* Disclaimer */}
      <div className="px-6 pb-5">
        <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
          ⚕️ This is an AI-based preliminary analysis. Always consult a qualified dermatologist before starting any treatment.
        </p>
      </div>
    </motion.div>
  );
};