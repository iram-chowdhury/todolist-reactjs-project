import { useState } from 'react';
import { format, parseISO, isValid, startOfDay } from 'date-fns';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import { useTasks } from '../contexts/TaskContext';
import { TodoForm } from './TodoForm';
import { Todo } from './Todo';
import { Plus, ChevronRight } from 'lucide-react';

export default function Calendar() {
  const { toast } = useToast();
  const [date, setDate] = useState(new Date());
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState({});
  const { tasks, addTask, updateTask, deleteTask, getSubTasks } = useTasks();

  // Format the selected date as YYYY-MM-DD, using startOfDay to prevent timezone issues
  // Don't add an extra day as it causes the date to shift forward
  const selectedDateStr = format(startOfDay(date), 'yyyy-MM-dd');

  const handleAddTask = (taskData) => {
    // Ensure the task has a date and time
    if (!taskData.date || !taskData.time) {
      toast({
        title: "Missing date or time",
        description: "Please select both a date and time for the task",
        variant: "destructive"
      });
      return;
    }

    // Create the task with the selected date from the calendar
    // Override any date that might have been set in the form
    addTask({
      ...taskData,
      date: selectedDateStr, // Use the selected date from the calendar
      completed: false,
      parentTaskId: null, // Ensure this is a top-level task, not a subtask
      isMainTask: taskData.isMainTask // Preserve the isMainTask value from the form
    });
    setShowTodoForm(false);
    
    toast({
      title: "Task added",
      description: "Your task has been added to the calendar",
    });
  };

  const handleToggleTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { ...task, completed: !task.completed });
    }
  };

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
    
    toast({
      title: "Task deleted",
      description: "Your task has been removed from the calendar",
    });
  };

  const toggleExpanded = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Get tasks for the selected date
  const dateTasks = tasks.filter(task => task.date === selectedDateStr && !task.parentTaskId);

  const formatTaskDate = (dateStr) => {
    try {
      const parsedDate = parseISO(dateStr);
      return isValid(parsedDate) ? format(parsedDate, 'MMMM d, yyyy') : 'Invalid date';
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Calendar</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              Tasks for {format(date, 'MMMM d, yyyy')}
            </h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowTodoForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>

          {showTodoForm && (
            <Card className="mb-4">
              <CardContent className="pt-6">
                <TodoForm 
                  onSubmit={handleAddTask} 
                  onCancel={() => setShowTodoForm(false)}
                  initialDate={date}
                  requireDateTime={true}
                  isSubtask={false} // Explicitly set this is not a subtask
                />
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {dateTasks.length > 0 ? (
              dateTasks.map(task => (
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
              ))
            ) : (
              <p className="text-center text-gray-500">No tasks for this date</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 