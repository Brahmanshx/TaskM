import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  BarChart2, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  X,
  User,
  Settings,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
  <Link
    to={to}
    className={clsx(
      "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-1",
      active ? "bg-primary-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Layout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="flex h-screen bg-dark-bg text-dark-text overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-card border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700 flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white">AI</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">TaskMind</span>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
            <div className="mb-6">
                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
                <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" active={location.pathname === '/'} />
                <SidebarItem icon={CheckSquare} label="My Tasks" to="/tasks" active={location.pathname === '/tasks'} />
                <SidebarItem icon={Target} label="Goals" to="/goals" active={location.pathname === '/goals'} />
                <SidebarItem icon={TrendingUp} label="Goal Tracking" to="/goal-tracking" active={location.pathname === '/goal-tracking'} />
                <SidebarItem icon={BarChart2} label="Analytics" to="/analytics" active={location.pathname === '/analytics'} />
            </div>
            <div>
                 <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Assistant</p>
                 <SidebarItem icon={MessageSquare} label="AI Chat" to="/chat" active={location.pathname === '/chat'} />
            </div>
        </nav>

        <div className="p-4 border-t border-slate-700">
            <div className="relative">
                <button 
                    className="flex items-center justify-between w-full px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                            <User size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{user?.username || 'User'}</p>
                            <p className="text-xs text-slate-400">{user?.email || 'Free Plan'}</p>
                        </div>
                    </div>
                    <Settings size={16} className="text-slate-400" />
                </button>

                {showUserMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-full bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-50">
                        <Link 
                            to="/profile" 
                            className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
                            onClick={() => setShowUserMenu(false)}
                        >
                            <User size={16} /> Profile
                        </Link>
                        <button 
                            onClick={() => { logout(); setShowUserMenu(false); }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 flex items-center gap-2"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navbar (Mobile toggle, Notifications, Search) */}
        <header className="h-16 bg-dark-bg border-b border-slate-700 flex items-center justify-between px-6">
            <h2 className="text-xl font-semibold capitalize">
                {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1)}
            </h2>
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <button 
                        className="p-2 text-slate-400 hover:text-white transition-colors relative"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    
                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-slate-700 rounded-lg shadow-xl z-50">
                            <div className="p-4 border-b border-slate-700">
                                <h3 className="font-semibold text-white">Notifications</h3>
                            </div>
                            <div className="p-4">
                                <p className="text-slate-400 text-sm">No new notifications.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
