import { useState, useEffect } from 'react';
import { tasksAPI, goalsAPI } from '../api/axios';
import GoalCard from '../components/GoalCard';
import GoalModal from '../components/GoalModal';
import TaskModal from '../components/TaskModal';
import EmptyState from '../components/EmptyState';
import ProgressBar from '../components/ProgressBar';
import { SkeletonList } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Target, 
  Mountain, 
  Crosshair, 
  ListChecks, 
  ChevronRight, 
  X,
  Layers,
  Zap,
  Calendar,
  MoreVertical
} from 'lucide-react';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); 
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  useEffect(() => { fetchGoals(); }, [activeTab]);

  const fetchGoals = async () => {
    try {
      const params = {};
      if (activeTab !== 'all') params.type = activeTab;
      const { data } = await goalsAPI.getAll(params);
      setGoals(data);
    } catch (err) {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await goalsAPI.create(data);
      setModalOpen(false);
      fetchGoals();
      toast.success('Goal established successfully');
    } catch (err) {
      toast.error('Failed to create goal');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await goalsAPI.update(editingGoal._id, data);
      setEditingGoal(null);
      fetchGoals();
      toast.success('Goal updated');
    } catch (err) {
      toast.error('Failed to update goal');
    }
  };

  const handleDelete = async (id) => {
    try {
      await goalsAPI.delete(id);
      fetchGoals();
      if (selectedGoal?._id === id) setSelectedGoal(null);
      toast.success('Goal deleted');
    } catch (err) {
      toast.error('Failed to delete goal');
    }
  };

  const handleGoalClick = async (goal) => {
    setSelectedGoal(goal);
    setDetailData(null);
    try {
      const { data } = await goalsAPI.getOne(goal._id);
      setDetailData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskCreate = async (data) => {
    try {
      await tasksAPI.create({ ...data, goalId: selectedGoal?._id || data.goalId });
      setTaskModalOpen(false);
      if (selectedGoal) {
        // Refresh the detail data
        const { data: refreshed } = await goalsAPI.getOne(selectedGoal._id);
        setDetailData(refreshed);
      }
      toast.success('Task scheduled successfully');
    } catch (err) {
      toast.error('Failed to schedule task');
    }
  };

  const tabs = [
    { key: 'all', label: 'Hierarchy', icon: Layers },
    { key: 'long-term', label: 'Vision', icon: Mountain },
    { key: 'short-term', label: 'Planning', icon: Crosshair },
    { key: 'day-to-day', label: 'Execution', icon: ListChecks },
  ];

  const groupedGoals = {
    'long-term': goals.filter(g => g.type === 'long-term'),
    'short-term': goals.filter(g => g.type === 'short-term'),
    'day-to-day': goals.filter(g => g.type === 'day-to-day'),
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 animate-reveal">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Focus <span className="text-gradient">Goals</span></h1>
          <p className="text-surface-500 mt-2 font-medium">Connect your vision to your daily execution system.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-primary-500/20 flex items-center gap-2 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          Establish Goal
        </button>
      </header>

      {/* Modern Tabs */}
      <div className="flex gap-2 p-1.5 bg-brand-900 border border-white/5 rounded-2xl w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setSelectedGoal(null); }}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
              ${activeTab === key
                ? 'bg-brand-800 text-white shadow-lg'
                : 'text-surface-500 hover:text-surface-300 hover:bg-white/5'}`}
          >
            <Icon size={18} className={activeTab === key ? 'text-primary-400' : ''} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 skeleton rounded-3xl" />)}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          type="goals"
          message="Purpose begins with a single objective. Define yours today."
          action="Create First Goal"
          onAction={() => setModalOpen(true)}
        />
      ) : activeTab === 'all' ? (
        /* Enhanced Hierarchy View */
        <div className="space-y-12 relative">
          {/* Main Connector Line */}
          <div className="absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-primary-500/40 via-warning/40 to-success/40 hidden lg:block" />

          {Object.entries({
            'long-term': { label: 'Vision Layer', color: 'text-primary-400', icon: '🏔️' },
            'short-term': { label: 'Planning Layer', color: 'text-warning', icon: '🎯' },
            'day-to-day': { label: 'Execution Layer', color: 'text-success', icon: '️' },
          }).map(([type, config], layerIdx) => (
            <section key={type} className="relative">
              <div className="flex items-center gap-4 mb-8">
                <div className={`px-4 py-1 rounded-full bg-brand-900 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] ${config.color} shadow-sm`}>
                  {config.icon} {config.label}
                </div>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {groupedGoals[type].length === 0 ? (
                <div className="glass-card p-12 rounded-[32px] text-center border-dashed border-white/10 opacity-50">
                  <p className="text-sm font-bold text-surface-600 uppercase tracking-widest">No goals in this layer</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {groupedGoals[type].map((g, i) => (
                    <GoalCard 
                      key={g._id} 
                      goal={g} 
                      onEdit={setEditingGoal} 
                      onDelete={handleDelete} 
                      onClick={handleGoalClick}
                      className={`animate-reveal stagger-${(i%4)+1}`}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g, i) => (
            <GoalCard 
              key={g._id} 
              goal={g} 
              onEdit={setEditingGoal} 
              onDelete={handleDelete} 
              onClick={handleGoalClick}
              className={`animate-reveal stagger-${(i%4)+1}`}
            />
          ))}
        </div>
      )}

      {/* Premium Detail Side Panel */}
      {selectedGoal && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedGoal(null)} />
          
          <div className="relative w-full max-w-lg bg-brand-950/95 backdrop-blur-2xl border-l border-white/10 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] animate-slide-in flex flex-col h-full">
            {/* Panel Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-brand-900/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-900 border border-white/10 flex items-center justify-center">
                  <Target size={24} className="text-primary-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white leading-tight">{selectedGoal.title}</h3>
                  <span className="text-xs font-bold text-surface-500 uppercase tracking-widest">{selectedGoal.type} OBJECTIVE</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedGoal(null)} 
                className="p-2 rounded-xl bg-brand-900 border border-white/5 text-surface-500 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
              {/* Description & Progress */}
              <section className="space-y-6">
                <p className="text-surface-400 text-lg font-medium leading-relaxed">{selectedGoal.description || 'No detailed description provided for this objective.'}</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                    <span className="text-surface-500">Objective Progress</span>
                    <span className="text-primary-400">{selectedGoal.progress}%</span>
                  </div>
                  <ProgressBar value={selectedGoal.progress} size="lg" color="auto" />
                </div>
              </section>

              {/* Sub-Goals Section */}
              {detailData?.childGoals?.length > 0 && (
                <section className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 flex items-center gap-2">
                    <Layers size={14} className="text-warning" /> Nested Objectives
                  </h4>
                  <div className="space-y-3">
                    {detailData.childGoals.map(g => (
                      <div key={g._id} className="glass-card p-4 rounded-2xl border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">{g.title}</p>
                          <ChevronRight size={14} className="text-surface-600" />
                        </div>
                        <ProgressBar value={g.progress} size="sm" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Linked Tasks */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 flex items-center gap-2">
                    <Zap size={14} className="text-success" /> Integrated Actions
                  </h4>
                  <button 
                    onClick={() => setTaskModalOpen(true)}
                    className="text-[10px] font-black uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    + Schedule
                  </button>
                </div>
                <div className="space-y-2">
                  {detailData?.tasks?.length === 0 ? (
                    <p className="text-xs text-surface-600 font-bold italic">No actions scheduled for this objective.</p>
                  ) : (
                    detailData?.tasks?.map(t => (
                      <div key={t._id} className="flex items-center gap-4 bg-brand-900/50 p-4 rounded-2xl border border-white/5">
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 ${t.status === 'completed' ? 'bg-success border-success' : 'border-white/10'}`}>
                          {t.status === 'completed' && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <p className={`text-sm font-bold flex-1 truncate ${t.status === 'completed' ? 'text-surface-600 line-through' : 'text-white'}`}>
                          {t.title}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* Panel Footer */}
            <div className="p-8 pt-0">
               <button 
                onClick={() => { setEditingGoal(selectedGoal); setSelectedGoal(null); }}
                className="w-full py-4 bg-brand-900 border border-white/5 hover:border-white/10 text-white font-bold rounded-2xl transition-all shadow-xl"
              >
                Edit Objective
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <GoalModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} goals={goals} />
      <GoalModal isOpen={!!editingGoal} onClose={() => setEditingGoal(null)} onSubmit={handleUpdate} goal={editingGoal} goals={goals} />
      <TaskModal 
        isOpen={taskModalOpen} 
        onClose={() => setTaskModalOpen(false)} 
        onSubmit={handleTaskCreate}
        task={selectedGoal ? { goalId: selectedGoal._id } : null}
        goals={goals}
      />
    </div>
  );
}
