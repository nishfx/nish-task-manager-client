// src/app/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects, getTasks, createProject, createTask } from '@/utils/api';
import { Project, Task } from '@/types';
import { withAuth } from '@/components/withAuth';
import { NewProjectForm } from '@/components/NewProjectForm';
import { NewTaskForm } from '@/components/NewTaskForm';
import { TaskItem } from '@/components/TaskItem';

function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data);
      if (response.data.length > 0) {
        setSelectedProject(response.data[0].id);
      }
    } catch (err: any) {
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

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleProjectCreated = async (projectName: string) => {
    try {
      const response = await createProject(projectName);
      const newProject = response.data;
      setProjects([...projects, newProject]);
      setSelectedProject(newProject.id);
    } catch (err) {
      setError('Failed to create project');
    }
  };

  const handleTaskCreated = async (taskData: Omit<Task, 'id' | 'user' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await createTask(taskData);
      const newTask = response.data;
      setTasks([...tasks, newTask]);
    } catch (err) {
      setError('Failed to create task');
    }
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
              {projects.map((project) => (
                <li
                  key={project.id}
                  className={`cursor-pointer p-2 mb-2 rounded ${
                    selectedProject === project.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  onClick={() => handleProjectSelect(project.id)}
                >
                  {project.name}
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
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Dashboard);