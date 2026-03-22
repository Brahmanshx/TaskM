import { format, formatDistanceToNow, isToday, isTomorrow, isPast, differenceInHours } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM d, yyyy');
};

export const formatDeadline = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isPast(d)) return `Overdue by ${formatDistanceToNow(d)}`;
  const hours = differenceInHours(d, new Date());
  if (hours < 1) return 'Due very soon';
  if (hours < 24) return `Due in ${hours}h`;
  return `Due ${formatDate(date)}`;
};

export const getDeadlineColor = (date) => {
  if (!date) return 'text-surface-400';
  const d = new Date(date);
  if (isPast(d)) return 'text-danger';
  const hours = differenceInHours(d, new Date());
  if (hours < 24) return 'text-warning';
  if (hours < 72) return 'text-primary-300';
  return 'text-surface-400';
};

export const getPriorityClass = (score) => {
  if (score >= 7) return 'priority-critical';
  if (score >= 5) return 'priority-high';
  if (score >= 3) return 'priority-medium';
  return 'priority-low';
};

export const getPriorityLabel = (score) => {
  if (score >= 7) return 'Critical';
  if (score >= 5) return 'High';
  if (score >= 3) return 'Medium';
  return 'Low';
};

export const getPriorityDot = (score) => {
  if (score >= 7) return 'bg-danger';
  if (score >= 5) return 'bg-warning';
  if (score >= 3) return 'bg-info';
  return 'bg-surface-500';
};

export const getGoalTypeLabel = (type) => {
  const labels = {
    'day-to-day': '📋 Day-to-Day',
    'short-term': '🎯 Short-Term',
    'long-term': '🏔️ Long-Term',
  };
  return labels[type] || type;
};

export const getGoalTypeColor = (type) => {
  const colors = {
    'day-to-day': 'text-success',
    'short-term': 'text-warning',
    'long-term': 'text-primary-400',
  };
  return colors[type] || 'text-surface-400';
};
