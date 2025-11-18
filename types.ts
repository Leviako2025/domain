
export interface IdentityIdea {
  handle: string;
  style: string; // e.g., "Minimal", "Gamer", "Professional"
  explanation: string;
  vibe: string;
  availabilityScore: number; // 1-10 uniqueness estimate
  category: string; // e.g., "Commerce", "Gaming", "Tech"
}

export interface IdentityAnalysis {
  handle: string;
  takenOn: string[]; // List of platforms where it appears taken
  summary: string;
  profileTitle?: string;
  profileDescription?: string;
  tldStatus?: {
    [key: string]: 'AVAILABLE' | 'TAKEN' | 'UNKNOWN';
  };
}

export interface User {
  name: string;
  email: string;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR',
  SAVED = 'SAVED'
}
