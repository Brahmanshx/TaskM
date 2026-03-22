import { useState, useEffect } from 'react';
import { analyticsAPI } from '../api/axios';
import { PageLoader } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  TrendingUp, 
  Flame, 
  Target, 
  Calendar, 
  Zap,
  ArrowUpRight,
  Activity,
  ChevronRight,
  Clock
} from 'lucide-react';

export default function AnalyticsPage() {
  const [productivity, setProductivity] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [period, setPeriod] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const [prodRes, streakRes] = await Promise.all([
        analyticsAPI.getProductivity(period),
        analyticsAPI.getStreaks(),
      ]);
      setProductivity(prodRes.data);
      setStreakData(streakRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 py-20 space-y-10">
      <div className="h-20 w-1/3 skeleton" />
      <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 skeleton rounded-3xl" />)}
      </div>
      <div className="h-[400px] skeleton rounded-[40px]" />
    </div>
  );

  if (!productivity) return <EmptyState type="analytics" />;

  const { dailyStats, overview } = productivity;

  const chartData = dailyStats.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }), 
    completed: d.completed,
    created: d.created,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-brand-950/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
        <p className="text-xs font-black uppercase tracking-widest text-surface-500 mb-3">{label} Performance</p>
        <div className="space-y-2">
          {payload.map((p) => (
            <div key={p.name} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <p className="text-sm font-bold text-white">
                {p.name}: <span className="text-surface-300 ml-1">{p.value}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 animate-reveal">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Performance <span className="text-gradient">Insights</span></h1>
          <p className="text-surface-500 mt-2 font-medium">Analyze your productivity trends and build long-term consistency.</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-brand-900 border border-white/5 rounded-2xl w-fit">
          {[
            { value: 7, label: '7 Days' },
            { value: 14, label: '14 Days' },
            { value: 30, label: '30 Days' },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all
                ${period === p.value 
                  ? 'bg-brand-800 text-white shadow-lg' 
                  : 'text-surface-500 hover:text-surface-300 hover:bg-white/5'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {/* Stats Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tasks', value: overview.totalTasks, icon: Target, color: 'text-primary-400', bg: 'bg-primary-400/10' },
          { label: 'Completion', value: `${overview.completionRate}%`, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Current Streak', value: streakData?.currentStreak || 0, icon: Flame, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Best Streak', value: streakData?.longestStreak || 0, icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-[32px] flex flex-col justify-between">
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-6`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div>
              <p className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </section>

      {/* Main Charts Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Productivity Trends */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[40px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8">
            <Activity className="text-surface-800 w-32 h-32 -mr-10 -mt-10" />
          </div>
          <div className="relative mb-8">
            <h3 className="text-xl font-bold text-white mb-1">Productivity Trends</h3>
            <p className="text-sm text-surface-500 font-medium">Comparison between created and completed tasks.</p>
          </div>
          
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCompleted)" 
                  name="Completed" 
                />
                <Area 
                  type="monotone" 
                  dataKey="created" 
                  stroke="#475569" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fillOpacity={1} 
                  fill="url(#colorCreated)" 
                  name="Created" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Efficiency Breakdown */}
        <div className="glass-card p-8 rounded-[40px] flex flex-col">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-1">Efficiency</h3>
            <p className="text-sm text-surface-500 font-medium">Daily output volume.</p>
          </div>

          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="completed" 
                  fill="#6366f1" 
                  radius={[8, 8, 8, 8]} 
                  barSize={12}
                  name="Completed" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white">Daily Average</span>
              <span className="text-lg font-black text-primary-400">
                {(overview.completedTasks / period).toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-surface-600 font-bold uppercase tracking-widest leading-relaxed">
              Based on your activity over the last {period} days.
            </p>
          </div>
        </div>
      </div>

      {/* Heatmap/Activity History */}
      {streakData?.history?.length > 0 && (
        <section className="glass-card p-8 rounded-[40px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-900 border border-white/5 rounded-xl flex items-center justify-center">
                <Calendar size={20} className="text-surface-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Activity Heatmap</h3>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-surface-600">
              <span>Less</span>
              <div className="flex gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-brand-950 border border-white/5" />
                <div className="w-3.5 h-3.5 rounded bg-primary-900/40" />
                <div className="w-3.5 h-3.5 rounded bg-primary-700/60" />
                <div className="w-3.5 h-3.5 rounded bg-primary-500" />
              </div>
              <span>More</span>
            </div>
          </div>
          
          <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-28 gap-3">
            {streakData.history.slice(0, 28).reverse().map((s, i) => (
              <div
                key={i}
                title={`${new Date(s.date).toLocaleDateString()}: ${s.tasksCompleted} tasks`}
                className={`aspect-square rounded-lg transition-all duration-300 transform hover:scale-110 cursor-help
                  ${s.tasksCompleted >= 5 ? 'bg-primary-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' :
                    s.tasksCompleted >= 3 ? 'bg-primary-600/60 shadow-lg' :
                    s.tasksCompleted >= 1 ? 'bg-primary-700/40' :
                    'bg-brand-950 border border-white/5'}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Insight Card */}
      <section className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-[40px] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 blur-[100px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl">
            <h3 className="text-3xl font-black mb-4">You're becoming a consistency machine.</h3>
            <p className="text-lg font-medium text-white/80 leading-relaxed">
              Your completion rate has increased by 12% in the last {period} days. Keeping this momentum will help you reach your Vision Layer goals 3 weeks faster than projected.
            </p>
          </div>
          <button className="px-8 py-4 bg-white text-brand-950 font-black rounded-2xl hover:scale-105 transition-all shadow-2xl flex items-center gap-2 group whitespace-nowrap">
            View Pro Report
            <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
}
