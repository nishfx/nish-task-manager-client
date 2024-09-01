// src/components/TaskItem.tsx

import React, { useState } from 'react';
import { Task } from '@/types';
import { updateTask } from '@/utils/api';

interface TaskItemProps {
  task: Task;
  onTaskUpdated: (updatedTask: Task) => void;
}

export function TaskItem({ task, onTaskUpdated }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    try {
      const response = await updateTask(task.id, editedTask);
      onTaskUpdated(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white p-4 mb-4 rounded shadow">
        <input
          type="text"
          value={editedTask.title}
          onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
        />
        <textarea
          value={editedTask.description}
          onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
        />
        <select
          value={editedTask.status}
          onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as Task['status'] })}
          className="w-full mb-2 p-2 border rounded"
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 mb-4 rounded shadow">
      <h3 className="font-bold text-gray-800">{task.title}</h3>
      <p className="text-gray-600">{task.description}</p>
      <div className="mt-2">
        <span className={`px-2 py-1 rounded text-sm ${
          task.status === 'To Do' ? 'bg-red-200 text-red-800' :
          task.status === 'In Progress' ? 'bg-yellow-200 text-yellow-800' :
          'bg-green-200 text-green-800'
        }`}>
          {task.status}
        </span>
        <span className="ml-2 text-sm text-gray-600">
          Priority: {task.priority}
        </span>
      </div>
      <button onClick={handleEdit} className="mt-2 bg-gray-200 text-gray-800 px-4 py-2 rounded">Edit</button>
    </div>
  );
}