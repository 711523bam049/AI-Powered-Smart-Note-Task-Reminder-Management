import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Bell, 
  Search, 
  LogOut,
  FolderOpen,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'search', label: 'Search & Query', icon: Search },
  ];

  return (
    <aside className="w-64 glass border-r border-[var(--border-color)] h-screen sticky top-0 flex flex-col justify-between font-sans">
      <div>
        {/* Top Header / Branding */}
        <div className="p-6 flex items-center justify-between border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center font-bold text-white font-display text-lg">
              S
            </div>
            <span className="font-bold font-display text-lg tracking-tight bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent text-glow">
              Smart Capture
            </span>
          </div>
          <ThemeToggle />
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3 mb-2">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-[var(--bg-hover)] text-[var(--text-main)] border-l-2 border-brand-purple pl-2.5' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-brand-purple' : ''} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-[var(--border-color)]">
        <div className="flex items-center justify-between gap-3 mb-3 px-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-hover)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-main)]">
              <User size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-main)] truncate">
                {user?.email?.split('@')[0]}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
