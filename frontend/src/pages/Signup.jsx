import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup(email, password);
      navigate('/');
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
      <div className="w-full max-w-md glass rounded-2xl p-8 shadow-premium animate-float">
        <h2 className="text-3xl font-bold font-display text-center mb-6 text-glow">
          <span className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">Smart Capture AI</span>
        </h2>
        <p className="text-zinc-400 text-center text-sm mb-8 font-sans">Create an account to start capturing information intelligently</p>
        
        {error && (
          <div className="bg-red-950/40 border border-red-500/30 text-red-300 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left">
            <label className="block text-sm text-zinc-300 mb-2 font-medium">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-900 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-purple transition-all duration-300"
              placeholder="you@example.com"
            />
          </div>
          <div className="text-left">
            <label className="block text-sm text-zinc-300 mb-2 font-medium">Password (Min 6 chars)</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-900 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-purple transition-all duration-300"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-brand-purple to-brand-purple/80 hover:from-brand-purple hover:to-brand-purple text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-zinc-400 text-center text-sm mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-blue hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
