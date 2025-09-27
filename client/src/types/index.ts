export interface Note {
  note_id: number;
  title: string;
  content: string;
  last_updated: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}

export interface ApiResponse<T> {
  message: string;
  note?: T;
  notes?: T[];
  count?: number;
  result?: any;
}

export interface ApiError {
  error: string;
  message: string;
}
