// src/app/dashboard/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects, getTasks, createProject, deleteProject } from '@/utils/api';
import { Project, Task } from '@/types';
import { withAuth } from '@/components/withAuth';
import { NewProjectForm } from '@/components/NewProjectForm';
import { NewTaskForm } from '@/components/NewTaskForm';
import { TaskItem } from '@/components/TaskItem';
import { TrashIcon } from '@heroicons/react/24/outline';
import { v4 as uuidv4 } from 'uuid';

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
    setTasks(prevTasks => [
      ...prevTasks,
      { ...newTask, id: newTask.id || uuidv4() }  // Use server-provided ID or generate a temporary one
    ]);
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
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
                <li key={project.id} className="flex items-center mb-2">
                  <button
                    className={`flex-grow cursor-pointer p-2 rounded ${
                      selectedProject === project.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                    onClick={() => handleProjectSelect(project.id)}
                  >
                    {project.name}
                  </button>
                  <button
                    className="ml-2 p-2 text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteConfirm(project.id)}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </li>
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
                  {tasks.map((task) => {
                    console.log('Rendering task:', task);  // Add this line
                    return (
                      <TaskItem
                        key={task.id || uuidv4()}
                        task={task}
                        onTaskUpdated={(updatedTask) => {
                          setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
                        }}
                      />
                    );
                  })}
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
    </div>
  );
}

export default withAuth(Dashboard);