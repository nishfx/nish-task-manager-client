// src/components/NewProjectForm.tsx

import React, { useState } from 'react';
import { createProject } from '@/utils/api';

interface NewProjectFormProps {
  onProjectCreated: (project: any) => void;
}

export function NewProjectForm({ onProjectCreated }: NewProjectFormProps) {
  const [projectName, setProjectName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onProjectCreated(projectName);
      setProjectName('');
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="New project name"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        required
      />
      <button
        type="submit"
        className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Add Project
      </button>
    </form>
  );
}