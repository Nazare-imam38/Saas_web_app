import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import {
  HomeIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UsersIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import UserAvatar from '../Common/UserAvatar';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const { connected } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Projects', href: '/projects', icon: FolderIcon },
    { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    ...(isAdmin ? [{ name: 'Users', href: '/users', icon: UsersIcon }] : []),
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-primary-900 to-dark-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-dark-800 border-r border-dark-700">
          <div className="flex h-16 items-center justify-between px-4 border-b border-dark-700">
            <h1 className="text-xl font-bold text-white">ProjectHub</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-dark-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`sidebar-item ${
                  isActive(item.href) ? 'sidebar-item-active' : 'sidebar-item-inactive'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-dark-800 border-r border-dark-700">
          <div className="flex h-16 items-center px-4 border-b border-dark-700">
            <h1 className="text-xl font-bold text-white">ProjectHub</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`sidebar-item ${
                  isActive(item.href) ? 'sidebar-item-active' : 'sidebar-item-inactive'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-dark-700 bg-dark-800/80 backdrop-blur-sm px-4 shadow-lg sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-dark-300 hover:text-white lg:hidden transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Connection status */}
              <div className="flex items-center gap-x-2">
                <div className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className="text-sm text-dark-300">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Notifications */}
              <button className="relative p-1 text-dark-400 hover:text-white transition-colors">
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-danger-500"></span>
              </button>

              {/* Settings */}
              <button className="p-1 text-dark-400 hover:text-white transition-colors">
                <span className="sr-only">Settings</span>
                <Cog6ToothIcon className="h-6 w-6" />
              </button>

              {/* User menu */}
              <div className="relative">
                <div className="flex items-center gap-x-3">
                  <UserAvatar user={user} size="sm" />
                  <div className="hidden md:block">
                    <div className="text-sm font-semibold text-white">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-dark-400 capitalize">{user?.role}</div>
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="text-sm text-dark-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
