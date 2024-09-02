// src/app/dashboard/page.tsx (client side)

'use client';

import axios from 'axios';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { getProjects, getTasks, createProject, deleteProject, updateTask, reorderTasks, moveTaskToProject } from '@/utils/api';
import { Project, Task } from '@/types';
import { withAuth } from '@/components/withAuth';
import { NewProjectForm } from '@/components/NewProjectForm';
import { NewTaskForm } from '@/components/NewTaskForm';
import { TaskItem } from '@/components/TaskItem';
import { TrashIcon } from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';
import { CustomDragLayer } from '@/components/CustomDragLayer';

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
    drop: (item) => onDrop(item.id, project.id),
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

function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  const fetchProjects = useCallback(async () => {
    console.log('fetchProjects called');
    try {
      const response = await getProjects();
      console.log('Fetched projects response:', response);

      const mappedProjects = response.data.map((project: any) => ({
        id: project.id || project._id, // Handle both id and _id
        name: project.name,
        user: project.user
      }));

      console.log('Mapped projects:', mappedProjects);
      setProjects(mappedProjects);
      if (mappedProjects.length > 0 && !selectedProject) {
        setSelectedProject(mappedProjects[0].id);
      }
    } catch (err: any) {
      console.log('Error fetching projects:', err);
      setError('Failed to fetch projects');
      if (err.response && err.response.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router, selectedProject]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    console.log('Tasks state updated:', tasks);
  }, [tasks]);

  const fetchTasks = useCallback(async () => {
    if (selectedProject) {
      try {
        setLoading(true);
        const response = await getTasks(selectedProject);
        setTasks(response.data);
      } catch (err) {
        setError('Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks();
    }
  }, [selectedProject, fetchTasks]);

  const handleProjectSelect = useCallback((projectId: string) => {
    console.log('Selecting project:', projectId);
    setSelectedProject(projectId);
  }, []);

  const handleProjectCreated = useCallback(async (newProject: Project) => {
    console.log('New project created:', newProject);
    setProjects(prevProjects => [...prevProjects, newProject]);
    setSelectedProject(newProject.id);
  }, []);

  const handleDeleteConfirm = useCallback((projectId: string) => {
    console.log('Delete confirmation triggered for project:', projectId);
    setShowDeleteConfirm(projectId);
  }, []);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    console.log('Attempting to delete project:', projectId);
    if (!projectId) {
      console.error('Project ID is undefined');
      setError('Failed to delete project: Invalid project ID');
      return;
    }
    try {
      await deleteProject(projectId);
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
      if (selectedProject === projectId) {
        const remainingProjects = projects.filter(p => p.id !== projectId);
        setSelectedProject(remainingProjects.length > 0 ? remainingProjects[0].id : null);
        setTasks([]);
      }
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
      setError('Failed to delete project');
    }
  }, [projects, selectedProject]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleTaskCreated = useCallback((newTask: Task) => {
    console.log('handleTaskCreated called with:', newTask);
    setTasks(prevTasks => {
      console.log('Previous tasks:', prevTasks);
      const updatedTasks = [...prevTasks, newTask];
      console.log('Updated tasks:', updatedTasks);
      return updatedTasks;
    });
  }, []);

  const moveTask = useCallback(async (dragIndex: number, hoverIndex: number) => {
    if (!selectedProject) return;

    const newTasks = [...tasks];
    const [reorderedItem] = newTasks.splice(dragIndex, 1);
    newTasks.splice(hoverIndex, 0, reorderedItem);
    
    setTasks(newTasks); // Optimistic update

    try {
      const updatedTasks = await reorderTasks(selectedProject, newTasks.map(task => task._id));
      setTasks(updatedTasks);
      toast.success('Tasks reordered successfully');
    } catch (error) {
      console.error('Failed to reorder tasks:', error);
      setTasks(tasks); // Revert to original order
      toast.error('Failed to reorder tasks. Please try again.');
    }
  }, [tasks, selectedProject]);

  const handleTaskDrop = useCallback(async (taskId: string, newProjectId: string) => {
    console.log('Dropping task:', taskId, 'to project:', newProjectId);
    if (!taskId || !newProjectId) {
      console.error('Invalid taskId or newProjectId:', { taskId, newProjectId });
      toast.error('Failed to move task: Invalid task or project');
      return;
    }
    if (selectedProject === newProjectId) return;
  
    try {
      const movedTask = await moveTaskToProject(taskId, newProjectId);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
  
      // If the task was moved to the currently selected project, add it to the tasks list
      if (selectedProject === newProjectId) {
        setTasks(prevTasks => [...prevTasks, movedTask]);
      }
    } catch (error) {
      console.error('Failed to move task:', error);
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.message || error.response.data.error || 'Unknown error occurred';
        toast.error(`Failed to move task: ${errorMessage}`);
      } else {
        toast.error('Failed to move task. Please try again.');
      }
    }
  }, [selectedProject]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between">
              <div className="flex space-x-7">
                <div>
                  <a href="#" className="flex items-center py-4 px-2">
                    <span className="font-semibold text-gray-800 text-lg">Task Manager</span>
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <a
                  href="#"
                  className="py-2 px-2 font-medium text-gray-700 rounded hover:bg-gray-100 hover:text-gray-900 transition duration-300"
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className="py-2 px-2 font-medium text-gray-700 rounded hover:bg-gray-100 hover:text-gray-900 transition duration-300"
                >
                  Projects
                </a>
                <a
                  href="#"
                  className="py-2 px-2 font-medium text-gray-700 rounded hover:bg-gray-100 hover:text-gray-900 transition duration-300"
                >
                  Tasks
                </a>
                <button
                  onClick={handleLogout}
                  className="py-2 px-2 font-medium text-gray-700 rounded hover:bg-gray-100 hover:text-gray-900 transition duration-300"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto mt-8 px-4">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/4 mb-4 md:mb-0">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Projects</h2>
              <NewProjectForm onProjectCreated={handleProjectCreated} />
              <ul>
                {projects.map((project) => (
                  <ProjectButton
                    key={project.id}
                    project={project}
                    isSelected={selectedProject === project.id}
                    onSelect={handleProjectSelect}
                    onDelete={handleDeleteConfirm}
                    onDrop={handleTaskDrop}
                  />
                ))}
              </ul>
            </div>
            <div className="w-full md:w-3/4 md:pl-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Tasks</h2>
              {selectedProject && (
                <NewTaskForm projectId={selectedProject} onTaskCreated={handleTaskCreated} />
              )}
              {loading ? (
                <p className="text-gray-800">Loading tasks...</p>
              ) : selectedProject ? (
                tasks.length > 0 ? (
                  <ul>
                    {tasks.map((task) => (
                      <TaskItem
                        key={task._id}  // Use _id instead of id
                        task={task}
                        index={tasks.indexOf(task)}
                        moveTask={moveTask}
                        onTaskUpdated={(updatedTask) => {
                          setTasks(prevTasks => prevTasks.map(t => t._id === updatedTask._id ? updatedTask : t));
                        }}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-800">No tasks yet. Add a new task above.</p>
                )
              ) : (
                <p className="text-gray-800">Select a project to view tasks.</p>
              )}
            </div>
          </div>
        </div>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-5 rounded-lg">
              <p className="text-gray-800">Are you sure you want to delete project {projects.find(p => p.id === showDeleteConfirm)?.name}?</p>
              <div className="mt-4 flex justify-end">
                <button
                  className="mr-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleDeleteProject(showDeleteConfirm)}
                >
                  Yes
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
        <ToastContainer />
        <CustomDragLayer />
      </div>
    </DndProvider>
  );
}

export default withAuth(Dashboard);