import { motion } from 'framer-motion';
import { ShoppingCart, ExternalLink, AlertCircle, Sparkles } from 'lucide-react';
import type { RegionResult, UserProfile } from '../types';

const SKIN_TIPS: Record<string, string> = {
  Dry: 'Layer a richer moisturizer after actives; avoid over-cleansing.',
  Oily: 'Use non-comedogenic, lightweight formulas; don’t skip moisturizer.',
  Combination: 'Balance: lighter products on T-zone, richer on dry areas.',
  Sensitive: 'Patch-test new products; introduce one active at a time.',
  Normal: 'Maintain consistency with cleanser, moisturizer, and daily SPF.',
};

export const ProductRecommendations = ({
  regions,
  profile,
}: {
  regions: RegionResult[];
  profile?: UserProfile | null;
}) => {
  const affectedRegions = regions.filter((r) => r.issue !== 'Normal');

  if (affectedRegions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-green-50 dark:bg-green-950 rounded-xl border border-green-200 dark:border-green-800 flex items-start gap-4"
      >
        <div className="p-2 bg-green-200 dark:bg-green-800 rounded-full">
          <AlertCircle className="text-green-700 dark:text-green-200" size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-green-900 dark:text-green-100">Excellent Skin Health!</h3>
          <p className="text-sm text-green-700 dark:text-green-200 mt-1">
            No significant issues detected. Maintain your skincare routine!
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      {profile?.skin_type && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/15 flex gap-3"
        >
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-text">
              Tips for {profile.skin_type} skin
            </p>
            <p className="text-sm text-muted mt-1">
              {SKIN_TIPS[profile.skin_type] ?? SKIN_TIPS.Normal}
            </p>
            {profile.allergies && (
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                ⚠ Check labels for your allergies: {profile.allergies}
              </p>
            )}
          </div>
        </motion.div>
      )}

      <h3 className="text-2xl font-bold mb-6 text-text">Recommended Products</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {affectedRegions.map((region, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-text">{region.display_name}</h4>
                <p className="text-sm text-text/60">{region.issue}</p>
              </div>
              <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900 rounded-full">
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-100">
                  {region.confidence}%
                </span>
              </div>
            </div>

            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Recommended:
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold">
                {region.recommendation ? (typeof region.recommendation === 'string' ? region.recommendation : region.recommendation['Product Name']) : 'General skincare'}
              </p>
            </div>

            <div className="flex gap-2">
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={region.recommendation && 'URL' in region.recommendation ? region.recommendation.URL : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition"
              >
                <ShoppingCart size={16} />
                <span className="text-sm">Find Product</span>
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2 text-sm"
              >
                <ExternalLink size={16} />
                Learn More
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-800 dark:text-yellow-200"
      >
        <p className="font-semibold mb-2">💡 Tip:</p>
        <p>
          Always do a patch test before using new products. If issues persist, consult a dermatologist
          for personalized advice.
        </p>
      </motion.div>
    </div>
  );
};
