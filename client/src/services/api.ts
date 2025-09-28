/**
 * MindPath API Service
 * 
 * This service handles all HTTP communication with the MindPath backend API.
 * It provides methods for note management, AI analysis, and authentication.
 * All requests are automatically authenticated using Auth0 access tokens.
 * 
 * @author MindPath Development Team
 * @version 1.0.0
 */

import { Note, CreateNoteRequest, UpdateNoteRequest, ApiResponse, ApiError, AnalysisResponse, AnalysisLogsResponse } from '../types';

// Backend API base URL - configured for development
const API_BASE_URL = 'http://localhost:8081';

/**
 * API Service Class
 * 
 * Provides a centralized interface for all backend API communication.
 * Handles authentication, error handling, and request formatting.
 */
class ApiService {
  private getAccessToken: (() => Promise<string>) | null = null;

  /**
   * Set Access Token Provider
   * 
   * Configures the service to use Auth0's getAccessTokenSilently function
   * for automatic token retrieval and refresh.
   * 
   * @param {() => Promise<string>} getToken - Auth0 token provider function
   */
  setAccessTokenProvider(getToken: () => Promise<string>) {
    this.getAccessToken = getToken;
  }

  /**
   * Generic HTTP Request Method
   * 
   * Handles all HTTP requests to the backend API with automatic authentication,
   * error handling, and response parsing.
   * 
   * @template T - Expected response type
   * @param {string} endpoint - API endpoint path
   * @param {RequestInit} options - Fetch request options
   * @returns {Promise<T>} Parsed response data
   * @throws {Error} If request fails or authentication is invalid
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Set up default headers
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
        console.error('❌ Failed to get access token:', error);
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

  /**
   * =============================================================================
   * API ENDPOINT METHODS
   * =============================================================================
   */

  /**
   * Health Check
   * 
   * Verifies that the backend API server is running and accessible.
   * 
   * @returns {Promise<Object>} Server status and timestamp
   */
  async healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
    return this.request('/health');
  }

  /**
   * Get All Notes
   * 
   * Retrieves all notes for the authenticated user.
   * 
   * @returns {Promise<ApiResponse<Note>>} Array of user notes
   */
  async getAllNotes(): Promise<ApiResponse<Note>> {
    return this.request('/api/notes');
  }

  /**
   * Get Single Note
   * 
   * Retrieves a specific note by ID for the authenticated user.
   * 
   * @param {number} id - Note ID
   * @returns {Promise<ApiResponse<Note>>} Note object
   */
  async getNoteById(id: number): Promise<ApiResponse<Note>> {
    return this.request(`/api/notes/${id}`);
  }

  /**
   * Create New Note
   * 
   * Creates a new note for the authenticated user.
   * 
   * @param {CreateNoteRequest} noteData - Note title and content
   * @returns {Promise<ApiResponse<Note>>} Created note object
   */
  async createNote(noteData: CreateNoteRequest): Promise<ApiResponse<Note>> {
    return this.request('/api/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  /**
   * Update Note (Full Update)
   * 
   * Updates an existing note with new title and content.
   * 
   * @param {number} id - Note ID
   * @param {CreateNoteRequest} noteData - New note title and content
   * @returns {Promise<ApiResponse<Note>>} Updated note object
   */
  async updateNote(id: number, noteData: CreateNoteRequest): Promise<ApiResponse<Note>> {
    return this.request(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  /**
   * Partial Update Note
   * 
   * Updates specific fields of an existing note.
   * 
   * @param {number} id - Note ID
   * @param {UpdateNoteRequest} noteData - Partial note data
   * @returns {Promise<ApiResponse<Note>>} Updated note object
   */
  async partialUpdateNote(id: number, noteData: UpdateNoteRequest): Promise<ApiResponse<Note>> {
    return this.request(`/api/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(noteData),
    });
  }

  /**
   * Delete Note
   * 
   * Permanently deletes a note for the authenticated user.
   * 
   * @param {number} id - Note ID
   * @returns {Promise<ApiResponse<Note>>} Deletion confirmation
   */
  async deleteNote(id: number): Promise<ApiResponse<Note>> {
    return this.request(`/api/notes/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Analyze Notes with AI
   * 
   * Triggers AI-powered analysis of user notes to generate mental health
   * insights and recommendations.
   * 
   * @param {'manual' | 'automatic'} triggerType - How analysis was triggered
   * @returns {Promise<AnalysisResponse>} Analysis results and generated resources
   */
  async analyzeNotes(triggerType: 'manual' | 'automatic' = 'manual'): Promise<AnalysisResponse> {
    return this.request('/api/analyze-notes', {
      method: 'POST',
      body: JSON.stringify({ triggerType }),
    });
  }

  /**
   * Get Analysis History
   * 
   * Retrieves all past analysis results for the authenticated user.
   * 
   * @returns {Promise<AnalysisLogsResponse>} Array of analysis logs
   */
  async getAnalysisLogs(): Promise<AnalysisLogsResponse> {
    return this.request('/api/analysis-logs');
  }

  /**
   * Get Specific Analysis Log
   * 
   * Retrieves a specific analysis result by ID.
   * 
   * @param {number} id - Analysis log ID
   * @returns {Promise<Object>} Analysis log object
   */
  async getAnalysisLogById(id: number): Promise<{ message: string; log: any }> {
    return this.request(`/api/analysis-logs/${id}`);
  }
}

export const apiService = new ApiService();
