import React, { useState } from 'react';

interface NoteFormProps {
  onSubmit: (title: string, content: string) => Promise<void>;
  isLoading?: boolean;
}

export const NoteForm: React.FC<NoteFormProps> = ({ onSubmit, isLoading = false }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required');
      return;
    }

    try {
      await onSubmit(title.trim(), content.trim());
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note');
    }
  };

  return (
    <div className="card p-8 mb-8 mindpath-accent">
      <div className="flex items-center mb-6">
        <div className="w-6 h-6 bg-gradient-to-br from-sage-400 to-gold-300 rounded-full mr-3 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-sage-900">Chart Your Next Step</h2>
      </div>
      <p className="text-sage-600 font-serif mb-6 italic">What part of your journey are you exploring today?</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-sage-700 mb-2 font-sans">
            Entry Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="Give this moment a name..."
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-sage-700 mb-2 font-sans">
            Your Thoughts
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-field min-h-[140px] resize-none"
            placeholder="Explore your thoughts, feelings, and insights. This is your safe space to reflect and grow..."
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !title.trim() || !content.trim()}
          className="btn-primary disabled:opacity-50 w-full"
        >
          {isLoading ? 'Adding to your journey...' : 'Add to Your Journey'}
        </button>
      </form>
    </div>
  );
};
