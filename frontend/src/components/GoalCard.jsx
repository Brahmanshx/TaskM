import { Target, ChevronRight, Edit3, Trash2, Calendar, Layers } from 'lucide-react';
import ProgressBar from './ProgressBar';
import { getGoalTypeLabel, getGoalTypeColor } from '../utils/helpers';

export default function GoalCard({ goal, onEdit, onDelete, onClick, compact = false }) {
  const progressColor = goal.progress >= 80 ? 'success' : goal.progress >= 40 ? 'primary' : 'warning';

  if (compact) {
    return (
      <div
        className="glass-card p-4 group cursor-pointer hover:bg-white/5 transition-all animate-reveal"
        onClick={() => onClick?.(goal)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-brand-900 border border-white/5 flex items-center justify-center shrink-0`}>
            <Target size={14} className={`${getGoalTypeColor(goal.type)} fill-current/10`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white truncate mb-1">{goal.title}</h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-brand-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-surface-400 rounded-full transition-all duration-1000`} 
                  style={{ width: `${goal.progress}%` }} 
                />
              </div>
              <span className="text-[10px] font-black text-surface-500">{goal.progress}%</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-surface-600 group-hover:text-white transition-colors" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass-card p-6 group cursor-pointer transition-all duration-300 animate-reveal"
      onClick={() => onClick?.(goal)}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-brand-900 border border-white/5 flex items-center justify-center shadow-lg`}>
            <Target size={24} className={getGoalTypeColor(goal.type)} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-none mb-2 line-clamp-1">{goal.title}</h3>
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-brand-900 border border-white/5 text-[10px] font-black uppercase tracking-widest ${getGoalTypeColor(goal.type)}`}>
              {getGoalTypeLabel(goal.type)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(goal); }}
            className="p-2 rounded-xl text-surface-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(goal._id); }}
            className="p-2 rounded-xl text-surface-500 hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {goal.description && (
        <p className="text-sm text-surface-500 line-clamp-2 mb-6 leading-relaxed font-medium">{goal.description}</p>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
          <span className="text-surface-600">Overall Progress</span>
          <span className="text-white">{goal.progress}%</span>
        </div>
        <ProgressBar value={goal.progress} size="md" color="auto" />
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
        <div className="flex items-center gap-4">
          {goal.totalTasks !== undefined && (
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-surface-500">
              <Layers size={12} className="text-surface-600" />
              <span>{goal.completedTasks}/{goal.totalTasks} Tasks</span>
            </div>
          )}
          {goal.childGoals > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-surface-500">
              <Calendar size={12} className="text-surface-600" />
              <span>{goal.childGoals} Sub-goals</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-primary-400 group-hover:gap-2 transition-all">
          Details
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
}
