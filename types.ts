
export interface GrammarSuggestion {
  original: string;
  suggestion: string;
  explanation: string;
  context: string; // The surrounding text to help locate the error
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AIAnalysisResponse {
  suggestions: GrammarSuggestion[];
}

// Enum for the active view in the sidebar
export enum SidebarView {
  FILES = 'FILES',
  GRAMMAR = 'GRAMMAR',
  CHAT = 'CHAT'
}

export interface ProjectFile {
  name: string;
  type: 'tex' | 'bib' | 'img' | 'cls';
  content: string;
}
