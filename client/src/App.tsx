import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Menu, FileText, AlertCircle, CheckCircle, Plus, Brain } from 'lucide-react';
import { Note as NoteType, AnalysisResult } from './types';
import { apiService } from './services/api';
import { NoteForm } from './components/NoteForm';
import { Note } from './components/Note';
import { AnalysisModal } from './components/AnalysisModal';
import { AnalysisLogView } from './components/AnalysisLogView';
import LoginPage from './components/LoginPage';
import UserProfile from './components/UserProfile';

function App() {
  const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently } = useAuth0();
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Analysis-related state
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisNotesCount, setAnalysisNotesCount] = useState(0);
  const [isLogViewOpen, setIsLogViewOpen] = useState(false);

  // Set up API service with access token provider
  useEffect(() => {
    if (isAuthenticated) {
      apiService.setAccessTokenProvider(getAccessTokenSilently);
      loadNotes();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

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
        
        // Check if this should trigger automatic analysis
        if (response.shouldTriggerAnalysis) {
          // Show a notification that analysis is being performed
          setTimeout(() => {
            handleAnalyzeNotes('automatic');
          }, 2000); // Wait 2 seconds to show the analysis modal
        }
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

  const handleAnalyzeNotes = async (triggerType: 'manual' | 'automatic' = 'manual') => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setIsAnalysisModalOpen(true);
      
      const response = await apiService.analyzeNotes(triggerType);
      setCurrentAnalysis(response.analysis);
      setAnalysisNotesCount(response.notesAnalyzed);
    } catch (error) {
      console.error('Error analyzing notes:', error);
      setError('Failed to analyze notes. Please try again.');
      setIsAnalysisModalOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCloseAnalysisModal = () => {
    setIsAnalysisModalOpen(false);
    setCurrentAnalysis(null);
    setAnalysisNotesCount(0);
  };

  const handleOpenLogView = () => {
    setIsLogViewOpen(true);
  };

  const handleCloseLogView = () => {
    setIsLogViewOpen(false);
  };

  // Show loading state while Auth0 is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show loading state while notes are loading
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
    <div className="min-h-screen bg-taupe-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="text-center flex-1">
              <div className="inline-flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-sage-400 to-gold-300 rounded-full mr-3 flex items-center justify-center">
                  <Menu className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-sage-900">MindPath</h1>
              </div>
              <p className="text-lg text-sage-700 font-serif italic">Write your path to wellness</p>
              <p className="text-sage-600 mt-2">Navigate your thoughts. Chart your growth.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenLogView}
                className="btn-secondary flex items-center text-sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                View Logs
              </button>
              <UserProfile />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 font-serif">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <CheckCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Note Form */}
        <NoteForm onSubmit={handleCreateNote} isLoading={isCreating} />

        {/* Notes List Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="journey-path pl-6">
            <h2 className="text-2xl font-semibold text-sage-900">
              Your Journey ({notes.length})
            </h2>
            <p className="text-sage-600 font-serif text-sm mt-1">Each entry is a step forward on your path</p>
          </div>
          <div className="flex gap-3">
            {notes.length >= 3 && (
              <button
                onClick={() => handleAnalyzeNotes('manual')}
                className="btn-primary flex items-center"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze Notes
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="btn-secondary"
              disabled={isLoading}
            >
              Refresh Path
            </button>
          </div>
        </div>

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-br from-sage-200 to-gold-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <FileText className="w-8 h-8 text-sage-600" />
            </div>
            <h3 className="text-lg font-medium text-sage-900 mb-2">Begin your journey</h3>
            <p className="text-sage-600 font-serif">Start charting your path to wellness by creating your first entry.</p>
            <p className="text-sage-500 text-sm mt-2 italic">"Every journey begins with a single step"</p>
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

        {/* Analysis Modal */}
        <AnalysisModal
          isOpen={isAnalysisModalOpen}
          onClose={handleCloseAnalysisModal}
          analysis={currentAnalysis}
          isLoading={isAnalyzing}
          notesAnalyzed={analysisNotesCount}
        />

        {/* Analysis Log View */}
        <AnalysisLogView
          isOpen={isLogViewOpen}
          onClose={handleCloseLogView}
        />
      </div>
    </div>
  );
}

export default App;
