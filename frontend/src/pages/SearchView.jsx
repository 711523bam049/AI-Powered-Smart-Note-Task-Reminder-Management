import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Filter, Calendar, Tag, Trash2, CheckCircle, FileText, CheckSquare, Bell } from 'lucide-react';
import api from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';

export default function SearchView() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('keyword'); // keyword, semantic
  const [selectedTag, setSelectedTag] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Available tags to filter by (pre-defined, or fetched)
  const tags = ["Work", "Study", "Finance", "Health", "Shopping", "Travel", "Personal"];

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      let url = `/search?query=${encodeURIComponent(query.trim())}&mode=${mode}`;
      if (selectedTag) {
        url += `&tag=${encodeURIComponent(selectedTag)}`;
      }
      
      const response = await api.get(url);
      setResults(response.data.results || []);
    } catch (err) {
      console.error(err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query.trim()) {
      handleSearch();
    }
  }, [mode, selectedTag]);

  const handleDeleteItem = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      if (type === 'note') await api.delete(`/notes/${id}`);
      else if (type === 'task') await api.delete(`/tasks/${id}`);
      else await api.delete(`/reminders/${id}`);

      // Remove from state results
      setResults(prev => prev.filter(item => !(item.type === type && item.id === id)));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete item.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans">
      <div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-[var(--text-main)]">
          Search & Query
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Perform standard keyword matching or semantic AI-powered searches across your notes.
        </p>
      </div>

      {/* Search Input Controls */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[var(--bg-panel-solid)] border border-[var(--border-color)] rounded-xl pl-11 pr-4 py-3 text-sm text-[var(--text-main)] focus:outline-none focus:border-brand-purple"
              placeholder="Search anything (e.g. 'project schedule', 'electricity invoice')..."
            />
            <Search size={18} className="absolute left-4 top-3.5 text-[var(--text-muted)]" />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-brand-purple hover:bg-brand-purple/95 text-white font-semibold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
          >
            Search Workspace
          </button>
        </div>

        {/* Toggle Mode and Tag Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Mode Toggles */}
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-lg">
            <button
              type="button"
              onClick={() => setMode('keyword')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'keyword'
                  ? 'bg-[var(--bg-panel-solid)] text-[var(--text-main)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Search size={12} />
              Keyword Search
            </button>
            <button
              type="button"
              onClick={() => setMode('semantic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'semantic'
                  ? 'bg-[var(--bg-panel-solid)] text-[var(--text-main)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Sparkles size={12} className="text-brand-purple animate-pulse-slow" />
              Semantic Search (AI)
            </button>
          </div>

          {/* Tag Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[var(--text-muted)]" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-[var(--bg-panel-solid)] border border-[var(--border-color)] text-xs font-medium text-[var(--text-main)] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-purple"
            >
              <option value="">Filter by Tag (All)</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-950/20 border border-red-500/20 text-red-300 text-xs p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Search Results list */}
      <div className="space-y-4 pt-2">
        {loading ? (
          <SkeletonLoader type="list" count={4} />
        ) : results.length > 0 ? (
          results.map((item, idx) => {
            return (
              <div 
                key={`${item.type}-${item.id}`} 
                className="glass rounded-xl p-5 hover:translate-x-1 transition-all duration-300 shadow-sm relative group flex justify-between items-start"
              >
                <div className="space-y-2 min-w-0 pr-4">
                  {/* Badge & Similarity score */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      item.type === 'note' ? 'bg-purple-500/10 text-purple-400' :
                      item.type === 'task' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {item.type === 'note' && <FileText size={10} />}
                      {item.type === 'task' && <CheckSquare size={10} />}
                      {item.type === 'reminder' && <Bell size={10} />}
                      {item.type}
                    </span>

                    {/* Semantic Match Score */}
                    {item.score && (
                      <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                        AI Score: {Math.round(item.score * 100)}%
                      </span>
                    )}

                    <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title & snippet */}
                  <h3 className="font-bold font-display text-base text-[var(--text-main)] group-hover:text-brand-purple transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                    {item.content_summary}
                  </p>

                  {/* Tag pills */}
                  {item.tags?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                      {item.tags.map((t) => (
                        <span key={t} className="text-[10px] font-semibold bg-[var(--bg-hover)] text-[var(--text-main)] px-2 py-0.5 rounded border border-[var(--border-color)]">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Operations */}
                <button
                  onClick={() => handleDeleteItem(item.type, item.id)}
                  className="p-2 rounded-lg hover:bg-red-500/15 text-[var(--text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                  title={`Delete ${item.type}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        ) : query.trim() ? (
          <div className="glass rounded-xl p-8 text-center text-[var(--text-muted)] font-sans text-sm">
            No matching captures found. Try a different query or mode.
          </div>
        ) : (
          <div className="glass rounded-xl p-8 text-center text-[var(--text-muted)] font-sans text-sm">
            Enter a search term above to scan your smart note repository.
          </div>
        )}
      </div>
    </div>
  );
}
