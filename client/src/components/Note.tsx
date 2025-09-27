import React, { useState } from 'react';
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
      <div className="card p-6">
        <div className="space-y-4">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="input-field"
            placeholder="Note title"
            disabled={isLoading}
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="input-field min-h-[120px] resize-none"
            placeholder="Note content"
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="btn-secondary disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{note.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="btn-danger text-sm disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{note.content}</p>
      <p className="text-sm text-gray-500">
        Last updated: {formatDate(note.last_updated)}
      </p>
    </div>
  );
};
