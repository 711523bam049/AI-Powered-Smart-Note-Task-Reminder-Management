import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/StatCard';
import SkeletonLoader from '../components/SkeletonLoader';
import CaptureInput from '../components/CaptureInput';
import ManualCaptureModal from '../components/ManualCaptureModal';
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

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' ? (
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

          {/* Recent Workspace Updates Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
                <h3 className="font-bold font-display text-lg text-[var(--text-main)]">
                  Recent Activities
                </h3>
                <span className="text-xs text-brand-purple hover:underline flex items-center gap-0.5 cursor-pointer font-semibold">
                  View history <ArrowUpRight size={14} />
                </span>
              </div>
              
              <div className="space-y-3">
                {loading ? (
                  <SkeletonLoader type="list" count={3} />
                ) : stats?.weekly_activity?.length > 0 ? (
                  <div className="text-sm text-[var(--text-muted)] space-y-4 py-2 font-sans">
                    <p>Recent capture operations are loaded. Capture logs will populate here as entries are parsed.</p>
                    <div className="flex flex-col gap-2">
                      {stats.weekly_activity.slice(0, 3).map((act, i) => (
                        <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-[var(--bg-hover)] border border-[var(--border-color)]">
                          <span className="text-[var(--text-main)] font-medium">Workspace Activity Checked</span>
                          <span className="text-xs bg-brand-purple/10 text-brand-purple px-2 py-0.5 rounded-full">{act.day}: {act.count} counts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-muted)] py-4 font-sans text-center">
                    No recent activities recorded. Try capturing notes or tasks!
                  </p>
                )}
              </div>
            </div>

            <div className="glass rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
                <h3 className="font-bold font-display text-lg text-[var(--text-main)]">
                  Tag Distribution
                </h3>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <SkeletonLoader type="list" count={2} />
                ) : stats?.tag_counts?.length > 0 ? (
                  <div className="space-y-3 font-sans">
                    {stats.tag_counts.slice(0, 4).map((tag, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-[var(--text-main)] font-medium">{tag.name}</span>
                        <span className="text-xs bg-brand-blue/10 text-brand-blue px-2.5 py-0.5 rounded-full font-bold">
                          {tag.count} items
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-muted)] py-8 font-sans text-center">
                    No tags associated yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Manual Capture Modal Trigger */}
          <ManualCaptureModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchStats}
          />
        </div>
      ) : (
        <div className="text-left font-sans space-y-4">
          <h1 className="text-3xl font-extrabold font-display tracking-tight capitalize text-[var(--text-main)]">
            {activeTab}
          </h1>
          <p className="text-zinc-400 text-sm">
            Content views for {activeTab} will be integrated in subsequent modules.
          </p>
          <div className="pt-6">
            <SkeletonLoader type="card" count={2} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
