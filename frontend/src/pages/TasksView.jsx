import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import { Trash2, CheckCircle2, Circle, AlertTriangle, Calendar } from 'lucide-react';

export default function TasksView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleComplete = async (task) => {
    try {
      const updated = await api.put(`/tasks/${task.id}`, {
        is_completed: !task.is_completed
      });
      setTasks(prev => prev.map(t => t.id === task.id ? updated.data : t));
    } catch (err) {
      console.error(err);
      alert('Failed to toggle completion status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete task.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans">
      <div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-[var(--text-main)]">
          Tasks & Todos
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Review, toggle completeness, or clear items.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-500/20 text-red-300 text-xs p-4 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonLoader type="list" count={3} />
      ) : tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className={`glass rounded-xl p-4 flex items-center justify-between group transition-all duration-200 border-l-4 ${
                task.is_completed ? 'border-zinc-500/30' :
                task.priority === 'high' ? 'border-red-500' :
                task.priority === 'low' ? 'border-blue-500' : 'border-purple-500'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Completion Checkbox */}
                <button 
                  onClick={() => handleToggleComplete(task)}
                  className="text-[var(--text-muted)] hover:text-brand-purple transition-colors cursor-pointer shrink-0"
                >
                  {task.is_completed ? (
                    <CheckCircle2 size={20} className="text-emerald-400" />
                  ) : (
                    <Circle size={20} />
                  )}
                </button>

                <div className="min-w-0 pr-4">
                  <h3 className={`font-bold font-display text-sm truncate ${task.is_completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'}`}>
                    {task.title}
                  </h3>
                  {task.description && task.description !== task.title && (
                    <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                      {task.description}
                    </p>
                  )}
                  
                  {/* Due Date Indicator */}
                  {task.due_date && (
                    <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 mt-1.5">
                      <Calendar size={10} />
                      Due: {new Date(task.due_date).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Tag Badges and Operations */}
              <div className="flex items-center gap-3 shrink-0">
                {task.tags?.length > 0 && (
                  <div className="hidden sm:flex gap-1">
                    {task.tags.map(t => (
                      <span key={t.id} className="text-[9px] font-bold bg-[var(--bg-hover)] text-[var(--text-main)] px-2 py-0.5 rounded border border-[var(--border-color)]">
                        {t.name}
                      </span>
                    ))}
                  </div>
                )}
                
                <button 
                  onClick={() => handleDelete(task.id)}
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
          No tasks captured yet.
        </div>
      )}
    </div>
  );
}
