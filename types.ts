
export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  created_at: string;
  title: string;
  description?: string;
  is_completed: boolean;
  priority: Priority;
  category: string;
}

export interface AIAnalysis {
  subtasks: string[];
  tips: string;
  estimatedTime: string;
}
