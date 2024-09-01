// src/utils/api.ts

import axios from 'axios';
import { Task } from '@/types';

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

export const login = (username: string, password: string) =>
  api.post('/auth/login', { username, password });

export const register = (username: string, password: string) =>
  api.post('/auth/register', { username, password });

export const getProjects = () => api.get('/projects');

export const createProject = (name: string) => api.post('/projects', { name });

export const getTasks = (projectId: string) => api.get(`/tasks/project/${projectId}`);

export const createTask = (task: Omit<Task, 'id' | 'user' | 'createdAt' | 'updatedAt'>) =>
  api.post('/tasks', task);

export const updateTask = (taskId: string, updatedTask: Partial<Task>) =>
  api.put(`/tasks/${taskId}`, updatedTask);

export const deleteTask = (taskId: string) => api.delete(`/tasks/${taskId}`);

export const deleteProject = async (projectId: string) => {
  if (!projectId) {
    console.error('Attempting to delete project with undefined ID');
    throw new Error('Invalid project ID');
  }
  try {
    console.log('Deleting project with ID:', projectId);
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export default api;