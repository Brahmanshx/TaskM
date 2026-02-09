import React, { useState, useEffect } from 'react';
import { Plus, Bell, Clock, Trash2, Check, CheckSquare } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [reminderTime, setReminderTime] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        if (user) fetchTasks();
    }, [user]);

    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks', {
                params: { userId: user.id }
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', { 
                title, 
                description,
                userId: user.id,
                reminderTime: reminderTime || null
            });
            setTitle('');
            setDescription('');
            setReminderTime('');
            fetchTasks();
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            fetchTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleUpdateStatus = async (task) => {
        try {
            const newStatus = task.status === 'completed' ? 'pending' : 'completed';
            await api.put(`/tasks/${task.id}`, { status: newStatus });
            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">My Journey</h1>
                    <p className="text-slate-400">Manage your daily tasks and set reminders to stay on track.</p>
                </div>
            </div>
            
            {/* Create Task Form */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl shadow-xl mb-12">
                <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                    <Plus className="text-primary-500" /> Create New Task
                </h2>
                <form onSubmit={handleCreateTask} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider ml-1">Task Title</label>
                            <input
                                type="text"
                                placeholder="What needs to be done?"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider ml-1">Set Reminder</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="datetime-local"
                                    value={reminderTime}
                                    onChange={(e) => setReminderTime(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 text-white p-3 pl-10 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider ml-1">Description</label>
                        <textarea
                            placeholder="Add some details..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition h-24 resize-none"
                        />
                    </div>
                    <button type="submit" className="w-full md:w-auto bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-bold py-3 px-8 rounded-xl transition transform hover:scale-[1.02] active:scale-[0.98]">
                        Build Habit
                    </button>
                </form>
            </div>

            {/* Task List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Tasks</h3>
                    <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full border border-slate-700">
                        {tasks.length} total
                    </span>
                </div>
                
                {tasks.map((task) => (
                    <div key={task.id} className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 p-4 rounded-2xl flex justify-between items-center group hover:bg-slate-800/50 transition duration-300">
                        <div className="flex items-center gap-4">
                            <div className="relative group/check">
                                <input
                                    type="checkbox"
                                    checked={task.status === 'completed'}
                                    onChange={() => handleUpdateStatus(task)}
                                    className="peer opacity-0 absolute w-6 h-6 cursor-pointer z-10"
                                />
                                <div className={clsx(
                                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                    task.status === 'completed' 
                                        ? "bg-primary-500 border-primary-500 text-white" 
                                        : "border-slate-600 group-hover/check:border-primary-500"
                                )}>
                                    {task.status === 'completed' && <Check size={14} strokeWidth={4} />}
                                </div>
                            </div>
                            <div>
                                <h3 className={clsx(
                                    "text-lg font-medium transition-all duration-300",
                                    task.status === 'completed' ? "text-slate-500 line-through" : "text-white"
                                )}>
                                    {task.title}
                                </h3>
                                <div className="flex items-center gap-3 mt-1">
                                    {task.description && (
                                        <p className="text-slate-500 text-sm italic line-clamp-1">{task.description}</p>
                                    )}
                                    {task.reminderTime && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                            <Bell size={10} className="text-amber-500" />
                                            <span className="text-[10px] font-medium text-amber-500">
                                                {new Date(task.reminderTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition duration-300"
                            title="Remove Task"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
                
                {tasks.length === 0 && (
                    <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-700">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckSquare className="text-slate-600" size={32} />
                        </div>
                        <h4 className="text-white font-medium mb-1">Clear Horizon</h4>
                        <p className="text-slate-500 text-sm">No tasks pending. Time to dream big!</p>
                    </div>
                )}
            </div>
        </div>
    );
};


export default Tasks;
