import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  FolderIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();

  // Mock data - in real app, this would come from API
  const stats = [
    {
      name: 'Active Projects',
      value: '12',
      change: '+2.5%',
      changeType: 'positive',
      icon: FolderIcon,
    },
    {
      name: 'Total Tasks',
      value: '48',
      change: '+12.3%',
      changeType: 'positive',
      icon: ClipboardDocumentListIcon,
    },
    {
      name: 'Hours Tracked',
      value: '156',
      change: '+8.1%',
      changeType: 'positive',
      icon: ClockIcon,
    },
    {
      name: 'Overdue Tasks',
      value: '3',
      change: '-2.1%',
      changeType: 'negative',
      icon: ExclamationTriangleIcon,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'task_created',
      message: 'Created task "Design new landing page"',
      project: 'Website Redesign',
      user: 'John Doe',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'task_completed',
      message: 'Completed task "Setup database"',
      project: 'E-commerce Platform',
      user: 'Jane Smith',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'comment_added',
      message: 'Added comment to "API Integration"',
      project: 'Mobile App',
      user: 'Mike Johnson',
      time: '6 hours ago',
    },
    {
      id: 4,
      type: 'project_updated',
      message: 'Updated project "Marketing Campaign"',
      project: 'Marketing Campaign',
      user: 'Sarah Wilson',
      time: '1 day ago',
    },
  ];

  const quickActions = [
    {
      name: 'Create Project',
      description: 'Start a new project',
      icon: FolderIcon,
      href: '/projects/new',
      color: 'bg-blue-500',
    },
    {
      name: 'Add Task',
      description: 'Create a new task',
      icon: ClipboardDocumentListIcon,
      href: '/tasks/new',
      color: 'bg-green-500',
    },
    {
      name: 'View Analytics',
      description: 'Check project metrics',
      icon: ChartBarIcon,
      href: '/analytics',
      color: 'bg-purple-500',
    },
    {
      name: 'Team Management',
      description: 'Manage team members',
      icon: UserGroupIcon,
      href: '/users',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-primary-900 to-dark-900 p-6">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-600 via-accent-600 to-primary-700 rounded-2xl shadow-2xl border border-primary-500/20">
          <div className="px-8 py-10">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-primary-100 text-lg">
              Here's what's happening with your projects today.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl">
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-dark-300">{stat.name}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span
                    className={`inline-flex items-baseline px-3 py-1 rounded-full text-sm font-medium ${
                      stat.changeType === 'positive'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="ml-2 text-sm text-dark-400">from last month</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-xl font-bold text-white">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <a
                    key={action.name}
                    href={action.href}
                    className="relative group bg-slate-700/50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-xl border border-slate-600/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
                  >
                    <div>
                      <span className={`inline-flex p-3 rounded-xl ${action.color} text-white shadow-lg`}>
                        <action.icon className="h-6 w-6" />
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-white group-hover:text-purple-400">
                        {action.name}
                      </h3>
                      <p className="mt-2 text-sm text-slate-300">{action.description}</p>
                    </div>
                    <span
                      className="absolute top-6 right-6 text-slate-400 group-hover:text-purple-400 transition-colors"
                      aria-hidden="true"
                    >
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                      </svg>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-xl font-bold text-white">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivity.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivity.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-600"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center ring-4 ring-slate-800">
                              <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-slate-300">
                                {activity.message}{' '}
                                <span className="font-semibold text-white">
                                  {activity.project}
                                </span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-slate-400">
                              <time dateTime={activity.time}>{activity.time}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <a
                  href="/activity"
                  className="w-full flex justify-center items-center px-4 py-3 border border-slate-600/50 shadow-sm text-sm font-medium rounded-xl text-slate-300 bg-slate-700/50 hover:bg-slate-600/50 hover:text-white transition-all duration-300"
                >
                  View all activity
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl">
          <div className="p-6 border-b border-slate-700/50">
            <h3 className="text-xl font-bold text-white">Upcoming Deadlines</h3>
          </div>
          <div className="p-6">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/30 divide-y divide-slate-700">
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                      Design new landing page
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      Website Redesign
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      Tomorrow
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        In Progress
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                      API Integration
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      Mobile App
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      Dec 15, 2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Todo
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                      Database Setup
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      E-commerce Platform
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      Dec 20, 2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Completed
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
