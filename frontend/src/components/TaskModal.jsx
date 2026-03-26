import { useState, useEffect } from 'react';
import { X, Calendar, Tag, Clock, Link as LinkIcon, RotateCcw, AlignLeft, ArrowRight, Plus, Target } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSubmit, task = null, goals = [] }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    importance: 3,
    effort: 'medium',
    isBlocked: false,
    goalId: '',
    isRecurring: false,
    recurringPattern: 'none',
    timeBlockStart: '',
    timeBlockEnd: '',
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
        importance: task.importance || 3,
        effort: task.effort || 'medium',
        isBlocked: task.isBlocked || false,
        goalId: task.goalId?._id || task.goalId || '',
        isRecurring: task.isRecurring || false,
        recurringPattern: task.recurringPattern || 'none',
        timeBlockStart: task.timeBlock?.start || '',
        timeBlockEnd: task.timeBlock?.end || '',
      });
    } else {
      setForm({
        title: '', description: '', deadline: '', importance: 3, effort: 'medium',
        isBlocked: false, goalId: '', isRecurring: false, recurringPattern: 'none',
        timeBlockStart: '', timeBlockEnd: '',
      });
    }
  }, [task, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      importance: parseInt(form.importance),
      goalId: form.goalId || null,
      timeBlock: form.timeBlockStart ? { start: form.timeBlockStart, end: form.timeBlockEnd } : { start: null, end: null },
    };
    onSubmit(data);
  };

  if (!isOpen) return null;

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
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-sm text-surface-500 font-medium mt-1">Fill in the details for your next action item.</p>
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
          {/* Title Area */}
          <div className="space-y-4">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What needs to be done?"
              required
              autoFocus
              className="w-full bg-transparent border-none p-0 text-3xl font-extrabold text-white placeholder:text-surface-700 focus:outline-none focus:ring-0 transition-all"
            />
            <div className="flex items-center gap-3 text-surface-500 border-b border-white/5 pb-4">
              <AlignLeft size={18} />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Add a detailed description..."
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
            {/* Importance */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 flex items-center gap-2">
                <Tag size={12} className="text-primary-400" /> Priority Level
              </label>
              <div className="flex gap-2 p-1 bg-brand-900 rounded-2xl border border-white/5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, importance: n })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all
                      ${form.importance === n
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                        : 'text-surface-500 hover:text-surface-300'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 flex items-center gap-2">
                <Calendar size={12} className="text-primary-400" /> Deadline
              </label>
              <input
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                required
                className="w-full bg-brand-900 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Effort */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 block">Effort</label>
              <div className="relative group">
                <select
                  value={form.effort}
                  onChange={(e) => setForm({ ...form, effort: e.target.value })}
                  className="w-full appearance-none bg-brand-900 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-primary-500 transition-all cursor-pointer"
                >
                  <option value="small">Low Effort</option>
                  <option value="medium">Medium Effort</option>
                  <option value="large">High Effort</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-surface-500 group-hover:text-white transition-colors">
                  <Plus size={16} className="rotate-45" />
                </div>
              </div>
            </div>

            {/* Goal Link */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 flex items-center gap-2">
                <LinkIcon size={12} className="text-primary-400" /> Goal Association
              </label>
              <div className="relative group">
                <select
                  value={form.goalId}
                  onChange={(e) => setForm({ ...form, goalId: e.target.value })}
                  className="w-full appearance-none bg-brand-900 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-primary-500 transition-all cursor-pointer"
                >
                  <option value="">No parent goal</option>
                  {goals.map((g) => (
                    <option key={g._id} value={g._id}>{g.title}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-surface-500 group-hover:text-white transition-colors">
                  <Plus size={16} className="rotate-45" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 flex items-center gap-2">
              <Clock size={12} className="text-primary-400" /> Daily Planning (Fixed Time Slot)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <input
                  type="time"
                  value={form.timeBlockStart}
                  onChange={(e) => setForm({ ...form, timeBlockStart: e.target.value })}
                  className="w-full bg-brand-900 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-primary-500 transition-all [color-scheme:dark]"
                />
                <span className="absolute left-4 -top-2 px-2 bg-brand-950 text-[10px] font-bold text-surface-600">Start Time</span>
              </div>
              <div className="relative group">
                <input
                  type="time"
                  value={form.timeBlockEnd}
                  onChange={(e) => setForm({ ...form, timeBlockEnd: e.target.value })}
                  className="w-full bg-brand-900 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-primary-500 transition-all [color-scheme:dark]"
                />
                <span className="absolute left-4 -top-2 px-2 bg-brand-950 text-[10px] font-bold text-surface-600">End Time</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.isBlocked}
                  onChange={(e) => setForm({ ...form, isBlocked: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="w-10 h-6 bg-brand-900 border border-white/10 rounded-full transition-colors peer-checked:bg-danger/20 peer-checked:border-danger/50" />
                <div className="absolute left-1 top-1 w-4 h-4 bg-surface-600 rounded-full transition-all peer-checked:left-5 peer-checked:bg-danger" />
              </div>
              <span className="text-sm font-bold text-surface-500 group-hover:text-surface-300 transition-colors">Is Blocked?</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="w-10 h-6 bg-brand-900 border border-white/10 rounded-full transition-colors peer-checked:bg-primary-600/20 peer-checked:border-primary-600/50" />
                <div className="absolute left-1 top-1 w-4 h-4 bg-surface-600 rounded-full transition-all peer-checked:left-5 peer-checked:bg-primary-500" />
              </div>
              <span className="text-sm font-bold text-surface-500 group-hover:text-surface-300 transition-colors">Recurring Task</span>
            </label>
          </div>
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
            {task ? 'Update Task' : 'Create Task'}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
