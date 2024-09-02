// src/utils/api.ts (client side)

import axios from 'axios';
import { Task, Project } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://h2843541.stratoserver.net:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export const createTask = (task: Omit<Task, 'id' | 'user' | 'createdAt' | 'updatedAt'>) =>
  api.post<Task>('/tasks', task);

export const reorderTasks = async (projectId: string, taskIds: string[]) => {
  try {
    const response = await api.put<{ message: string }>(`/tasks/reorder/${projectId}`, { taskIds });
    return response.data;
  } catch (error) {
    console.error('Error reordering tasks:', error);
    throw error;
  }
};

export const moveTaskToProject = async (taskId: string, newProjectId: string) => {
  try {
    const response = await api.put<Task>(`/tasks/${taskId}`, { project: newProjectId });
    return response.data;
  } catch (error) {
    console.error('Error moving task to new project:', error);
    throw error;
  }
};

export const login = (username: string, password: string) =>
  api.post<{ token: string }>('/auth/login', { username, password });

export const register = (username: string, password: string) =>
  api.post<{ token: string }>('/auth/register', { username, password });

export const getProjects = () => api.get<Project[]>('/projects');

export const createProject = (name: string) => api.post<Project>('/projects', { name });

export const getTasks = (projectId: string) => api.get<Task[]>(`/tasks/project/${projectId}`);

export const updateTask = (taskId: string, updatedTask: Partial<Task>) =>
  api.put<Task>(`/tasks/${taskId}`, updatedTask);

export const deleteTask = (taskId: string) => api.delete(`/tasks/${taskId}`);

export const deleteProject = async (projectId: string) => {
  if (!projectId) {
    throw new Error('Invalid project ID');
  }
  try {
    const response = await api.delete<{ message: string }>(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export default api;