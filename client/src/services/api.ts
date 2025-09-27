import { Note, CreateNoteRequest, UpdateNoteRequest, ApiResponse, ApiError } from '../types';

const API_BASE_URL = 'http://localhost:3000';

class ApiService {
  private getAccessToken: (() => Promise<string>) | null = null;

  setAccessTokenProvider(getToken: () => Promise<string>) {
    this.getAccessToken = getToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header if we have an access token provider
    if (this.getAccessToken) {
      try {
        const token = await this.getAccessToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Failed to get access token:', error);
        throw new Error('Authentication failed');
      }
    }
    
    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
    return this.request('/health');
  }

  // Get all notes
  async getAllNotes(): Promise<ApiResponse<Note>> {
    return this.request('/api/notes');
  }

  // Get a single note by ID
  async getNoteById(id: number): Promise<ApiResponse<Note>> {
    return this.request(`/api/notes/${id}`);
  }

  // Create a new note
  async createNote(noteData: CreateNoteRequest): Promise<ApiResponse<Note>> {
    return this.request('/api/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  // Update a note (full update)
  async updateNote(id: number, noteData: CreateNoteRequest): Promise<ApiResponse<Note>> {
    return this.request(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  // Partial update of a note
  async partialUpdateNote(id: number, noteData: UpdateNoteRequest): Promise<ApiResponse<Note>> {
    return this.request(`/api/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(noteData),
    });
  }

  // Delete a note
  async deleteNote(id: number): Promise<ApiResponse<Note>> {
    return this.request(`/api/notes/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
