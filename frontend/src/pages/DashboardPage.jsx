import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, goalsAPI, analyticsAPI } from '../api/axios';
import TaskCard from '../components/TaskCard';
import GoalCard from '../components/GoalCard';
import TaskModal from '../components/TaskModal';
import GoalModal from '../components/GoalModal';
import { SkeletonList } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Flame,
  Target, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Calendar,
  Layout,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(false);
  const [goalModal, setGoalModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, goalsRes, statsRes, streaksRes] = await Promise.all([
        tasksAPI.getAll({ status: 'pending' }),
        goalsAPI.getAll({ status: 'active' }),
        analyticsAPI.getProductivity(7),
        analyticsAPI.getStreaks(),
      ]);
      setTasks(tasksRes.data);
      setGoals(goalsRes.data);
      setStats(statsRes.data.overview);
      setStreakData(streaksRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      await tasksAPI.complete(id);
      fetchData();
      toast.success('Task completed!');
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleCreateTask = async (data) => {
    try {
      await tasksAPI.create(data);
      setTaskModal(false);
      fetchData();
      toast.success('Task created!');
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const handleCreateGoal = async (data) => {
    try {
      await goalsAPI.create(data);
      setGoalModal(false);
      fetchData();
      toast.success('Goal created!');
    } catch (err) {
      toast.error('Failed to create goal');
    }
  };

  const todayTasks = tasks.slice(0, 6); // Simplified for now, usually filtered by date
  const overdueTasks = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date());

  const visionGoals = goals.filter(g => g.type === 'long-term');
  const planningGoals = goals.filter(g => g.type === 'short-term');
  const executionGoals = goals.filter(g => g.type === 'day-to-day');

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div className="h-20 w-1/3 skeleton" />
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 skeleton rounded-3xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <div className="h-64 skeleton rounded-3xl" />
            <div className="h-64 skeleton rounded-3xl" />
          </div>
          <div className="space-y-6">
            <div className="h-full skeleton rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 animate-reveal">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-gradient">{user?.name || user?.email?.split('@')[0]}</span> 👋
          </h1>
          <p className="text-surface-400 mt-2 font-medium">You have {tasks.length} tasks and {overdueTasks.length} urgent items today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setGoalModal(true)}
            className="px-5 py-3 bg-brand-900 border border-white/5 hover:border-white/10 text-white rounded-2xl font-bold transition-all flex items-center gap-2"
          >
            <Target size={18} className="text-primary-400" />
            New Goal
          </button>
          <button 
            onClick={() => setTaskModal(true)}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-primary-500/20 flex items-center gap-2 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            New Task
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Completed', value: stats?.completedTasks || 0, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Pending', value: stats?.pendingTasks || 0, icon: Clock, color: 'text-primary-400', bg: 'bg-primary-400/10' },
          { label: 'Overdue', value: stats?.overdueTasks || 0, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10' },
          { label: 'Streak', value: streakData?.currentStreak || 0, icon: Flame, color: 'text-warning', bg: 'bg-warning/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-3xl flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black text-white">{stat.value}</h3>
            </div>
            <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center`}>
              <stat.icon size={28} className={stat.color} />
            </div>
          </div>
        ))}
      </section>

      {/* Main Layout */}
      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left Column: Today's Focus */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
                  <Zap size={22} className="text-warning fill-warning/20" />
                </div>
                Today's Focus
              </h2>
              <button 
                onClick={() => navigate('/tasks')}
                className="text-sm font-bold text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1 group"
              >
                View all tasks
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="glass-card p-12 rounded-[32px] text-center border-dashed border-white/10">
                <div className="w-20 h-20 bg-brand-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Layout size={32} className="text-surface-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Clear path ahead</h3>
                <p className="text-surface-500 mb-8">You don't have any tasks scheduled for today. <br/>Take a break or plan something new.</p>
                <button 
                  onClick={() => setTaskModal(true)}
                  className="px-6 py-3 bg-brand-900 border border-white/5 hover:border-white/10 text-white rounded-2xl font-bold transition-all"
                >
                  Create First Task
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {todayTasks.map((task, i) => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    onComplete={handleCompleteTask}
                    className={`animate-reveal stagger-${(i%3)+1}`}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Efficiency Metric */}
          <section className="glass-card p-8 rounded-[32px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-primary-600/10 transition-colors" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-600/10 rounded-2xl flex items-center justify-center">
                  <TrendingUp size={28} className="text-primary-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Daily Efficiency</h3>
                  <p className="text-surface-500 font-medium">You are performing in the top 5% today.</p>
                </div>
              </div>
              <div className="flex items-end gap-4">
                <div className="text-right">
                  <p className="text-4xl font-black text-white">{stats?.completionRate || 0}%</p>
                  <p className="text-xs font-bold text-primary-500 uppercase tracking-widest">Completion</p>
                </div>
                <div className="w-32 h-16 flex items-end gap-1.5 pb-2">
                  {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                    <div 
                      key={i} 
                      className={`w-full rounded-t-full transition-all duration-500 ${i === 6 ? 'bg-primary-500 h-full' : 'bg-brand-800 h-['+h+'%]'}`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Goals System */}
        <div className="space-y-10">
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600/10 rounded-xl flex items-center justify-center">
                  <Target size={22} className="text-primary-400 fill-primary-400/20" />
                </div>
                Goals System
              </h2>
            </div>

            <div className="space-y-10 relative">
              {/* Vertical Connector Line */}
              <div className="absolute left-5 top-10 bottom-10 w-px bg-gradient-to-b from-primary-500/50 via-warning-500/50 to-success-500/50 opacity-20" />

              {/* Layers */}
              {[
                { label: 'Vision Layer', icon: '🏔️', color: 'text-primary-400', goals: visionGoals },
                { label: 'Planning Layer', icon: '🎯', color: 'text-warning', goals: planningGoals },
                { label: 'Execution Layer', icon: '️', color: 'text-success', goals: executionGoals },
              ].map((layer, i) => (
                <div key={i} className="relative pl-12">
                  <div className={`absolute left-[14px] top-1 w-3 h-3 rounded-full border-2 border-brand-950 bg-current ${layer.color}`} />
                  <h4 className={`text-xs font-bold uppercase tracking-[0.2em] mb-4 ${layer.color}`}>
                    {layer.icon} {layer.label}
                  </h4>
                  <div className="space-y-3">
                    {layer.goals.length === 0 ? (
                      <div className="bg-brand-900/50 border border-white/5 rounded-2xl p-4 text-center">
                        <p className="text-[10px] text-surface-600 font-bold uppercase tracking-widest">No Active Goals</p>
                      </div>
                    ) : (
                      layer.goals.slice(0, 2).map(goal => (
                        <GoalCard key={goal._id} goal={goal} compact />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setGoalModal(true)}
              className="w-full mt-10 py-4 bg-brand-900 border border-dashed border-white/10 hover:border-primary-500/50 hover:bg-primary-500/5 text-surface-500 hover:text-primary-400 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add New Goal
            </button>
          </section>

          {/* Productivity Tip */}
          <section className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[32px] p-6 text-white shadow-2xl shadow-primary-900/20">
            <div className="flex items-center gap-3 mb-4">
              <Zap size={20} className="text-white fill-white/20" />
              <span className="text-sm font-bold uppercase tracking-wider">Smart Tip</span>
            </div>
            <p className="text-lg font-bold leading-tight mb-4">Focus on your top 3 tasks today to maximize impact.</p>
            <button className="text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all">
              Learn More
            </button>
          </section>
        </div>
      </div>

      {/* Modals */}
      <TaskModal 
        isOpen={taskModal} 
        onClose={() => setTaskModal(false)} 
        onSubmit={handleCreateTask} 
        goals={goals} 
      />
      <GoalModal 
        isOpen={goalModal} 
        onClose={() => setGoalModal(false)} 
        onSubmit={handleCreateGoal} 
        goals={goals} 
      />
    </div>
  );
}
