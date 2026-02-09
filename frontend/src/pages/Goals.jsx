import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Target, Trash2, Edit2, CheckCircle, Sparkles, Loader2, Check, X } from 'lucide-react';

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(null); // ID of goal being analyzed
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    try {
      const response = await api.get(`/goals?userId=${user?.id}`);
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', {
        title,
        description,
        targetDate,
        progress,
        userId: user.id
      });
      setShowModal(false);
      resetForm();
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleDeleteGoal = async (id) => {
    if(!window.confirm("Are you sure you want to delete this goal?")) return;
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleUpdateProgress = async (goal, newProgress) => {
    if (newProgress < 0 || newProgress > 100) return;
    try {
       await api.put(`/goals/${goal.id}`, { 
           progress: newProgress,
           status: newProgress === 100 ? 'completed' : 'in-progress'
       });
       fetchGoals();
    } catch (error) {
       console.error('Error updating progress:', error);
    }
  };

  const handleGenerateSubGoals = async (goalId) => {
    setGeneratingAI(goalId);
    try {
      await api.post(`/goals/${goalId}/generate-subgoals`, {}, {
        headers: { 'user-id': user?.id }
      });
      fetchGoals();
    } catch (error) {
      console.error('Error generating sub-goals:', error);
      alert(error.response?.data?.message || "Failed to generate sub-goals");
    } finally {
      setGeneratingAI(null);
    }
  };

  const [editingSubGoal, setEditingSubGoal] = useState(null); // { id, title, reminderTime }
  const [tempReminder, setTempReminder] = useState('');

  const handleUpdateSubGoal = async (id, data) => {
    try {
      await api.put(`/subgoals/${id}`, data, {
        headers: { 'user-id': user?.id }
      });
      fetchGoals();
      setEditingSubGoal(null);
    } catch (error) {
      console.error('Error updating sub-goal:', error);
    }
  };

  const handleToggleSubGoal = async (subGoalId) => {
    try {
      await api.put(`/subgoals/${subGoalId}/toggle`, {}, {
        headers: { 'user-id': user?.id }
      });
      fetchGoals();
    } catch (error) {
      console.error('Error toggling sub-goal:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTargetDate('');
    setProgress(0);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2">My Goals</h1>
           <p className="text-slate-400">Track your long-term objectives and milestones.</p>
        </div>
        <button 
           onClick={() => setShowModal(true)}
           className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
        >
           <Plus size={20} />
           New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
         {goals.map(goal => (
            <div key={goal.id} className="card group hover:border-primary-500/50 transition flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-primary-900/30 rounded-lg text-primary-400">
                        <Target size={24} />
                    </div>
                    <button 
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{goal.title}</h3>
                <p className="text-slate-400 text-sm mb-4 min-h-[40px]">{goal.description}</p>
                
                {goal.targetDate && (
                    <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-4">
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                )}

                <div className="mb-2 flex justify-between text-sm">
                   <span className="text-slate-300">Progress</span>
                   <span className="text-primary-400 font-bold">{goal.progress}%</span>
                </div>
                
                <div className="w-full bg-slate-700 rounded-full h-2.5 mb-6">
                    <div 
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${goal.progress}%` }}
                    ></div>
                </div>

                {/* Sub-goals Section */}
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Milestones</h4>
                    {(!goal.subGoals || goal.subGoals.length === 0) && (
                      <button 
                        onClick={() => handleGenerateSubGoals(goal.id)}
                        disabled={generatingAI === goal.id}
                        className="text-xs flex items-center gap-1.5 py-1.5 px-3 bg-secondary-900/20 text-secondary-400 border border-secondary-500/30 rounded-full hover:bg-secondary-900/40 transition disabled:opacity-50"
                      >
                        {generatingAI === goal.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        AI Breakdown
                      </button>
                    )}
                  </div>

                  {goal.subGoals && goal.subGoals.length > 0 ? (
                    <div className="space-y-3 mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                      {goal.subGoals.map(sg => (
                        <div key={sg.id} className="flex items-start gap-3 group/item">
                          <button 
                            onClick={() => handleToggleSubGoal(sg.id)}
                            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition ${
                              sg.completed 
                                ? 'bg-primary-500 border-primary-500 text-white' 
                                : 'border-slate-600 hover:border-primary-400 text-transparent'
                            }`}
                          >
                            <Check size={12} strokeWidth={4} />
                          </button>
                          <div className="flex-grow">
                             <p className={`text-sm font-medium transition ${sg.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                {sg.title}
                             </p>
                             {sg.description && !sg.completed && (
                               <p className="text-xs text-slate-500 mt-0.5">{sg.description}</p>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-slate-700 rounded-xl mb-6">
                      <p className="text-xs text-slate-500">No milestones yet. Use the "AI Breakdown" to generate some!</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between gap-2 mt-auto">
                    {(!goal.subGoals || goal.subGoals.length === 0) ? (
                      <>
                        <button 
                            onClick={() => handleUpdateProgress(goal, Math.max(0, goal.progress - 10))}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-lg transition"
                            disabled={goal.progress <= 0}
                        >
                            -10% Manual
                        </button>
                        <button 
                             onClick={() => handleUpdateProgress(goal, Math.min(100, goal.progress + 10))}
                             className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-lg transition"
                             disabled={goal.progress >= 100}
                        >
                            +10% Manual
                        </button>
                      </>
                    ) : (
                      <div className="w-full text-center py-2 text-xs text-slate-500 bg-slate-800/50 rounded-lg italic">
                        Progress automatically calculated from milestones
                      </div>
                    )}
                </div>
            </div>
         ))}
         
         {goals.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
                <Target size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg">No goals set yet.</p>
                <p>Start by creating a new goal to track your progress.</p>
            </div>
         )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Create New Goal</h2>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleCreateGoal} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Title</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            required
                            placeholder="e.g. Master React Frontend Development"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Description</label>
                        <textarea 
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none h-24 resize-none"
                            placeholder="Add some context to your goal..."
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Target Date</label>
                        <input 
                            type="date" 
                            value={targetDate}
                            onChange={e => setTargetDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg transition mt-6 shadow-lg shadow-primary-500/20"
                    >
                        Create Goal
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
