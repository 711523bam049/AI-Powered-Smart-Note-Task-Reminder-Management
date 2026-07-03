import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import { Trash2, FileText, Calendar } from 'lucide-react';

export default function NotesView() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notes');
      setNotes(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch notes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete note.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans">
      <div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-[var(--text-main)]">
          Notes Repository
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Review, read, and manage your captured declarative notes.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-500/20 text-red-300 text-xs p-4 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonLoader type="card" count={2} />
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notes.map(note => (
            <div key={note.id} className="glass rounded-xl p-6 relative group flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300 shadow-premium">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold font-display text-lg text-[var(--text-main)] truncate group-hover:text-brand-purple transition-colors">
                    {note.title}
                  </h3>
                  <button 
                    onClick={() => handleDelete(note.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/15 text-[var(--text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                
                <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-4">
                  {note.content}
                </p>

                {note.summary && note.summary !== note.content && (
                  <div className="mt-3 p-3 bg-brand-purple/5 border border-brand-purple/10 rounded-lg">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple block mb-1">
                      Summary (AI generated)
                    </span>
                    <p className="text-xs text-[var(--text-main)] italic leading-relaxed">
                      "{note.summary}"
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-[var(--border-color)] flex justify-between items-center text-[10px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
                
                {note.tags?.length > 0 && (
                  <div className="flex gap-1.5">
                    {note.tags.map(t => (
                      <span key={t.id} className="bg-[var(--bg-hover)] text-[var(--text-main)] px-2 py-0.5 rounded border border-[var(--border-color)] font-semibold">
                        {t.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl p-8 text-center text-[var(--text-muted)] text-sm">
          No notes captured yet.
        </div>
      )}
    </div>
  );
}
