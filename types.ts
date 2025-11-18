export interface IdentityIdea {
  handle: string;
  style: string; // e.g., "Minimal", "Gamer", "Professional"
  explanation: string;
  vibe: string;
  availabilityScore: number; // 1-10 uniqueness estimate
}

export interface IdentityAnalysis {
  handle: string;
  takenOn: string[]; // List of platforms where it appears taken
  summary: string;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR',
  SAVED = 'SAVED'
}