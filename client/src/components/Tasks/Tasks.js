import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/axios';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban'); // kanban, list
  const [filter, setFilter] = useState({
    project: '',
    priority: '',
    status: '',
    assignedTo: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'medium',
    status: 'todo',
    assignedToId: '',
    dueDate: '',
    estimatedHours: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      console.log('🔍 TASKS COMPONENT: Fetching tasks...');
      
      const queryParams = new URLSearchParams();
      Object.entries(filter).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await api.get(`/tasks?${queryParams}`);
      console.log('🔍 TASKS COMPONENT: API response:', response.data);
      
      if (response.data.success) {
        const tasksData = response.data.data.tasks || [];
        console.log('✅ TASKS COMPONENT: Tasks loaded:', tasksData.length, 'tasks');
        console.log('✅ TASKS COMPONENT: Task details:', tasksData.map(t => ({ title: t.title, status: t.status })));
        setTasks(tasksData);
      } else {
        console.log('❌ TASKS COMPONENT: API returned success: false');
      }
    } catch (error) {
      console.error('❌ TASKS COMPONENT: Error fetching tasks:', error);
      console.error('❌ TASKS COMPONENT: Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      console.log('🔍 TASKS COMPONENT: Fetching projects...');
      const response = await api.get('/projects');
      console.log('🔍 TASKS COMPONENT: Projects response:', response.data);
      
      if (response.data.success) {
        setProjects(response.data.data.projects || []);
      }
    } catch (error) {
      console.error('❌ TASKS COMPONENT: Error fetching projects:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      console.log('🔍 TASKS COMPONENT: Creating task:', taskForm);
      const response = await api.post('/tasks', taskForm);
      console.log('🔍 TASKS COMPONENT: Create task response:', response.data);
      
      if (response.data.success) {
        setTasks([...tasks, response.data.data.task]);
        setShowCreateModal(false);
        setTaskForm({
          title: '',
          description: '',
          projectId: '',
          priority: 'medium',
          status: 'todo',
          assignedToId: '',
          dueDate: '',
          estimatedHours: ''
        });
      }
    } catch (error) {
      console.error('❌ TASKS COMPONENT: Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      console.log('🔍 TASKS COMPONENT: Updating task:', taskId, updates);
      const response = await api.put(`/tasks/${taskId}`, updates);
      console.log('🔍 TASKS COMPONENT: Update task response:', response.data);
      
      if (response.data.success) {
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        ));
      }
    } catch (error) {
      console.error('❌ TASKS COMPONENT: Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setTasks(tasks.filter(task => task.id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    handleUpdateTask(taskId, { status: newStatus });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-slate-700/50 text-slate-300 border border-slate-600';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'review': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      default: return 'bg-slate-700/50 text-slate-300 border border-slate-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'medium': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'low': return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  };

  const kanbanColumns = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-800/50 border border-slate-700' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-900/30 border border-blue-700/50' },
    { id: 'review', title: 'Review', color: 'bg-yellow-900/30 border border-yellow-700/50' },
    { id: 'completed', title: 'Completed', color: 'bg-emerald-900/30 border border-emerald-700/50' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-primary-900 to-dark-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Task Management
            </h1>
            <p className="text-dark-300 mt-2">Organize and track your team's work efficiently</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setView(view === 'kanban' ? 'list' : 'kanban')}
              className="px-6 py-3 bg-dark-800 border border-dark-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
            >
              <span>{view === 'kanban' ? '📋' : '📊'}</span>
              <span className="font-medium">{view === 'kanban' ? 'List View' : 'Kanban View'}</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
            >
              <span className="text-lg">+</span>
              <span className="font-medium">New Task</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Filters</h3>
            <button
              onClick={() => setFilter({ project: '', priority: '', status: '', assignedTo: '' })}
              className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Project</label>
              <select
                value={filter.project}
                onChange={(e) => setFilter({ ...filter, project: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
              <select
                value={filter.priority}
                onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Assigned To</label>
              <select
                value={filter.assignedTo}
                onChange={(e) => setFilter({ ...filter, assignedTo: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Users</option>
                <option value={user?.id}>Me</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kanban View */}
        {view === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kanbanColumns.map(column => (
                          <div key={column.id} className={`${column.color} p-6 rounded-2xl border border-slate-700`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white text-lg">{column.title}</h3>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium text-white">
                  {tasks.filter(task => task.status === column.id).length}
                </span>
              </div>
                <div
                  className="min-h-96 space-y-4"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  {tasks
                    .filter(task => task.status === column.id)
                    .map(task => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="bg-slate-800 p-5 rounded-xl shadow-md border border-slate-600 cursor-move hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-white text-sm leading-tight">{task.title}</h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingTask(task)}
                              className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-300 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
                        <div className="flex justify-between items-center">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-gray-400 font-medium">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-500">{task.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {projects.find(p => p.id === task.projectId)?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select
                  value={taskForm.projectId}
                  onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Tasks;
