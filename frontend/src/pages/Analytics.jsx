import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, CheckCircle, Target, TrendingUp } from 'lucide-react';

const Analytics = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [user]);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get(`/analytics/stats?userId=${user?.id}`);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6 text-white">Loading analytics...</div>;
    if (!data) return <div className="p-6 text-white">Failed to load analytics data.</div>;

    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">Productivity Analytics</h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card flex items-center p-4">
                    <div className="p-3 rounded-full bg-blue-500/20 text-blue-500 mr-4">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Total Tasks</p>
                        <h3 className="text-2xl font-bold text-white">{data.overview.totalTasks}</h3>
                    </div>
                </div>
                <div className="card flex items-center p-4">
                    <div className="p-3 rounded-full bg-green-500/20 text-green-500 mr-4">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Completed</p>
                        <h3 className="text-2xl font-bold text-white">{data.overview.completedTasks}</h3>
                    </div>
                </div>
                <div className="card flex items-center p-4">
                    <div className="p-3 rounded-full bg-purple-500/20 text-purple-500 mr-4">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Completion Rate</p>
                        <h3 className="text-2xl font-bold text-white">{data.overview.completionRate}%</h3>
                    </div>
                </div>
                <div className="card flex items-center p-4">
                    <div className="p-3 rounded-full bg-orange-500/20 text-orange-500 mr-4">
                        <Target size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Active Goals</p>
                        <h3 className="text-2xl font-bold text-white">{data.overview.totalGoals}</h3>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Task Distribution */}
                <div className="card min-h-[400px]">
                    <h3 className="text-xl font-bold text-white mb-6">Task Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.taskDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.taskDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} 
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Goal Progress */}
                <div className="card min-h-[400px]">
                    <h3 className="text-xl font-bold text-white mb-6">Goal Progress</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.goalProgress} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                            <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" />
                            <Tooltip 
                                cursor={{fill: '#334155', opacity: 0.4}}
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} 
                            />
                            <Bar dataKey="progress" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
