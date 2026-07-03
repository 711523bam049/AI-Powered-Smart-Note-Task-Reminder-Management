import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/StatCard';
import SkeletonLoader from '../components/SkeletonLoader';
import CaptureInput from '../components/CaptureInput';
import ManualCaptureModal from '../components/ManualCaptureModal';
import DashboardCharts from '../components/DashboardCharts';

// Sub views for tabs
import NotesView from './NotesView';
import TasksView from './TasksView';
import RemindersView from './RemindersView';
import SearchView from './SearchView';

import api from '../services/api';
import { 
  FileText, 
  CheckSquare, 
  Bell, 
  Activity, 
  ArrowUpRight,
  Plus
} from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
      setError('');
    } catch (err) {
      console.error("Failed to load dashboard metrics", err);
      setError('Could not load workspace metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'notes':
        return <NotesView />;
      case 'tasks':
        return <TasksView />;
      case 'reminders':
        return <RemindersView />;
      case 'search':
        return <SearchView />;
      default:
        return (
          <div className="space-y-8 animate-fade-in text-left">
            {/* Header Greeting */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-extrabold font-display tracking-tight text-[var(--text-main)]">
                  Welcome back
                </h1>
                <p className="text-sm text-[var(--text-muted)] mt-1 font-sans">
                  Here's a summary of your workspace activities and notes.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-purple to-brand-purple/80 hover:from-brand-purple hover:to-brand-purple text-white text-sm font-semibold rounded-lg shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                <Plus size={16} />
                Quick Capture
              </button>
            </div>

            {/* Natural Language Processing Input Bar */}
            <div className="w-full max-w-3xl">
              <CaptureInput onCaptureSuccess={fetchStats} />
            </div>

            {error && (
              <div className="bg-red-950/20 border border-red-500/20 text-red-300 text-sm p-4 rounded-xl">
                {error}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Notes"
                value={stats?.total_notes ?? 0}
                icon={FileText}
                colorClass="text-brand-purple"
                trend={{ value: "+2", label: " this week" }}
                loading={loading}
              />
              <StatCard
                title="Pending Tasks"
                value={stats?.pending_tasks ?? 0}
                icon={CheckSquare}
                colorClass="text-brand-blue"
                trend={{ value: stats?.total_tasks - stats?.pending_tasks ?? 0, label: " completed" }}
                loading={loading}
              />
              <StatCard
                title="Alert Reminders"
                value={stats?.pending_reminders ?? 0}
                icon={Bell}
                colorClass="text-amber-400"
                trend={{ value: stats?.total_reminders ?? 0, label: " total set" }}
                loading={loading}
              />
              <StatCard
                title="Activity Actions"
                value={stats?.weekly_activity?.reduce((acc, curr) => acc + curr.count, 0) ?? 0}
                icon={Activity}
                colorClass="text-emerald-400"
                trend={{ value: "Active", label: " in last 7 days" }}
                loading={loading}
              />
            </div>

            {/* Dynamic Interactive Charts */}
            <DashboardCharts 
              weeklyActivity={stats?.weekly_activity || []} 
              tagCounts={stats?.tag_counts || []} 
            />

            {/* Manual Capture Modal Trigger */}
            <ManualCaptureModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSuccess={fetchStats}
            />
          </div>
        );
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}
