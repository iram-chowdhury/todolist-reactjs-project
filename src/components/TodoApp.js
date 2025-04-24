import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Plus, FolderPlus, ChevronRight } from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import { TodoForm } from './TodoForm';
import { Todo } from './Todo';
import { format, isToday, isFuture, isPast, parseISO } from 'date-fns';

export default function TodoApp() {
  const { 
    tasks, 
    folders, 
    addTask, 
    updateTask, 
    deleteTask, 
    addFolder, 
    getMainTasks, 
    getSubTasks 
  } = useTasks();
  
  const [activeTab, setActiveTab] = useState('all');
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3b82f6');
  const [expandedTasks, setExpandedTasks] = useState({});

  // Filter tasks based on the active tab
  const filteredTasks = tasks.filter(task => {
    if (!task.date) return activeTab === 'all';
    const taskDate = parseISO(task.date);
    
    switch (activeTab) {
      case 'all':
        return true;
      case 'today':
        return isToday(taskDate);
      case 'upcoming':
        return isFuture(taskDate);
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });

  // Get main tasks (tasks that can have sub-tasks)
  const mainTasks = getMainTasks().filter(task => {
    if (!task.date) return activeTab === 'all';
    const taskDate = parseISO(task.date);
    
    switch (activeTab) {
      case 'all':
        return true;
      case 'today':
        return isToday(taskDate);
      case 'upcoming':
        return isFuture(taskDate);
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });

  // Handle adding a new task
  const handleAddTask = (taskData) => {
    addTask({
      ...taskData,
      isMainTask: true,
      parentTaskId: null,
      completed: false
    });
    setShowTodoForm(false);
  };

  // Handle toggling a task's completion status
  const handleToggleTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { completed: !task.completed });
    }
  };

  // Handle deleting a task
  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
  };

  // Handle adding a new folder
  const handleAddFolder = (e) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      addFolder({
        name: newFolderName.trim(),
        color: newFolderColor
      });
      setNewFolderName('');
      setShowFolderForm(false);
    }
  };

  // Toggle expanded state of a main task
  const toggleExpanded = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFolderForm(true)}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
            {activeTab !== 'completed' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowTodoForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            )}
          </div>
        </div>

        {showFolderForm && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <form onSubmit={handleAddFolder} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Folder Name"
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newFolderColor}
                    onChange={(e) => setNewFolderColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <span className="dark:text-gray-200">Folder Color</span>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowFolderForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    size="sm" 
                  >
                    Create Folder
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {showTodoForm && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <TodoForm onSubmit={handleAddTask} />
            </CardContent>
          </Card>
        )}

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {mainTasks.length > 0 ? (
                <div className="space-y-4">
                  {mainTasks.map(task => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(task.id)}
                          >
                            <ChevronRight 
                              className={`h-4 w-4 transition-transform ${
                                expandedTasks[task.id] ? 'rotate-90' : ''
                              }`}
                            />
                          </Button>
                          <Todo
                            task={task}
                            onToggle={handleToggleTask}
                            onDelete={handleDeleteTask}
                          />
                        </div>
                      </div>
                      {expandedTasks[task.id] && (
                        <div className="ml-8 mt-2 space-y-2">
                          {getSubTasks(task.id).map(subTask => (
                            <Todo
                              key={subTask.id}
                              task={subTask}
                              onToggle={handleToggleTask}
                              onDelete={handleDeleteTask}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No tasks yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {mainTasks.length > 0 ? (
                <div className="space-y-4">
                  {mainTasks.map(task => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(task.id)}
                          >
                            <ChevronRight 
                              className={`h-4 w-4 transition-transform ${
                                expandedTasks[task.id] ? 'rotate-90' : ''
                              }`}
                            />
                          </Button>
                          <Todo
                            task={task}
                            onToggle={handleToggleTask}
                            onDelete={handleDeleteTask}
                          />
                        </div>
                      </div>
                      {expandedTasks[task.id] && (
                        <div className="ml-8 mt-2 space-y-2">
                          {getSubTasks(task.id).map(subTask => (
                            <Todo
                              key={subTask.id}
                              task={subTask}
                              onToggle={handleToggleTask}
                              onDelete={handleDeleteTask}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No tasks for today</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {mainTasks.length > 0 ? (
                <div className="space-y-4">
                  {mainTasks.map(task => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(task.id)}
                          >
                            <ChevronRight 
                              className={`h-4 w-4 transition-transform ${
                                expandedTasks[task.id] ? 'rotate-90' : ''
                              }`}
                            />
                          </Button>
                          <Todo
                            task={task}
                            onToggle={handleToggleTask}
                            onDelete={handleDeleteTask}
                          />
                        </div>
                      </div>
                      {expandedTasks[task.id] && (
                        <div className="ml-8 mt-2 space-y-2">
                          {getSubTasks(task.id).map(subTask => (
                            <Todo
                              key={subTask.id}
                              task={subTask}
                              onToggle={handleToggleTask}
                              onDelete={handleDeleteTask}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No upcoming tasks</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {mainTasks.length > 0 ? (
                <div className="space-y-4">
                  {mainTasks.map(task => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(task.id)}
                          >
                            <ChevronRight 
                              className={`h-4 w-4 transition-transform ${
                                expandedTasks[task.id] ? 'rotate-90' : ''
                              }`}
                            />
                          </Button>
                          <Todo
                            task={task}
                            onToggle={handleToggleTask}
                            onDelete={handleDeleteTask}
                          />
                        </div>
                      </div>
                      {expandedTasks[task.id] && (
                        <div className="ml-8 mt-2 space-y-2">
                          {getSubTasks(task.id).map(subTask => (
                            <Todo
                              key={subTask.id}
                              task={subTask}
                              onToggle={handleToggleTask}
                              onDelete={handleDeleteTask}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No completed tasks</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 