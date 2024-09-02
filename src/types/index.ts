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
  _id: string;  // Change this from 'id' to '_id'
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  project: string;
  user: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

// If you need a separate interface for creating tasks, you can define it like this:
export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  project: string;
}