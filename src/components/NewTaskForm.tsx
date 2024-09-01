// src/components/NewTaskForm.tsx

import React, { useState } from 'react';
import { createTask } from '@/utils/api';

interface NewTaskFormProps {
  projectId: string;
  onTaskCreated: (task: any) => void;
}

export function NewTaskForm({ projectId, onTaskCreated }: NewTaskFormProps) {
  const [taskTitle, setTaskTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await createTask({
        title: taskTitle,
        description: '',
        status: 'To Do',
        priority: 'Medium',
        project: projectId,
        subtasks: [], // Add this line
      });
      onTaskCreated(response.data);
      setTaskTitle('');
    } catch (error) {
      console.error('Failed to create task:', error);
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
        className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Add Task
      </button>
    </form>
  );
}