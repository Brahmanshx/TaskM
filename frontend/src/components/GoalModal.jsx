import { X, Calendar, Target, ChevronRight, Info, Layers, ArrowRight } from 'lucide-react';

export default function GoalModal({ isOpen, onClose, onSubmit, goal = null, goals = [] }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'short-term',
    startDate: '',
    targetDate: '',
    parentGoalId: '',
  });

  useEffect(() => {
    if (goal) {
      setForm({
        title: goal.title || '',
        description: goal.description || '',
        type: goal.type || 'short-term',
        startDate: goal.startDate ? new Date(goal.startDate).toISOString().split('T')[0] : '',
        targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
        parentGoalId: goal.parentGoalId?._id || goal.parentGoalId || '',
      });
    } else {
      setForm({ 
        title: '', 
        description: '', 
        type: 'short-term', 
        startDate: new Date().toISOString().split('T')[0], 
        targetDate: '', 
        parentGoalId: '' 
      });
    }
  }, [goal, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      parentGoalId: form.parentGoalId || null,
    });
  };

  const parentOptions = goals.filter((g) => {
    if (goal && g._id === goal._id) return false;
    if (form.type === 'day-to-day') return g.type === 'short-term';
    if (form.type === 'short-term') return g.type === 'long-term';
    return false;
  });

  if (!isOpen) return null;

  const typeConfig = {
    'day-to-day': { label: 'Execution', icon: '📋', desc: '1-2 days', color: 'text-success', bg: 'bg-success/5', border: 'border-success/20' },
    'short-term': { label: 'Planning', icon: '🎯', desc: 'Weeks/Months', color: 'text-warning', bg: 'bg-warning/5', border: 'border-warning/20' },
    'long-term': { label: 'Vision', icon: '🏔️', desc: 'Months/Years', color: 'text-primary-400', bg: 'bg-primary-400/5', border: 'border-primary-400/20' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-brand-950/80 backdrop-blur-sm animate-fade-in" 
        onClick={onClose} 
      />
      
      <div className="relative glass-card w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col rounded-[32px] animate-reveal shadow-2xl border-white/5">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {goal ? 'Edit Global Goal' : 'Define New Goal'}
            </h2>
            <p className="text-sm text-surface-500 font-medium mt-1">Connect your daily habits to your long-term vision.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-xl bg-brand-900 border border-white/5 text-surface-500 hover:text-white transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          {/* Goal Type selector */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 flex items-center gap-2">
              <Layers size={12} className="text-primary-400" /> Strategic Layer
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(typeConfig).map(([type, config]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, type, parentGoalId: '' })}
                  className={`relative p-4 rounded-2xl border transition-all text-left group
                    ${form.type === type 
                      ? `${config.border} ${config.bg} shadow-lg` 
                      : 'border-white/5 bg-brand-900/50 hover:border-white/10'}`}
                >
                  <div className="text-2xl mb-2">{config.icon}</div>
                  <div className={`text-sm font-bold leading-none mb-1 ${form.type === type ? config.color : 'text-white'}`}>
                    {config.label}
                  </div>
                  <div className="text-[10px] text-surface-500 font-medium">
                    {config.desc}
                  </div>
                  {form.type === type && (
                    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${config.color.replace('text', 'bg')}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Title Area */}
          <div className="space-y-4 pt-4">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What is your objective?"
              required
              className="w-full bg-transparent border-none p-0 text-3xl font-extrabold text-white placeholder:text-surface-700 focus:outline-none focus:ring-0 transition-all font-display"
            />
            <div className="flex items-center gap-3 text-surface-500 border-b border-white/5 pb-4">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Briefly describe the outcome you want to achieve..."
                rows={1}
                className="w-full bg-transparent border-none p-0 text-base font-medium placeholder:text-surface-600 focus:outline-none focus:ring-0 resize-none"
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Start Date */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 flex items-center gap-2">
                <Calendar size={12} className="text-primary-400" /> Start Date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full bg-brand-900 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-primary-500 transition-all [color-scheme:dark]"
              />
            </div>

            {/* Target Date */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 flex items-center gap-2">
                <Calendar size={12} className="text-primary-400" /> Target Date
              </label>
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                required
                className="w-full bg-brand-900 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-primary-500 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Parent Association */}
          {parentOptions.length > 0 && (
            <div className="space-y-3 animate-fade-in">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 flex items-center gap-2">
                <Target size={12} className="text-primary-400" /> Connect to Hierarchy
              </label>
              <div className="relative group">
                <select
                  value={form.parentGoalId}
                  onChange={(e) => setForm({ ...form, parentGoalId: e.target.value })}
                  className="w-full appearance-none bg-brand-900 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-primary-500 transition-all cursor-pointer"
                >
                  <option value="">Independent Goal</option>
                  {parentOptions.map((g) => (
                    <option key={g._id} value={g._id}>{g.title}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-surface-500">
                  <ChevronRight size={16} className="rotate-90" />
                </div>
              </div>
              <p className="text-[10px] text-surface-600 font-bold uppercase tracking-wider pl-1 flex items-center gap-1.5">
                <Info size={10} /> {form.type === 'day-to-day' ? 'Associate with a Short-Term Planning goal.' : 'Associate with a Long-Term Vision goal.'}
              </p>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="p-8 bg-brand-900/50 border-t border-white/5 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl text-surface-400 font-bold hover:text-white transition-all bg-brand-900 border border-white/5 hover:border-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-[2] py-4 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold transition-all shadow-2xl shadow-primary-600/20 flex items-center justify-center gap-2 group"
          >
            {goal ? 'Update Goal' : 'Establish Goal'}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
