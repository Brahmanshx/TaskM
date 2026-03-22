import { CheckSquare, Target, BarChart3, Plus } from 'lucide-react';

export default function EmptyState({ type = 'tasks', message, action, onAction }) {
  const configs = {
    tasks: {
      icon: CheckSquare,
      title: 'Nothing here yet',
      description: message || 'Create your first task to start your productivity journey.',
      gradient: 'from-primary-500/10 to-primary-700/10',
      iconColor: 'text-primary-400',
    },
    goals: {
      icon: Target,
      title: 'No goals defined',
      description: message || 'Set a North Star to give your daily tasks purpose and direction.',
      gradient: 'from-warning/10 to-danger/10',
      iconColor: 'text-warning',
    },
    analytics: {
      icon: BarChart3,
      title: 'No data yet',
      description: message || 'Complete some tasks to unlock your productivity insights.',
      gradient: 'from-success/10 to-info/10',
      iconColor: 'text-success',
    },
  };

  const config = configs[type] || configs.tasks;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 animate-reveal">
      <div className={`w-24 h-24 rounded-[32px] bg-gradient-to-br border border-white/5 ${config.gradient} flex items-center justify-center mb-8 shadow-2xl shadow-black/50`}>
        <Icon size={40} className={config.iconColor} />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{config.title}</h3>
      <p className="text-surface-500 text-center max-w-sm mb-8 leading-relaxed font-medium">
        {config.description}
      </p>
      {action && (
        <button
          onClick={onAction}
          className="px-8 py-4 rounded-2xl bg-brand-900 border border-white/5 hover:border-white/10 text-white font-bold transition-all flex items-center gap-2 group shadow-xl"
        >
          <Plus size={18} className="text-primary-400 group-hover:rotate-90 transition-transform" />
          {action}
        </button>
      )}
    </div>
  );
}
