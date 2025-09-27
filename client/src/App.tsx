import React, { useState, useEffect } from 'react';
import { Note as NoteType } from './types';
import { apiService } from './services/api';
import { NoteForm } from './components/NoteForm';
import { Note } from './components/Note';

function App() {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all notes on component mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getAllNotes();
      setNotes(response.notes || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      setError('Failed to load notes. Please make sure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async (title: string, content: string) => {
    try {
      setIsCreating(true);
      setError(null);
      const response = await apiService.createNote({ title, content });
      if (response.note) {
        setNotes(prevNotes => [response.note!, ...prevNotes]);
      }
    } catch (error) {
      console.error('Error creating note:', error);
      setError('Failed to create note');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateNote = async (id: number, title: string, content: string) => {
    try {
      setError(null);
      const response = await apiService.updateNote(id, { title, content });
      if (response.note) {
        setNotes(prevNotes =>
          prevNotes.map(note =>
            note.note_id === id ? response.note! : note
          )
        );
      }
    } catch (error) {
      console.error('Error updating note:', error);
      setError('Failed to update note');
      throw error;
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      setError(null);
      await apiService.deleteNote(id);
      setNotes(prevNotes => prevNotes.filter(note => note.note_id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note');
      throw error;
    }
  };

  const handleRefresh = () => {
    loadNotes();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Notes App</h1>
          <p className="text-gray-600">Manage your notes with ease</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Note Form */}
        <NoteForm onSubmit={handleCreateNote} isLoading={isCreating} />

        {/* Notes List Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Your Notes ({notes.length})
          </h2>
          <button
            onClick={handleRefresh}
            className="btn-secondary"
            disabled={isLoading}
          >
            Refresh
          </button>
        </div>

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new note.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {notes.map((note) => (
              <Note
                key={note.note_id}
                note={note}
                onUpdate={handleUpdateNote}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
