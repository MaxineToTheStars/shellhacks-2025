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

export interface MentalHealthResource {
  title: string;
  description: string;
  type: 'article' | 'exercise' | 'technique' | 'tool' | 'analysis';
  url?: string;
}

export interface AnalysisResult {
  analysis: string;
  resources: MentalHealthResource[];
  recommendations: string;
}

export interface AnalysisLog {
  log_id: number;
  user_id: string;
  analysis_type: string;
  notes_analyzed: Array<{ id: number; title: string }>;
  generated_resources: AnalysisResult;
  created_at: string;
  trigger_type: 'manual' | 'automatic';
}

export interface AnalysisResponse {
  message: string;
  analysis: AnalysisResult;
  logId: number;
  notesAnalyzed: number;
}

export interface AnalysisLogsResponse {
  message: string;
  count: number;
  logs: AnalysisLog[];
}
