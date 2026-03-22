export default function ProgressBar({ value = 0, size = 'md', showLabel = true, color = 'primary' }) {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const getGradient = () => {
    if (color !== 'auto') {
      const gradients = {
        primary: 'from-primary-600 to-primary-400',
        success: 'from-success to-emerald-400',
        warning: 'from-warning to-amber-400',
        danger: 'from-danger to-rose-400',
      };
      return gradients[color] || gradients.primary;
    }
    
    if (clampedValue >= 80) return 'from-success to-emerald-400';
    if (clampedValue >= 50) return 'from-primary-600 to-primary-400';
    if (clampedValue >= 25) return 'from-warning to-amber-400';
    return 'from-danger to-rose-400';
  };

  return (
    <div className="space-y-2">
      <div className={`w-full bg-brand-900 border border-white/5 rounded-full ${heights[size]} overflow-hidden`}>
        <div
          className={`h-full bg-gradient-to-r ${getGradient()} rounded-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) shadow-[0_0_12px_rgba(99,102,241,0.3)]`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
