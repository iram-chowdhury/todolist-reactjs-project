import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';
import { useTasks } from '../contexts/TaskContext';
import FolderSelector from './FolderSelector';

export default function Calendar() {
  const { toast } = useToast();
  const [date, setDate] = useState(new Date());
  const [newTask, setNewTask] = useState('');
  const [folderId, setFolderId] = useState('default');
  const { tasks, addTask, updateTask, deleteTask } = useTasks();

  // Format the selected date as YYYY-MM-DD
  const selectedDateStr = format(date, 'yyyy-MM-dd');

  const addTaskToDate = () => {
    if (newTask.trim() === '') return;

    // Add the task with the exact date string
    addTask({
      title: newTask,
      date: selectedDateStr,
      folderId
    });

    setNewTask('');
    
    toast({
      title: "Task added",
      description: "Your task has been added to the calendar",
    });
  };

  const toggleTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { ...task, completed: !task.completed });
    }
  };

  const removeTask = (taskId) => {
    deleteTask(taskId);
    
    toast({
      title: "Task deleted",
      description: "Your task has been removed from the calendar",
    });
  };

  // Get tasks for the selected date
  const dateTasks = tasks.filter(task => task.date === selectedDateStr);

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
          <h2 className="text-lg font-semibold">
            Tasks for {format(date, 'MMMM d, yyyy')}
          </h2>

          <div className="flex flex-col gap-2">
            <Input
              placeholder="Add a new task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTaskToDate()}
            />
            <FolderSelector
              value={folderId}
              onChange={setFolderId}
            />
            <Button onClick={addTaskToDate}>Add</Button>
          </div>

          <div className="space-y-2">
            {dateTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="h-4 w-4"
                    />
                    <div className="flex flex-col">
                      <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                        {task.title}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(parseISO(task.date), 'MMMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTask(task.id)}
                  >
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 