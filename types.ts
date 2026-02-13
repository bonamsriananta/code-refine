export enum AnalysisType {
  GENERAL_REVIEW = 'General Review',
  BUG_DETECTION = 'Bug Detection',
  PERFORMANCE = 'Performance Optimization',
  SECURITY = 'Security Check',
}

export interface AnalysisState {
  isLoading: boolean;
  result: string;
  error: string | null;
}

export interface CodeSnippet {
  code: string;
  language: string;
}