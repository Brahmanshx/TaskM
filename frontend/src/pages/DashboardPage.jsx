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
  ChevronRight,
  PlusCircle
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
  const [selectedSlot, setSelectedSlot] = useState(null);

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
      toast.success('Task status updated!');
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleCreateTask = async (data) => {
    try {
      await tasksAPI.create(data);
      setTaskModal(false);
      setSelectedSlot(null);
      fetchData();
      toast.success('Task created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleCreateGoal = async (data) => {
    try {
      await goalsAPI.create(data);
      setGoalModal(false);
      fetchData();
      toast.success('Goal established!');
    } catch (err) {
      toast.error('Failed to create goal');
    }
  };

  // Filter tasks for today's agenda (3-4 primary tasks)
  const isToday = (date) => {
    if (!date) return false;
    const d = new Date(date);
    const today = new Date();
    return d.getDate() === today.getDate() && 
           d.getMonth() === today.getMonth() && 
           d.getFullYear() === today.getFullYear();
  };

  const todayTasks = tasks.filter(t => isToday(t.deadline)).sort((a, b) => {
    if (a.timeBlock?.start && b.timeBlock?.start) {
      return a.timeBlock.start.localeCompare(b.timeBlock.start);
    }
    return b.priorityScore - a.priorityScore;
  });

  const overdueTasks = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status === 'pending');

  const visionGoals = goals.filter(g => g.type === 'long-term');
  const planningGoals = goals.filter(g => g.type === 'short-term');
  const executionGoals = goals.filter(g => g.type === 'day-to-day');

  // Agenda Slots (4 slots for daily focus)
  const agendaSlots = [
    { label: 'Primary Focus', slot: 1 },
    { label: 'Secondary Focus', slot: 2 },
    { label: 'Standard Task', slot: 3 },
    { label: 'Standard Task', slot: 4 },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div className="h-20 w-1/3 skeleton" />
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 skeleton rounded-3xl" />)}
        </div>
        <div className="h-[500px] skeleton rounded-[40px]" />
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
          <p className="text-surface-400 mt-2 font-medium">You have {todayTasks.length} objectives scheduled for your daily agenda.</p>
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
          { label: 'Today Done', value: todayTasks.filter(t => t.status === 'completed').length, total: todayTasks.length, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Total Pending', value: stats?.pendingTasks || 0, icon: Clock, color: 'text-primary-400', bg: 'bg-primary-400/10' },
          { label: 'Overdue', value: overdueTasks.length, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10' },
          { label: 'Focus Streak', value: streakData?.currentStreak || 0, icon: Flame, color: 'text-warning', bg: 'bg-warning/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-3xl flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black text-white">
                {stat.value}{stat.total !== undefined && <span className="text-lg text-surface-600 font-bold ml-1">/ {stat.total}</span>}
              </h3>
            </div>
            <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center`}>
              <stat.icon size={28} className={stat.color} />
            </div>
          </div>
        ))}
      </section>

      {/* Main Layout */}
      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left Column: Daily Agenda */}
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-card p-8 rounded-[40px] border-white/5 bg-brand-900/40">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
                  <Zap size={22} className="text-warning fill-warning/20" />
                </div>
                Daily Agenda
              </h2>
              <div className="px-4 py-1.5 rounded-full bg-brand-950 border border-white/5 text-[10px] font-black uppercase tracking-widest text-surface-500">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'long' })}
              </div>
            </div>

            {/* Structured Slots */}
            <div className="space-y-4">
              {agendaSlots.map((slot, i) => {
                const taskInSlot = todayTasks[i];
                return (
                  <div key={i} className={`relative flex items-center gap-6 p-1 transition-all`}>
                    {/* Time Slot Marker */}
                    <div className="w-20 text-right">
                      <p className="text-[10px] font-black text-surface-600 uppercase tracking-widest mb-1">{slot.label}</p>
                      <p className="text-xs font-bold text-surface-400">
                        {taskInSlot?.timeBlock?.start || `--:--`}
                      </p>
                    </div>

                    {/* Connection Line */}
                    <div className="relative flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 transition-all ${taskInSlot ? (taskInSlot.status === 'completed' ? 'bg-success border-success' : 'bg-primary-500 border-primary-500 ring-4 ring-primary-500/10') : 'border-white/10 bg-brand-950'}`} />
                      {i < 3 && <div className="w-px h-16 bg-white/5 mt-1" />}
                    </div>

                    {/* Task Card or Placeholder */}
                    <div className="flex-1">
                      {taskInSlot ? (
                        <TaskCard 
                          task={taskInSlot} 
                          onComplete={handleCompleteTask}
                          className="hover:scale-[1.01] hover:shadow-2xl transition-all"
                        />
                      ) : (
                        <button 
                          onClick={() => { setSelectedSlot(slot.slot); setTaskModal(true); }}
                          className="w-full h-20 border-2 border-dashed border-white/5 hover:border-primary-500/30 bg-brand-950/50 hover:bg-primary-500/5 rounded-[24px] flex items-center justify-center gap-3 group transition-all"
                        >
                          <PlusCircle size={20} className="text-surface-700 group-hover:text-primary-500 transition-colors" />
                          <span className="text-sm font-bold text-surface-600 group-hover:text-primary-400 transition-colors">Plan {slot.label}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Remaining Tasks of the Day */}
            {todayTasks.length > 4 && (
              <div className="mt-10 pt-8 border-t border-white/5">
                <h3 className="text-sm font-black text-surface-600 uppercase tracking-[0.2em] mb-4 pl-4">Additional Tasks</h3>
                <div className="space-y-3">
                  {todayTasks.slice(4).map((task, i) => (
                    <TaskCard key={task._id} task={task} onComplete={handleCompleteTask} />
                  ))}
                </div>
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
                  <p className="text-surface-500 font-medium">You have completed {todayTasks.filter(t => t.status === 'completed').length} of your {todayTasks.length} daily objectives.</p>
                </div>
              </div>
              <div className="flex items-end gap-4">
                <div className="text-right">
                  <p className="text-4xl font-black text-white">{todayTasks.length > 0 ? Math.round((todayTasks.filter(t => t.status === 'completed').length / todayTasks.length) * 100) : 0}%</p>
                  <p className="text-xs font-bold text-primary-500 uppercase tracking-widest">Focus Score</p>
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
                Strategic Core
              </h2>
            </div>

            <div className="space-y-10 relative">
              <div className="absolute left-5 top-10 bottom-10 w-px bg-gradient-to-b from-primary-500/30 via-warning-500/30 to-success-500/30 opacity-20" />

              {[
                { label: 'Vision Layer', icon: '🏔️', color: 'text-primary-400', goals: visionGoals },
                { label: 'Planning Layer', icon: '🎯', color: 'text-warning', goals: planningGoals },
                { label: 'Execution Layer', icon: '📋', color: 'text-success', goals: executionGoals },
              ].map((layer, i) => (
                <div key={i} className="relative pl-12">
                  <div className={`absolute left-[14px] top-1 w-3 h-3 rounded-full border-2 border-brand-950 bg-current shadow-[0_0_10px_rgba(255,255,255,0.1)] ${layer.color}`} />
                  <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${layer.color}`}>
                    {layer.icon} {layer.label}
                  </h4>
                  <div className="space-y-3">
                    {layer.goals.length === 0 ? (
                      <div className="bg-brand-900/30 border border-white/5 rounded-2xl p-4 text-center">
                        <p className="text-[10px] text-surface-600 font-bold uppercase tracking-widest">No Active Objectives</p>
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
              className="w-full mt-10 py-4 bg-brand-900 border border-dashed border-white/10 hover:border-primary-500/50 hover:bg-primary-500/5 text-surface-500 hover:text-primary-400 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group"
            >
              <PlusCircle size={18} className="group-hover:rotate-90 transition-transform" />
              Expand Strategic Core
            </button>
          </section>

          {/* Productivity Tip */}
          <section className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[32px] p-8 text-white shadow-2xl shadow-primary-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full -mr-10 -mt-10" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Zap size={20} className="text-white fill-white/20" />
                <span className="text-xs font-black uppercase tracking-widest text-white/60">Success Logic</span>
              </div>
              <p className="text-xl font-bold leading-tight mb-6">"Discipline is the bridge between goals and accomplishment."</p>
              <div className="flex items-center gap-2 text-sm font-bold opacity-70">
                <Clock size={14} />
                Stick to your time slots today.
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modals with enhanced props */}
      <TaskModal 
        isOpen={taskModal} 
        onClose={() => { setTaskModal(false); setSelectedSlot(null); }} 
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
