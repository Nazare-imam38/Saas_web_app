import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    projects: [],
    tasks: [],
    teamMembers: [],
    timeEntries: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch projects
      const projectsResponse = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const projectsData = await projectsResponse.json();
      
      // Fetch tasks
      const tasksResponse = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const tasksData = await tasksResponse.json();
      
      setAnalytics({
        projects: projectsData.data?.projects || [],
        tasks: tasksData.data?.tasks || [],
        teamMembers: [], // Will be populated from projects
        timeEntries: [] // Mock data for now
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalProjects: analytics.projects.length,
    activeProjects: analytics.projects.filter(p => p.status === 'active').length,
    completedProjects: analytics.projects.filter(p => p.status === 'completed').length,
    totalTasks: analytics.tasks.length,
    completedTasks: analytics.tasks.filter(t => t.status === 'completed').length,
    inProgressTasks: analytics.tasks.filter(t => t.status === 'in-progress').length,
    todoTasks: analytics.tasks.filter(t => t.status === 'todo').length,
    teamMembers: new Set(analytics.projects.flatMap(p => p.projectMembers || [])).size
  };

  // Calculate completion rates
  const projectCompletionRate = stats.totalProjects > 0 ? 
    Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0;
  const taskCompletionRate = stats.totalTasks > 0 ? 
    Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  // Priority distribution
  const priorityDistribution = {
    high: analytics.tasks.filter(t => t.priority === 'high').length,
    medium: analytics.tasks.filter(t => t.priority === 'medium').length,
    low: analytics.tasks.filter(t => t.priority === 'low').length,
    urgent: analytics.tasks.filter(t => t.priority === 'urgent').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-300 mt-2">Track your project performance and team productivity</p>
          </div>
          <div className="flex space-x-3">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-600 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100 mb-1">Total Projects</p>
                <p className="text-3xl font-bold text-white">{stats.totalProjects}</p>
                <p className="text-xs text-green-300 mt-1">+12% from last month</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-100 mb-1">Completed Tasks</p>
                <p className="text-3xl font-bold text-white">{stats.completedTasks}</p>
                <p className="text-xs text-green-300 mt-1">+8% from last week</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-orange-600 to-orange-700 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-100 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-white">{stats.inProgressTasks}</p>
                <p className="text-xs text-orange-300 mt-1">Active now</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-100 mb-1">Team Members</p>
                <p className="text-3xl font-bold text-white">{stats.teamMembers}</p>
                <p className="text-xs text-purple-300 mt-1">Growing team</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Status Chart */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-lg border border-slate-700 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Project Status</h3>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-300">Active</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-40 bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${stats.totalProjects > 0 ? (stats.activeProjects / stats.totalProjects) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-white w-8">{stats.activeProjects}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-300">Completed</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-40 bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${projectCompletionRate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-white w-8">{stats.completedProjects}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-300">Planning</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-40 bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${stats.totalProjects > 0 ? ((stats.totalProjects - stats.activeProjects - stats.completedProjects) / stats.totalProjects) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-white w-8">{stats.totalProjects - stats.activeProjects - stats.completedProjects}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Task Priority Distribution */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-lg border border-slate-700 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Task Priority Distribution</h3>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-300">Urgent</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-40 bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-400 to-red-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${stats.totalTasks > 0 ? (priorityDistribution.urgent / stats.totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-white w-8">{priorityDistribution.urgent}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-300">High</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-40 bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${stats.totalTasks > 0 ? (priorityDistribution.high / stats.totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-white w-8">{priorityDistribution.high}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-300">Medium</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-40 bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${stats.totalTasks > 0 ? (priorityDistribution.medium / stats.totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-white w-8">{priorityDistribution.medium}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-300">Low</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-40 bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${stats.totalTasks > 0 ? (priorityDistribution.low / stats.totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-white w-8">{priorityDistribution.low}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Status Overview */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Task Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="text-2xl font-bold text-gray-300">{stats.todoTasks}</div>
            <div className="text-sm text-gray-400">To Do</div>
          </div>
          <div className="text-center p-4 bg-blue-600/20 rounded-lg border border-blue-500/30">
            <div className="text-2xl font-bold text-blue-400">{stats.inProgressTasks}</div>
            <div className="text-sm text-blue-300">In Progress</div>
          </div>
          <div className="text-center p-4 bg-yellow-600/20 rounded-lg border border-yellow-500/30">
            <div className="text-2xl font-bold text-yellow-400">{analytics.tasks.filter(t => t.status === 'review').length}</div>
            <div className="text-sm text-yellow-300">In Review</div>
          </div>
          <div className="text-center p-4 bg-green-600/20 rounded-lg border border-green-500/30">
            <div className="text-2xl font-bold text-green-400">{stats.completedTasks}</div>
            <div className="text-sm text-green-300">Completed</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Projects</h3>
        <div className="space-y-3">
          {analytics.projects.slice(0, 5).map((project) => (
            <div key={project.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div>
                <h4 className="font-medium text-white">{project.name}</h4>
                <p className="text-sm text-gray-300">{project.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  project.status === 'active' ? 'bg-green-600/20 text-green-300 border border-green-500/30' :
                  project.status === 'completed' ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' :
                  'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30'
                }`}>
                  {project.status}
                </span>
                <span className="text-sm text-gray-300">{project.progress}%</span>
              </div>
            </div>
          ))}
          {analytics.projects.length === 0 && (
            <p className="text-gray-400 text-center py-4">No projects found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
