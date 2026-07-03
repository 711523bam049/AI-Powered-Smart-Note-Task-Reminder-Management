import React, { useState } from 'react';
import { X, FileText, CheckSquare, Bell } from 'lucide-react';
import api from '../services/api';

export default function ManualCaptureModal({ isOpen, onClose, onSuccess }) {
  const [type, setType] = useState('note'); // note, task, reminder
  
  // Note Form Fields
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');

  // Task Form Fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskTags, setTaskTags] = useState('');

  // Reminder Form Fields
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderTags, setReminderTags] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (type === 'note') {
        const tagsArray = noteTags.split(',').map(t => t.trim()).filter(Boolean);
        await api.post('/notes', {
          title: noteTitle,
          content: noteContent,
          tags: tagsArray
        });
        // reset note form
        setNoteTitle('');
        setNoteContent('');
        setNoteTags('');
      } else if (type === 'task') {
        const tagsArray = taskTags.split(',').map(t => t.trim()).filter(Boolean);
        await api.post('/tasks', {
          title: taskTitle,
          description: taskDesc,
          due_date: taskDueDate ? new Date(taskDueDate).toISOString() : null,
          priority: taskPriority,
          is_completed: false,
          tags: tagsArray
        });
        // reset task form
        setTaskTitle('');
        setTaskDesc('');
        setTaskDueDate('');
        setTaskPriority('medium');
        setTaskTags('');
      } else { // reminder
        const tagsArray = reminderTags.split(',').map(t => t.trim()).filter(Boolean);
        await api.post('/reminders', {
          title: reminderTitle,
          remind_at: new Date(reminderTime).toISOString(),
          is_completed: false,
          tags: tagsArray
        });
        // reset reminder form
        setReminderTitle('');
        setReminderTime('');
        setReminderTags('');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to manually capture entity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg glass rounded-2xl p-6 shadow-premium relative animate-float">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <h3 className="text-xl font-bold font-display mb-6 text-left text-[var(--text-main)]">
          Manual Creation
        </h3>

        {/* Type Toggle Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-[var(--bg-hover)] rounded-lg mb-6 border border-[var(--border-color)]">
          {[
            { id: 'note', label: 'Note', icon: FileText },
            { id: 'task', label: 'Task', icon: CheckSquare },
            { id: 'reminder', label: 'Reminder', icon: Bell }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = type === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setType(tab.id)}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-[var(--bg-panel-solid)] text-[var(--text-main)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-950/20 border border-red-500/20 text-red-300 text-xs p-3 rounded-lg mb-4 text-left">
            {error}
          </div>
        )}

        {/* Form area */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {type === 'note' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full bg-[var(--bg-panel-solid)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-brand-purple"
                  placeholder="Note Title"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Content</label>
                <textarea
                  required
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-[var(--bg-panel-solid)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-brand-purple resize-none"
                  placeholder="Type note details here..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={noteTags}
                  onChange={(e) => setNoteTags(e.target.value)}
                  className="w-full bg-[var(--bg-panel-solid)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-brand-purple"
                  placeholder="Study, Personal"
                />
              </div>
            </>
          )}

          {type === 'task' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-[var(--bg-panel-solid)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-brand-purple"
                  placeholder="Task Title"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full bg-[var(--bg-panel-solid)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-brand-purple resize-none"
                  placeholder="Additional details..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Due Date</label>
                  <input
                    type="datetime-local"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-[var(--bg-panel-solid)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-brand-purple"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full bg-[var(--bg-panel-solid)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-brand-purple"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={taskTags}
                  onChange={(e) => setTaskTags(e.target.value)}
                  className="w-full bg-[var(--bg-panel-solid)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-brand-purple"
                  placeholder="Work, urgent"
                />
              </div>
            </>
          )}

          {type === 'reminder' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Reminder Title</label>
                <input
                  type="text"
                  required
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  className="w-full bg-[var(--bg-panel-solid)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-brand-purple"
                  placeholder="Remember to do..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Trigger Time</label>
                <input
                  type="datetime-local"
                  required
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full bg-[var(--bg-panel-solid)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-brand-purple"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={reminderTags}
                  onChange={(e) => setReminderTags(e.target.value)}
                  className="w-full bg-[var(--bg-panel-solid)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-brand-purple"
                  placeholder="Personal, Travel"
                />
              </div>
            </>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-gradient-to-r from-brand-purple to-brand-purple/80 hover:from-brand-purple hover:to-brand-purple text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Capture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
