import React, { useState } from 'react';
import { Clock, Edit } from 'lucide-react';
import { Note as NoteType } from '../types';

interface NoteProps {
  note: NoteType;
  onUpdate: (id: number, title: string, content: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const Note: React.FC<NoteProps> = ({ note, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('Title and content are required');
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(note.note_id, editTitle.trim(), editContent.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setIsLoading(true);
      try {
        await onDelete(note.note_id);
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isEditing) {
    return (
      <div className="card p-6 mindpath-accent">
        <div className="space-y-6">
          <div className="flex items-center mb-4">
            <div className="w-5 h-5 bg-gradient-to-br from-gold-300 to-sage-400 rounded-full mr-3 flex items-center justify-center">
              <Edit className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-sage-900">Refining Your Path</h3>
          </div>
          
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="input-field"
            placeholder="Give this moment a name..."
            disabled={isLoading}
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="input-field min-h-[140px] resize-none"
            placeholder="Continue exploring your thoughts and feelings..."
            disabled={isLoading}
          />
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 flex-1"
            >
              {isLoading ? 'Saving your journey...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="btn-secondary disabled:opacity-50 flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 journey-path pl-8">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-sage-900 mb-2">{note.title}</h3>
          <div className="flex items-center text-sm text-sage-500 mb-3">
            <Clock className="w-4 h-4 mr-2" />
            <span className="font-serif">Last updated: {formatDate(note.last_updated)}</span>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            Refine
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="btn-danger text-sm disabled:opacity-50"
          >
            {isLoading ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
      <div className="bg-taupe-50 rounded-lg p-4 border-l-4 border-sage-300">
        <p className="text-sage-800 font-serif leading-relaxed whitespace-pre-wrap">{note.content}</p>
      </div>
    </div>
  );
};
