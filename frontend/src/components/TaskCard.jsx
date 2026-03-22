import { 
  Check, 
  Clock, 
  AlertTriangle, 
  Link as LinkIcon, 
  Trash2, 
  Edit3, 
  RotateCcw,
  Calendar,
  MoreVertical,
  Target
} from 'lucide-react';
import { 
  formatDeadline, 
  getDeadlineColor, 
  getPriorityClass, 
  getPriorityLabel, 
  getPriorityDot 
} from '../utils/helpers';

export default function TaskCard({ task, onComplete, onEdit, onDelete, className = "" }) {
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status === 'pending';
  const isCompleted = task.status === 'completed';

  return (
    <div
      className={`glass-card p-5 group transition-all duration-300 ${className} ${isCompleted ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-4">
        {/* Complete Toggle */}
        <button
          onClick={() => onComplete(task._id)}
          className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0
            transition-all duration-300 ${isCompleted
              ? 'bg-success border-success shadow-lg shadow-success/20'
              : 'border-white/10 hover:border-primary-500 hover:bg-primary-500/10'}`}
        >
          {isCompleted && <Check size={14} className="text-white stroke-[3]" />}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold truncate transition-all ${isCompleted ? 'line-through text-surface-500' : 'text-white'}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-surface-500 line-clamp-1 mt-0.5">{task.description}</p>
              )}
            </div>
            
            {/* Priority Badge */}
            <div className={`px-2 py-1 rounded-lg bg-brand-900 border border-white/5 flex items-center gap-1.5 shrink-0`}>
              <div className={`w-2 h-2 rounded-full ${getPriorityDot(task.priorityScore)}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-surface-400">
                {getPriorityLabel(task.priorityScore)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Deadline */}
            <div className={`flex items-center gap-1.5 text-xs font-bold ${getDeadlineColor(task.deadline)}`}>
              {isOverdue ? <AlertTriangle size={14} /> : <Calendar size={14} />}
              {formatDeadline(task.deadline)}
            </div>

            {/* Goal Tag */}
            {task.goalId && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary-400 bg-primary-400/5 px-2 py-1 rounded-lg border border-primary-400/10">
                <Target size={12} />
                {task.goalId.title || 'Target Goal'}
              </div>
            )}

            {/* Tags/Meta */}
            <div className="flex items-center gap-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onEdit?.(task)}
                className="p-1.5 text-surface-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Edit3 size={16} />
              </button>
              <button 
                onClick={() => onDelete?.(task._id)}
                className="p-1.5 text-surface-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
