import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Plus, FolderPlus, ChevronRight } from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import { TodoForm } from './TodoForm';
import { Todo } from './Todo';
import { format, isToday, isFuture, isPast, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// Predefined colors with their names
const FOLDER_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Gray', value: '#6b7280' }
];

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
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0].value);
  const [expandedTasks, setExpandedTasks] = useState({});

  // Filter tasks based on the active tab
  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'completed') {
      return task.completed;
    }
    
    if (!task.date) return activeTab === 'all';
    const taskDate = parseISO(task.date);
    
    switch (activeTab) {
      case 'all':
        return !task.completed;
      case 'today':
        return isToday(taskDate) && !task.completed;
      case 'upcoming':
        return isFuture(taskDate) && !task.completed;
      default:
        return true;
    }
  });

  // Get main tasks (tasks that can have sub-tasks)
  const mainTasks = filteredTasks.filter(task => task.isMainTask && !task.parentTaskId);

  // Handle adding a new task
  const handleAddTask = (taskData) => {
    addTask({
      ...taskData,
      isMainTask: taskData.isMainTask,
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

  const getColorName = (colorValue) => {
    return FOLDER_COLORS.find(c => c.value === colorValue)?.name || 'Custom';
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
                <Select value={newFolderColor} onValueChange={setNewFolderColor}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: newFolderColor }}
                        />
                        {getColorName(newFolderColor)}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {FOLDER_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: color.value }}
                          />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              {filteredTasks.length > 0 ? (
                <div className="space-y-4">
                  {filteredTasks.map(task => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {task.isMainTask && (
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
                          )}
                          <Todo
                            task={task}
                            onToggle={handleToggleTask}
                            onDelete={handleDeleteTask}
                          />
                        </div>
                      </div>
                      {task.isMainTask && expandedTasks[task.id] && (
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
              {filteredTasks.length > 0 ? (
                <div className="space-y-4">
                  {filteredTasks.map(task => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {task.isMainTask && (
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
                          )}
                          <Todo
                            task={task}
                            onToggle={handleToggleTask}
                            onDelete={handleDeleteTask}
                          />
                        </div>
                      </div>
                      {task.isMainTask && expandedTasks[task.id] && (
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
              {filteredTasks.length > 0 ? (
                <div className="space-y-4">
                  {filteredTasks.map(task => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {task.isMainTask && (
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
                          )}
                          <Todo
                            task={task}
                            onToggle={handleToggleTask}
                            onDelete={handleDeleteTask}
                          />
                        </div>
                      </div>
                      {task.isMainTask && expandedTasks[task.id] && (
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
              {filteredTasks.length > 0 ? (
                <div className="space-y-4">
                  {filteredTasks.map(task => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {task.isMainTask && (
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
                          )}
                          <Todo
                            task={task}
                            onToggle={handleToggleTask}
                            onDelete={handleDeleteTask}
                          />
                        </div>
                      </div>
                      {task.isMainTask && expandedTasks[task.id] && (
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