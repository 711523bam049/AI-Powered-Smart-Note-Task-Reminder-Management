import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-dark-950 p-6 text-left">
      <header className="flex justify-between items-center mb-10 pb-6 border-b border-zinc-800/40">
        <div>
          <h1 className="text-2xl font-bold font-display text-glow">
            <span className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">Smart Capture AI</span>
          </h1>
          <p className="text-zinc-500 text-xs">Logged in as {user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-all cursor-pointer font-sans"
        >
          Logout
        </button>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        <div className="glass rounded-xl p-6 text-left">
          <h3 className="font-display font-semibold text-lg mb-2 text-brand-purple">Module 5 Setup Complete</h3>
          <p className="text-zinc-400 text-sm">Vite, React, TailwindCSS v4, Axios API client with interceptors, and React Router are fully configured.</p>
        </div>
        <div className="glass rounded-xl p-6 text-left">
          <h3 className="font-display font-semibold text-lg mb-2 text-brand-blue">Core AI Pipelines Ready</h3>
          <p className="text-zinc-400 text-sm">NLP intent classification, spaCy NER, semantic tagging, and text summarization are fully linked to capture APIs.</p>
        </div>
        <div className="glass rounded-xl p-6 text-left">
          <h3 className="font-display font-semibold text-lg mb-2 text-emerald-400">Secure Interceptors</h3>
          <p className="text-zinc-400 text-sm">JWT Bearer tokens are attached to every request automatically. Automatic token rotation recovers expired sessions.</p>
        </div>
      </main>
    </div>
  );
}
