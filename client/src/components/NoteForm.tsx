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
    <div className="card p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Note</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="Enter note title"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-field min-h-[120px] resize-none"
            placeholder="Enter note content"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !title.trim() || !content.trim()}
          className="btn-primary disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Note'}
        </button>
      </form>
    </div>
  );
};
