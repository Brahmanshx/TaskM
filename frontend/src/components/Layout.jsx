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
  TrendingUp,
  Check,
  Trash2
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

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
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications', {
        headers: { 'user-id': user.id }
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`, {}, {
        headers: { 'user-id': user.id }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all', {}, {
        headers: { 'user-id': user.id }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`, {
        headers: { 'user-id': user.id }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

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
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                    
                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                                <h3 className="font-semibold text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={markAllAsRead}
                                        className="text-xs text-primary-400 hover:text-primary-300"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-slate-700/50">
                                        {notifications.map(n => (
                                            <div 
                                                key={n.id} 
                                                className={clsx(
                                                    "p-4 hover:bg-slate-700/30 transition-colors group relative",
                                                    !n.isRead && "bg-primary-500/5"
                                                )}
                                            >
                                                {!n.isRead && (
                                                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-full"></div>
                                                )}
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex-1">
                                                        <p className={clsx("text-sm", !n.isRead ? "text-white font-medium" : "text-slate-400")}>
                                                            {n.message}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 mt-1">
                                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!n.isRead && (
                                                            <button 
                                                                onClick={() => markAsRead(n.id)}
                                                                className="p-1 text-slate-500 hover:text-primary-400 transition-colors"
                                                                title="Mark as read"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => deleteNotification(n.id)}
                                                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <Bell size={32} className="mx-auto text-slate-600 mb-2 opacity-20" />
                                        <p className="text-slate-500 text-sm">No notifications yet.</p>
                                    </div>
                                )}
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
