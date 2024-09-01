// src/types/index.ts

export interface User {
    id: string;
    username: string;
  }
  
  export interface Project {
    id: string;
    name: string;
    user: string;
  }
  
  export interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'To Do' | 'In Progress' | 'Done';
    priority: 'Low' | 'Medium' | 'High';
    dueDate?: string;
    project: string;
    user: string;
    subtasks: Subtask[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
  }