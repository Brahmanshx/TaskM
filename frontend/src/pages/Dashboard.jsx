import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Plus } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [dailyTasks, setDailyTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        completed: 0
    });

    useEffect(() => {
        fetchDailyTasks();
        fetchAllStats();
    }, [user]);

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const fetchDailyTasks = async () => {
        try {
            const today = getTodayDate();
            // Assuming getTasks supports filtering by dueDate
            const response = await api.get(`/tasks?userId=${user?.id}&dueDate=${today}`);
            setDailyTasks(response.data);
        } catch (error) {
            console.error("Error fetching daily tasks:", error);
        }
    };

    const fetchAllStats = async () => {
         try {
            const response = await api.get(`/tasks?userId=${user?.id}`);
            const allTasks = response.data;
            setStats({
                total: allTasks.length,
                completed: allTasks.filter(t => t.status === 'completed').length
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }

    const handleAddDailyTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const today = getTodayDate();
            await api.post('/tasks', {
                title: newTaskTitle,
                userId: user.id,
                dueDate: today,
                status: 'pending'
            });
            setNewTaskTitle('');
            fetchDailyTasks();
            fetchAllStats();
        } catch (error) {
            console.error("Error adding daily task:", error);
        }
    };

    const toggleTaskStatus = async (task) => {
        try {
            const newStatus = task.status === 'completed' ? 'pending' : 'completed';
            await api.put(`/tasks/${task.id}`, { status: newStatus });
            fetchDailyTasks();
            fetchAllStats();
        } catch (error) {
             console.error("Error updating task:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { title: 'Total Tasks', value: stats.total, trend: 'All Time', color: 'bg-primary-500' },
                    { title: 'Completed', value: stats.completed, trend: 'All Time', color: 'bg-green-500' },
                    { title: 'Focus Hours', value: '4.5', trend: 'Today', color: 'bg-purple-500' }, // Mock data for now
                    { title: 'Productivity', value: '85%', trend: 'High', color: 'bg-orange-500' }   // Mock data for now
                ].map((stat, i) => (
                    <div key={i} className="card relative overflow-hidden">
                        <div className={`absolute top-0 right-0 p-2 opacity-10`}>
                            <div className={`w-16 h-16 rounded-full ${stat.color}`}></div>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                        <div className="flex items-end space-x-2 mt-2">
                            <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                            <span className="text-sm text-green-400 mb-1">{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card">
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-lg font-semibold">Today's Focus</h3>
                         <span className="text-sm text-slate-400">{new Date().toDateString()}</span>
                    </div>
                    
                    {dailyTasks.length === 0 && (
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mb-4 text-center">
                            <p className="text-slate-300 mb-2">What is your main focus for today?</p>
                        </div>
                    )}

                    {/* Add Task Input */}
                    <form onSubmit={handleAddDailyTask} className="mb-4 flex gap-2">
                        <input 
                            type="text" 
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Add a task for today..." 
                            className="bg-slate-800 text-white p-3 rounded flex-1 border border-slate-700 focus:border-primary-500 focus:outline-none"
                        />
                        <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded flex items-center justify-center">
                            <Plus size={20} />
                        </button>
                    </form>

                    <div className="space-y-3">
                        {dailyTasks.map(task => (
                            <div key={task.id} className="flex items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 transition hover:bg-slate-800">
                                <input 
                                    type="checkbox" 
                                    checked={task.status === 'completed'}
                                    onChange={() => toggleTaskStatus(task)}
                                    className="w-5 h-5 rounded border-slate-600 text-primary-500 focus:ring-offset-0 bg-transparent cursor-pointer" 
                                />
                                <div className="ml-3">
                                    <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'}`}>
                                        {task.title}
                                    </p>
                                    <p className="text-xs text-slate-400">{task.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                     <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
                     <div className="p-4 bg-gradient-to-br from-primary-900/50 to-purple-900/50 rounded-lg border border-primary-800/50">
                        <p className="text-sm text-slate-200">
                            "You're most productive between 10 AM and 12 PM. Try scheduling your deep work blocks then!"
                        </p>
                        <p className="text-xs text-primary-400 mt-2 font-medium">- TaskMind AI</p>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
