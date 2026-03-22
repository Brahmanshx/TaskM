import { useState, useEffect } from 'react';
import { tasksAPI, goalsAPI } from '../api/axios';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Filter, 
  SortDesc, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  Zap,
  LayoutGrid,
  ListFilter
} from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all'); 
  const [sort, setSort] = useState('priority'); 
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [filter, sort]);

  const fetchData = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (sort !== 'priority') params.sort = sort;

      const [tasksRes, goalsRes] = await Promise.all([
        tasksAPI.getAll(params),
        goalsAPI.getAll(),
      ]);
      setTasks(tasksRes.data);
      setGoals(goalsRes.data);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await tasksAPI.create(data);
      setModalOpen(false);
      fetchData();
      toast.success('Task created successfully');
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await tasksAPI.update(editingTask._id, data);
      setEditingTask(null);
      fetchData();
      toast.success('Task updated');
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleComplete = async (id) => {
    try {
      await tasksAPI.complete(id);
      fetchData();
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id) => {
    try {
      await tasksAPI.delete(id);
      fetchData();
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter((t) =>
    search ? t.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const overdueCount = tasks.filter(t => t.status === 'pending' && t.deadline && new Date(t.deadline) < new Date()).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 animate-reveal">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Your <span className="text-gradient">Tasks</span></h1>
          <p className="text-surface-500 mt-2 font-medium">Manage your daily focus and stay on top of your objectives.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-primary-500/20 flex items-center gap-2 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          Create Task
        </button>
      </header>

      {/* Quick Filters / Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'all', label: 'All Tasks', value: tasks.length, icon: LayoutGrid, color: 'text-surface-400' },
          { id: 'pending', label: 'Pending', value: pendingCount, icon: Clock, color: 'text-warning' },
          { id: 'completed', label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-success' },
          { id: 'overdue', label: 'Overdue', value: overdueCount, icon: AlertTriangle, color: 'text-danger' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id === 'overdue' ? filter : item.id === filter ? 'all' : item.id)}
            className={`glass-card p-5 rounded-[24px] flex items-center gap-4 transition-all text-left group
              ${filter === item.id ? 'bg-white/5 border-white/20 ring-2 ring-primary-500/20' : 'hover:bg-white/5'}`}
          >
            <div className={`w-12 h-12 rounded-xl bg-brand-900 border border-white/5 flex items-center justify-center`}>
              <item.icon size={22} className={item.color} />
            </div>
            <div>
              <p className="text-2xl font-black text-white leading-none mb-1">{item.value}</p>
              <p className="text-xs font-bold text-surface-500 uppercase tracking-widest">{item.label}</p>
            </div>
            {filter === item.id && (
              <div className="ml-auto w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Search & Sort Panel */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for tasks, descriptions, or categories..."
            className="w-full bg-brand-950/50 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white font-medium 
                     placeholder:text-surface-700 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-inner"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative group min-w-[160px]">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-600 group-focus-within:text-primary-400">
              <ListFilter size={18} />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full appearance-none bg-brand-950 border border-white/5 rounded-2xl pl-12 pr-10 py-4 text-sm font-bold text-white focus:outline-none focus:border-primary-500 transition-all cursor-pointer shadow-inner"
            >
              <option value="priority">By Priority</option>
              <option value="deadline">By Deadline</option>
              <option value="importance">By Importance</option>
              <option value="created">Recently Added</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-surface-600">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-32 skeleton rounded-3xl" />)}
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            type="tasks"
            message={search ? 'No tasks matched your search criteria.' : 'Take a breath. You have no tasks to complete right now.'}
            action={!search ? 'Create New Task' : undefined}
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTasks.map((task, i) => (
              <TaskCard
                key={task._id}
                task={task}
                onComplete={handleComplete}
                onEdit={(t) => setEditingTask(t)}
                onDelete={handleDelete}
                className={`animate-reveal stagger-${(i%4)+1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        goals={goals}
      />
      <TaskModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdate}
        task={editingTask}
        goals={goals}
      />
    </div>
  );
}
