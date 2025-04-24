import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, isToday, isAfter, isBefore, parseISO, isFuture, isPast } from 'date-fns';
import { useUser } from '@clerk/clerk-react';

// Create the context
const TaskContext = createContext();

// Custom hook to use the task context
export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}

// Task provider component
export function TaskProvider({ children }) {
  const { user, isLoaded } = useUser();
  
  // Get storage key based on user ID or use a default for non-authenticated users
  const getStorageKey = (baseKey) => {
    if (user) {
      return `${baseKey}_${user.id}`;
    }
    return `${baseKey}_guest`;
  };

  // Initialize state from localStorage or empty arrays
  const [tasks, setTasks] = useState(() => {
    const storageKey = getStorageKey('tasks');
    const savedTasks = localStorage.getItem(storageKey);
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [folders, setFolders] = useState(() => {
    try {
      const storageKey = getStorageKey('folders');
      const savedFolders = localStorage.getItem(storageKey);
      return savedFolders ? JSON.parse(savedFolders) : [
        { id: 'default', name: 'Default', color: '#3b82f6' }
      ];
    } catch (error) {
      console.error('Error loading folders:', error);
      return [{ id: 'default', name: 'Default', color: '#3b82f6' }];
    }
  });

  // Update storage keys when user authentication state changes
  useEffect(() => {
    if (isLoaded) {
      // Clear previous data when user state changes
      setTasks([]);
      setFolders([{ id: 'default', name: 'Default', color: '#3b82f6' }]);
      
      // Load user-specific data if available
      const tasksKey = getStorageKey('tasks');
      const foldersKey = getStorageKey('folders');
      
      const savedTasks = localStorage.getItem(tasksKey);
      const savedFolders = localStorage.getItem(foldersKey);
      
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
      
      if (savedFolders) {
        setFolders(JSON.parse(savedFolders));
      }
    }
  }, [isLoaded, user]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    const storageKey = getStorageKey('tasks');
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks, user]);

  // Save folders to localStorage whenever they change
  useEffect(() => {
    try {
      const storageKey = getStorageKey('folders');
      localStorage.setItem(storageKey, JSON.stringify(folders));
    } catch (error) {
      console.error('Error saving folders:', error);
    }
  }, [folders, user]);

  // Add a new task
  const addTask = (taskData) => {
    const newTask = {
      id: Date.now().toString(),
      title: taskData.title,
      date: taskData.date,
      time: taskData.time,
      completed: false,
      isMainTask: taskData.isMainTask,
      parentTaskId: taskData.parentTaskId || null,
      folderId: taskData.folderId || 'default',
      notes: taskData.notes || '',
      createdAt: new Date().toISOString()
    };

    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  // Update an existing task
  const updateTask = (taskId, updates) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  // Delete a task
  const deleteTask = (taskId) => {
    setTasks(prevTasks => {
      // First, get all sub-tasks of this task
      const subTaskIds = prevTasks
        .filter(task => task.parentTaskId === taskId)
        .map(task => task.id);

      // Then filter out both the main task and all its sub-tasks
      return prevTasks.filter(task => 
        task.id !== taskId && !subTaskIds.includes(task.id)
      );
    });
  };

  // Toggle task completion
  const toggleTask = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const newCompleted = !task.completed;
          // If completing a main task, complete all sub-tasks
          if (newCompleted && task.isMainTask) {
            return {
              ...task,
              completed: newCompleted,
              subTasks: prevTasks
                .filter(t => t.parentTaskId === taskId)
                .map(t => ({ ...t, completed: true }))
            };
          }
          return { ...task, completed: newCompleted };
        }
        return task;
      })
    );
  };

  // Get all tasks
  const getAllTasks = () => tasks;

  // Get tasks by date (exact match)
  const getTasksByDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter(task => task.date === dateStr);
  };

  // Get tasks by tab
  const getTasksByTab = (tab) => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    switch (tab) {
      case 'today':
        return tasks.filter(task => task.date === todayStr);
      case 'upcoming':
        return tasks.filter(task => 
          task.date && isFuture(new Date(task.date)) && task.date !== todayStr
        );
      case 'completed':
        return tasks.filter(task => task.completed);
      default:
        return tasks;
    }
  };

  // Get main tasks (tasks that can have sub-tasks)
  const getMainTasks = () => {
    return tasks.filter(task => task.isMainTask && !task.parentTaskId);
  };

  // Get sub-tasks for a specific main task
  const getSubTasks = (parentTaskId) => {
    return tasks.filter(task => task.parentTaskId === parentTaskId);
  };

  // Add a new folder
  const addFolder = (folderData) => {
    const newFolder = {
      id: Date.now().toString(),
      name: folderData.name,
      color: folderData.color || '#3b82f6',
      createdAt: new Date().toISOString()
    };

    setFolders(prevFolders => [...prevFolders, newFolder]);
  };

  // Update an existing folder
  const updateFolder = (folderId, updates) => {
    setFolders(prevFolders => 
      prevFolders.map(folder => 
        folder.id === folderId ? { ...folder, ...updates } : folder
      )
    );
  };

  // Delete a folder
  const deleteFolder = (folderId) => {
    // Don't allow deleting the default folder
    if (folderId === 'default') return;
    
    // Move tasks from the deleted folder to the default folder
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.folderId === folderId ? { ...task, folderId: 'default' } : task
      )
    );
    
    // Remove the folder
    setFolders(prevFolders => prevFolders.filter(folder => folder.id !== folderId));
  };

  // Context value
  const value = {
    tasks,
    folders,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    getAllTasks,
    getTasksByDate,
    getTasksByTab,
    getMainTasks,
    getSubTasks,
    addFolder,
    updateFolder,
    deleteFolder,
    isAuthenticated: !!user
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
} 