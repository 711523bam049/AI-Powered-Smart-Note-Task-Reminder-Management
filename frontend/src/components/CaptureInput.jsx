import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Sparkles, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function CaptureInput({ onCaptureSuccess }) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check compatibility for Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setError('');
      };

      recognition.onerror = (event) => {
        console.error("Speech Recognition Error", event);
        setError(`Voice capture failed: ${event.error}. Please try typing.`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText(prev => (prev ? prev + ' ' + transcript : transcript));
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setError('Voice recognition is not supported in this browser. Please use Chrome or Safari.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    setError('');
    setSuccessInfo('');

    try {
      const response = await api.post('/captures/process', { text: text.trim() });
      const { type, data } = response.data;
      
      setSuccessInfo(`Intelligently captured new ${type}! "${data.title}"`);
      setText('');
      
      if (onCaptureSuccess) {
        onCaptureSuccess();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to analyze text input.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full space-y-3 font-sans">
      {/* Toast Notifications / Status Banner */}
      {successInfo && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-lg flex items-center gap-2 animate-pulse-slow">
          <Sparkles size={14} className="shrink-0" />
          <span>{successInfo}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative glass rounded-2xl p-2 focus-within:border-brand-purple/40 transition-all duration-300 flex items-end gap-2 shadow-premium">
        {/* Input Text Area */}
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Try 'Remind me to call HR tomorrow at 5pm' or 'Buy milk next Monday'..."
          className="flex-1 bg-transparent border-0 outline-none text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] px-3 py-2.5 resize-none max-h-32 min-h-[40px] focus:ring-0"
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-1 p-1">
          {/* Voice Input Trigger */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2 rounded-xl transition-all duration-300 relative cursor-pointer ${
              isRecording 
                ? 'bg-red-500/20 text-red-400 scale-105' 
                : 'hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            title={isRecording ? 'Stop Recording' : 'Capture via Voice'}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            {isRecording && (
              <span className="absolute inset-0 rounded-xl bg-red-500/10 animate-ping" />
            )}
          </button>

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={!text.trim() || loading}
            className="p-2 rounded-xl bg-brand-purple hover:bg-brand-purple/95 text-white disabled:opacity-30 disabled:hover:bg-brand-purple transition-all duration-200 cursor-pointer shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>
      </form>

      {/* Voice Recording Sound Waves Animation State */}
      {isRecording && (
        <div className="flex justify-center items-center gap-1.5 py-2">
          <div className="h-4 w-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="h-6 w-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
          <div className="h-8 w-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
          <div className="h-6 w-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="h-4 w-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          <span className="text-xs text-[var(--text-muted)] ml-2 font-medium">Listening to your voice...</span>
        </div>
      )}
    </div>
  );
}
