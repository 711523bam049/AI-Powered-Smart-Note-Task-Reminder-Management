import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import { Trash2, Bell, CheckSquare, Calendar } from 'lucide-react';

export default function RemindersView() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reminders');
      setReminders(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch reminders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleToggleComplete = async (reminder) => {
    try {
      const updated = await api.put(`/reminders/${reminder.id}`, {
        is_completed: !reminder.is_completed
      });
      setReminders(prev => prev.map(r => r.id === reminder.id ? updated.data : r));
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await api.delete(`/reminders/${id}`);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete reminder.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans">
      <div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-[var(--text-main)]">
          Reminders Grid
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Review trigger alert alerts.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-500/20 text-red-300 text-xs p-4 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonLoader type="list" count={3} />
      ) : reminders.length > 0 ? (
        <div className="space-y-3">
          {reminders.map(rem => (
            <div 
              key={rem.id} 
              className={`glass rounded-xl p-4 flex items-center justify-between group transition-all duration-200 ${
                rem.is_completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <button 
                  onClick={() => handleToggleComplete(rem)}
                  className="text-[var(--text-muted)] hover:text-brand-purple transition-colors cursor-pointer shrink-0"
                >
                  <Bell size={20} className={rem.is_completed ? 'text-zinc-500' : 'text-amber-400 animate-pulse-slow'} />
                </button>

                <div className="min-w-0 pr-4">
                  <h3 className={`font-bold font-display text-sm truncate ${rem.is_completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'}`}>
                    {rem.title}
                  </h3>
                  
                  {/* Alert Date */}
                  <span className="text-[10px] text-brand-purple font-semibold flex items-center gap-1 mt-1">
                    <Calendar size={10} />
                    Remind at: {new Date(rem.remind_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Tag Badges and Operations */}
              <div className="flex items-center gap-3 shrink-0">
                {rem.tags?.length > 0 && (
                  <div className="hidden sm:flex gap-1">
                    {rem.tags.map(t => (
                      <span key={t.id} className="text-[9px] font-bold bg-[var(--bg-hover)] text-[var(--text-main)] px-2 py-0.5 rounded border border-[var(--border-color)]">
                        {t.name}
                      </span>
                    ))}
                  </div>
                )}
                
                <button 
                  onClick={() => handleDelete(rem.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/15 text-[var(--text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl p-8 text-center text-[var(--text-muted)] text-sm">
          No reminders captured yet.
        </div>
      )}
    </div>
  );
}
