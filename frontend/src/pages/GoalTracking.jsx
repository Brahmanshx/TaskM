import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Calendar, Plus, Trash2, Edit2, Target } from 'lucide-react';

const GoalTracking = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [progressEntries, setProgressEntries] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [progressValue, setProgressValue] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchGoals();
  }, [user]);

  useEffect(() => {
    if (selectedGoal) {
      fetchProgressEntries(selectedGoal.id);
    }
  }, [selectedGoal]);

  const fetchGoals = async () => {
    try {
      const response = await api.get(`/goals?userId=${user?.id}`);
      setGoals(response.data);
      if (response.data.length > 0 && !selectedGoal) {
        setSelectedGoal(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const fetchProgressEntries = async (goalId) => {
    try {
      const response = await api.get(`/goals/${goalId}/progress`, {
        headers: { 'user-id': user?.id }
      });
      setProgressEntries(response.data);
    } catch (error) {
      console.error('Error fetching progress entries:', error);
    }
  };

  const handleAddProgress = async (e) => {
    e.preventDefault();
    if (!selectedGoal) return;

    try {
      await api.post(`/goals/${selectedGoal.id}/progress`, {
        date,
        progressValue: parseInt(progressValue),
        notes
      }, {
        headers: { 'user-id': user?.id }
      });

      setShowAddForm(false);
      resetForm();
      fetchProgressEntries(selectedGoal.id);
      fetchGoals(); // Refresh to update goal's overall progress
    } catch (error) {
      console.error('Error adding progress:', error);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Delete this progress entry?')) return;

    try {
      await api.delete(`/progress/${entryId}`, {
        headers: { 'user-id': user?.id }
      });
      fetchProgressEntries(selectedGoal.id);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setProgressValue(0);
    setNotes('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Goal Tracking</h1>
          <p className="text-slate-400">Track daily progress for your goals</p>
        </div>
        {selectedGoal && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={20} />
            Add Progress
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goal Selection */}
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-4">Select Goal</h2>
          <div className="space-y-2">
            {goals.map(goal => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                className={`w-full text-left p-3 rounded-lg transition ${
                  selectedGoal?.id === goal.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Target size={16} />
                  <span className="font-semibold">{goal.title}</span>
                </div>
                <div className="text-xs opacity-75">{goal.progress}% complete</div>
              </button>
            ))}
            {goals.length === 0 && (
              <p className="text-slate-500 text-sm">No goals yet. Create one first!</p>
            )}
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-bold text-white mb-4">Progress History</h2>
          
          {selectedGoal ? (
            <div className="space-y-4">
              {progressEntries.length > 0 ? (
                progressEntries.map(entry => (
                  <div key={entry.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-900/30 rounded-lg text-primary-400">
                          <TrendingUp size={20} />
                        </div>
                        <div>
                          <div className="text-white font-semibold">{entry.progressValue}%</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {entry.notes && (
                      <p className="text-slate-300 text-sm mt-2 pl-12">{entry.notes}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No progress entries yet.</p>
                  <p className="text-sm">Start tracking your progress!</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Target size={48} className="mx-auto mb-4 opacity-20" />
              <p>Select a goal to view progress</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Progress Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Add Progress Entry</h2>
            <form onSubmit={handleAddProgress} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Progress Value (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progressValue}
                  onChange={e => setProgressValue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none h-24 resize-none"
                  placeholder="What did you accomplish today?"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalTracking;
