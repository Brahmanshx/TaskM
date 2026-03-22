import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  BarChart3,
  LogOut, 
  Menu, 
  X, 
  Flame, 
  User,
  Plus,
  Zap
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
              Taskify
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-brand-900/50 p-1.5 rounded-2xl border border-white/5">
            {navItems.map(({ path, icon: Icon, label }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                    ${active
                      ? 'bg-brand-800 text-white shadow-lg'
                      : 'text-surface-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Icon size={18} className={active ? 'text-primary-400' : ''} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* User Area */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-900 border border-white/5">
              <Flame size={16} className="text-warning fill-warning/20" />
              <span className="text-sm font-bold text-white">12</span>
            </div>
            
            <div className="h-8 w-px bg-white/5 mx-2" />

            <div className="flex items-center gap-3 pl-2">
              <div className="flex flex-col items-end mr-1">
                <span className="text-sm font-bold text-white leading-none mb-1">
                  {user?.name || user?.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-surface-500 font-medium uppercase tracking-wider">
                  Pro Plan
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-brand-900 border border-white/10 flex items-center justify-center overflow-hidden ring-2 ring-transparent hover:ring-primary-500/50 transition-all cursor-pointer">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-surface-400" />
                )}
              </div>
              <button
                onClick={logout}
                className="p-2.5 rounded-xl text-surface-500 hover:text-danger hover:bg-danger/10 transition-all ml-2"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2.5 rounded-xl bg-brand-900 border border-white/5 text-surface-400 hover:text-white transition-all"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-brand-950/95 backdrop-blur-xl animate-fade-in">
          <div className="px-6 py-8 space-y-2">
            {navItems.map(({ path, icon: Icon, label }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-bold transition-all
                    ${active
                      ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20'
                      : 'text-surface-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Icon size={22} />
                  {label}
                </Link>
              );
            })}
            <div className="pt-6 mt-6 border-t border-white/5">
              <button
                onClick={logout}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-bold text-surface-400 hover:text-danger hover:bg-danger/10 transition-all"
              >
                <LogOut size={22} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
