// src/app/dashboard/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects, getTasks, createProject, createTask, deleteProject } from '@/utils/api';
import { Project, Task } from '@/types';
import { withAuth } from '@/components/withAuth';
import { NewProjectForm } from '@/components/NewProjectForm';
import { NewTaskForm } from '@/components/NewTaskForm';
import { TaskItem } from '@/components/TaskItem';
import { TrashIcon } from '@heroicons/react/24/outline';

function Dashboard() {
  console.log('Dashboard component rendered'); // Log to confirm component is rendered

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('useEffect called'); // Log to confirm useEffect is executed
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    console.log('fetchProjects called');
    try {
      const response = await getProjects();
      console.log('Fetched projects response:', response);
  
      const projects = response.data.map((project: any) => ({
        id: project._id, // Use _id from MongoDB
        name: project.name,
      }));
  
      console.log('Mapped projects:', projects);
  
      setProjects(projects);
      if (projects.length > 0) {
        setSelectedProject(projects[0].id);
      }
    } catch (err: any) {
      console.log('Error fetching projects:', err);
      setError('Failed to fetch projects');
      if (err.response && err.response.status === 401) {
        router.push('/login');
      }
    }
  };

  const fetchTasks = async () => {
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
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleProjectSelect = (projectId: string) => {
    console.log('Selecting project:', projectId);
    setSelectedProject(projectId);
    fetchTasks();
  };
  
  const handleProjectCreated = async (newProject: Project) => {
    console.log('New project created:', newProject);
    try {
      setProjects(prevProjects => [...prevProjects, newProject]);
      setSelectedProject(newProject._id); // Using _id from MongoDB
      await fetchTasks(); // Fetch tasks for the newly created project
    } catch (err) {
      console.error('Error handling new project:', err);
      setError('Failed to handle new project');
    }
  };

  const handleDeleteConfirm = (projectId: string) => {
    console.log('Delete confirmation triggered for project:', projectId);
    if (projectId) {
      setShowDeleteConfirm(projectId);
    } else {
      console.error('Project ID is undefined');
    }
  };
  
  const handleDeleteProject = useCallback(async (projectId: string) => {
    console.log('Attempting to delete project:', projectId);
    if (!projectId) {
      console.error('Project ID is undefined');
      setError('Failed to delete project: Invalid project ID');
      return;
    }
    try {
      await deleteProject(projectId);
      setProjects(prevProjects => prevProjects.filter(p => p._id !== projectId));
      if (selectedProject === projectId) {
        setSelectedProject(null);
        setTasks([]);
      }
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
      setError('Failed to delete project');
    }
  }, [selectedProject]);

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

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
              {projects.map((project) => {
                console.log('Rendering project:', project);
                return (
                  <li key={project._id} className="flex items-center mb-2">
                    <button
                      className={`flex-grow cursor-pointer p-2 rounded ${
                        selectedProject === project._id 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                      onClick={() => handleProjectSelect(project._id)}
                    >
                      {project.name}
                    </button>
                    <button
                      className="ml-2 p-2 text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteConfirm(project._id)}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </li>
                );
              })}
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
                      key={task.id}
                      task={task}
                      onTaskUpdated={(updatedTask) => {
                        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
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
            <p className="text-gray-800">Are you sure you want to delete project {projects.find(p => p._id === showDeleteConfirm)?.name}?</p>
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