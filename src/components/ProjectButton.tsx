// src/components/ProjectButton.tsx

import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { Project } from '@/types';
import { TrashIcon } from '@heroicons/react/24/outline';

interface ProjectButtonProps {
  project: Project;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDrop: (taskId: string, projectId: string) => void;
}

function ProjectButton({ project, isSelected, onSelect, onDelete, onDrop }: ProjectButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop<{ id: string; projectId: string }, void, { isOver: boolean }>({
    accept: 'TASK',
    drop: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (didDrop) {
        return;
      }
      if (item.id && project.id) {
        console.log('Dropping task in ProjectButton:', item.id, 'to project:', project.id);
        onDrop(item.id, project.id);
      } else {
        console.error('Invalid drop item or project:', item, project);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  drop(ref);

  return (
    <div ref={ref} className={`flex items-center mb-2 ${isOver ? 'border-2 border-green-500' : ''}`}>
      <button
        className={`flex-grow cursor-pointer p-2 rounded ${
          isSelected 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
        onClick={() => onSelect(project.id)}
      >
        {project.name}
      </button>
      <button
        className="ml-2 p-2 text-red-500 hover:text-red-700"
        onClick={() => onDelete(project.id)}
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

export default ProjectButton;