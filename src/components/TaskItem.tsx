// src/components/TaskItem.tsx (client side)

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Task } from '@/types';
import { updateTask } from '@/utils/api';
import { WrenchIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

interface TaskItemProps {
  task: Task;
  index: number;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
  onTaskUpdated: (updatedTask: Task) => void;
}

export function TaskItem({ task, index, moveTask, onTaskUpdated }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<
    { id: string; index: number; projectId: string },
    void,
    { handlerId: string | symbol | null }
  >({
    accept: 'TASK',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: { id: string; index: number; projectId: string }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveTask(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'TASK',
    item: () => {
      console.log('Dragging task:', task._id);
      return { id: task._id, index, projectId: task.project };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  drag(ref);

  const handleEdit = useCallback(() => setIsEditing(true), []);

  const handleCancel = useCallback(() => {
    setEditedTask(task);
    setIsEditing(false);
  }, [task]);

  const handleSave = useCallback(async () => {
    try {
      const { data: updatedTask } = await updateTask(task._id, editedTask);
      onTaskUpdated(updatedTask);
      setIsEditing(false);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task. Please try again.');
    }
  }, [editedTask, onTaskUpdated, task._id]);

  const getPriorityColor = useCallback((priority: Task['priority']) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Low': return 'bg-green-300';
      default: return 'bg-gray-300';
    }
  }, []);

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
          placeholder="Add a description"
        />
        <select
          value={editedTask.priority}
          onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as Task['priority'] })}
          className="w-full mb-2 p-2 border rounded"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <div className="flex justify-end space-x-2">
          <button onClick={handleCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded">Cancel</button>
          <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="bg-white p-4 mb-4 rounded shadow flex cursor-move"
      data-handler-id={handlerId}
    >
      <div className="flex-grow">
        <h3 className="font-bold text-gray-800">{task.title}</h3>
        {task.description && <p className="text-gray-600 mt-2">{task.description}</p>}
      </div>
      <div className="flex flex-col items-end">
        <button onClick={handleEdit} className="text-gray-500 hover:text-gray-700">
          <WrenchIcon className="h-5 w-5" />
        </button>
        <div className={`w-2 h-full mt-2 ${getPriorityColor(task.priority)}`}></div>
      </div>
    </div>
  );
}