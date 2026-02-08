import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks');
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            // Ideally backend extracts userId from token, but we can pass it if needed.
            // Our controller logic checks headers or body. Axios interceptor adds token.
            // Let's assume backend auth middleware handles it, OR we pass userId.
            // Since we implemented auth logic in user-service but NOT in task-service yet,
            // task-service doesn't know who the user is from the token alone unless it decodes it!
            // Gateway doesn't pass userId automatically yet.
            // So we MUST pass userId in body for now, as per controller logic (step 292).
            
            await api.post('/tasks', { 
                title, 
                description,
                userId: user.id // Pass user ID explicitly
            });
            setTitle('');
            setDescription('');
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
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-white">Tasks</h1>
            
            {/* Create Task Form */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Add New Task</h2>
                <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Task Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-gray-700 text-white p-3 rounded"
                        required
                    />
                    <textarea
                        placeholder="Description (Optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-gray-700 text-white p-3 rounded"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded self-start">
                        Add Task
                    </button>
                </form>
            </div>

            {/* Task List */}
            <div className="grid gap-4">
                {tasks.map((task) => (
                    <div key={task.id} className="bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center transition hover:bg-gray-750">
                        <div className="flex items-center gap-4">
                            <input
                                type="checkbox"
                                checked={task.status === 'completed'}
                                onChange={() => handleUpdateStatus(task)}
                                className="w-5 h-5 text-blue-600 rounded bg-gray-700 border-gray-600 focus:ring-blue-500"
                            />
                            <div>
                                <h3 className={`text-lg font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
                                    {task.title}
                                </h3>
                                <p className="text-gray-400 text-sm">{task.description}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-400 hover:text-red-300 p-2"
                        >
                            Delete
                        </button>
                    </div>
                ))}
                {tasks.length === 0 && (
                    <p className="text-gray-500 text-center">No tasks yet. Create one!</p>
                )}
            </div>
        </div>
    );
};

export default Tasks;
