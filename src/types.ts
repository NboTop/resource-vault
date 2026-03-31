export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'Saved' | 'To Review' | 'In Progress' | 'Completed' | 'Archived';

export interface Resource {
  id: string;
  title: string;
  url: string | null;
  category: string;
  tags: string[];
  notes: string;
  priority: Priority;
  source: string;
  status: Status;
  createdAt: number;
  isAiCategorized?: boolean;
}

export interface AppState {
  resources: Resource[];
  theme: 'dark' | 'light';
  geminiApiKey: string;
  defaultCategory: string;
}
