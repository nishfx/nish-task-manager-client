// src/components/NewTaskForm.tsx

import React, { useState } from 'react';
import { createTask } from '@/utils/api';
import { Task } from '@/types';

interface NewTaskFormProps {
  projectId: string;
  onTaskCreated: (task: Task) => void;
}

export function NewTaskForm({ projectId, onTaskCreated }: NewTaskFormProps) {
  const [taskTitle, setTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      const newTask = {
        title: taskTitle,
        description: '',
        status: 'To Do' as const,
        priority: 'Medium' as const,
        project: projectId,
        subtasks: [], // Add this line
      };
      const response = await createTask(newTask);
      onTaskCreated(response.data);
      setTaskTitle('');
      setMessage('Task added successfully!');
    } catch (error) {
      console.error('Failed to create task:', error);
      setMessage('Failed to add task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
        placeholder="New task title"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        required
      />
      <button
        type="submit"
        className={`mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isLoading}
      >
        {isLoading ? 'Adding...' : 'Add Task'}
      </button>
      {message && <p className={`mt-2 ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
    </form>
  );
}