import { motion } from "framer-motion";
import { ExternalLink, CheckCircle, AlertCircle, AlertTriangle, XCircle } from "lucide-react";
import type { RegionResult } from "../types";
 
interface Props {
  result: RegionResult;
  index: number;
}
 
const issueColors: Record<string, string> = {
  Acne: "border-orange-400 bg-orange-50",
  Redness: "border-red-400 bg-red-50",
  Pigmentation: "border-purple-400 bg-purple-50",
  Normal: "border-teal-400 bg-teal-50",
};
 
const issueBadgeColors: Record<string, string> = {
  Acne: "bg-orange-100 text-orange-800 border-orange-300",
  Redness: "bg-red-100 text-red-800 border-red-300",
  Pigmentation: "bg-purple-100 text-purple-800 border-purple-300",
  Normal: "bg-teal-100 text-teal-800 border-teal-300",
};
 
const severityIcon = (severity: string) => {
  if (severity === "No Significant Issue") return <CheckCircle className="w-4 h-4 text-teal-500" />;
  if (severity === "Mild") return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  if (severity === "Moderate") return <AlertTriangle className="w-4 h-4 text-orange-500" />;
  return <XCircle className="w-4 h-4 text-red-500" />;
};
 
const severityBarColor = (severity: string) => {
  if (severity === "No Significant Issue") return "bg-teal-400";
  if (severity === "Mild") return "bg-yellow-400";
  if (severity === "Moderate") return "bg-orange-400";
  return "bg-red-500";
};
 
export const RegionCard = ({ result, index }: Props) => {
  const borderClass = issueColors[result.issue] ?? "border-gray-300 bg-gray-50";
  const badgeClass = issueBadgeColors[result.issue] ?? "bg-gray-100 text-gray-700 border-gray-300";
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
      className={`rounded-2xl border-2 ${borderClass} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
    >
      {/* Region Image */}
      <div className="relative">
        <img
          src={`data:image/png;base64,${result.region_image}`}
          alt={result.display_name}
          className="w-full h-40 object-cover"
        />
        <span className="absolute top-2 left-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
          {result.display_name}
        </span>
      </div>
 
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Issue Badge */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badgeClass}`}>
            {result.issue}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            {result.confidence.toFixed(1)}% confidence
          </span>
        </div>
 
        {/* Confidence Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <motion.div
            className={`h-1.5 rounded-full ${severityBarColor(result.severity)}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(result.confidence, 100)}%` }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.6, ease: "easeOut" }}
          />
        </div>
 
        {/* Severity */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          {severityIcon(result.severity)}
          <span className="font-medium">{result.severity}</span>
        </div>
 
        {/* Product Recommendation */}
        {result.recommendation ? (
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-3 space-y-1">
            <p className="text-xs font-bold text-gray-800 leading-tight">
              {result.recommendation["Product Name"]}
            </p>
            <p className="text-xs text-gray-500">{result.recommendation["Company"]}</p>
            <p className="text-xs text-gray-400 italic">{result.recommendation["Medication Type"]}</p>
            {result.recommendation.URL && result.recommendation.URL !== "#" && (
              <a
                href={result.recommendation.URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-medium mt-1 transition-colors"
              >
                View Product <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No product needed</p>
        )}
      </div>
    </motion.div>
  );
};
 