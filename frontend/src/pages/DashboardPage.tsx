import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Activity,
  BarChart3,
  Camera,
  Sparkles,
  Target,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { deleteScan, fetchAnalytics, fetchScans } from '../services/api';
import type { AnalyticsData, ScanSummary } from '../types';

const CONDITION_COLORS: Record<string, string> = {
  Acne: '#7C3AED',
  Redness: '#EC4899',
  Pigmentation: '#F59E0B',
  Normal: '#10B981',
};

const PIE_COLORS = ['#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#6366F1'];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  delay,
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  sub?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-2xl p-5 shadow-soft"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted font-medium">{label}</p>
          <p className="text-3xl font-bold text-text mt-1">{value}</p>
          {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
        </div>
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [scans, setScans] = useState<ScanSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [a, s] = await Promise.all([fetchAnalytics(), fetchScans()]);
      setAnalytics(a);
      setScans(s);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async (id: number) => {
    await deleteScan(id);
    void load();
  };

  const barData = analytics
    ? Object.entries(analytics.condition_counts)
        .filter(([, v]) => v > 0)
        .map(([name, count]) => ({ name, count }))
    : [];

  const pieData = barData.map((d) => ({ name: d.name, value: d.count }));

  const trendData =
    analytics?.confidence_by_month.map((m) => ({
      month: m.month,
      confidence: Math.round(m.average * 100),
    })) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <p className="text-sm font-medium text-primary flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Your dashboard
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-text mt-1">
            Hello, <span className="gradient-text">{user?.email.split('@')[0]}</span>
          </h1>
          {user?.skin_type && (
            <p className="text-muted text-sm mt-2">
              {user.skin_type} skin
              {user.age ? ` · ${user.age} yrs` : ''}
              {user.allergies ? ' · allergy notes saved' : ''}
            </p>
          )}
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-soft-lg hover:opacity-95 transition"
        >
          <Camera className="w-4 h-4" /> New scan
        </Link>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              icon={BarChart3}
              label="Total scans"
              value={analytics?.total_scans ?? 0}
              sub="All time"
              delay={0.05}
            />
            <StatCard
              icon={Target}
              label="Top condition"
              value={analytics?.most_common_condition ?? '—'}
              sub="Most detected concern"
              delay={0.1}
            />
            <StatCard
              icon={TrendingUp}
              label="Avg confidence"
              value={`${Math.round((analytics?.average_confidence ?? 0) * 100)}%`}
              sub="Across all scans"
              delay={0.15}
            />
          </div>

          {analytics && analytics.total_scans > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-2xl p-6 shadow-soft"
              >
                <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Conditions detected
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
                    <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid rgba(124,58,237,0.15)',
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {barData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={CONDITION_COLORS[entry.name] ?? '#6366F1'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass-card rounded-2xl p-6 shadow-soft"
              >
                <h3 className="font-semibold text-text mb-4">Condition distribution</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              {trendData.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card rounded-2xl p-6 shadow-soft lg:col-span-2"
                >
                  <h3 className="font-semibold text-text mb-4">Confidence over time</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
                      <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <YAxis unit="%" tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="confidence" fill="#7C3AED" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-2xl p-12 text-center mb-8"
            >
              <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4 opacity-60" />
              <h3 className="text-lg font-semibold text-text">No scans yet</h3>
              <p className="text-muted text-sm mt-2 max-w-sm mx-auto">
                Run your first analysis to unlock charts and personalized insights.
              </p>
              <Link
                to="/"
                className="inline-flex mt-6 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold"
              >
                Start first scan
              </Link>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card rounded-2xl overflow-hidden shadow-soft"
          >
            <div className="px-6 py-4 border-b border-primary/10">
              <h3 className="font-semibold text-text">Scan history</h3>
            </div>
            {scans.length === 0 ? (
              <p className="p-6 text-sm text-muted">Your scans will appear here after analysis.</p>
            ) : (
              <div className="divide-y divide-primary/5">
                {scans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition group"
                  >
                    <div>
                      <p className="font-medium text-text">
                        {scan.primary_concern} · {scan.severity} severity
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {new Date(scan.created_at).toLocaleString()} ·{' '}
                        {Math.round(scan.confidence * 100)}% confidence
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDelete(scan.id)}
                      className="p-2 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                      aria-label="Delete scan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
