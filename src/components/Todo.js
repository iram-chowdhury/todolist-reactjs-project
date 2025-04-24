import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTasks } from '../contexts/TaskContext';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { TodoForm } from './TodoForm';
import { cn } from '../lib/utils';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';

export function Todo({ task }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingSubTask, setIsAddingSubTask] = useState(false);
  const { updateTask, deleteTask, addTask, getSubTasks } = useTasks();

  const subTasks = getSubTasks(task.id);

  const handleToggle = () => {
    updateTask(task.id, { ...task, completed: !task.completed });
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  const handleAddSubTask = (subTask) => {
    addTask({
      ...subTask,
      parentTaskId: task.id,
      isMainTask: false
    });
    setIsAddingSubTask(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggle}
          id={`task-${task.id}`}
        />
        
        <div className="flex-1">
          <label
            htmlFor={`task-${task.id}`}
            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
              task.completed ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {task.title}
          </label>
          {(task.date || task.time) && (
            <p className="text-xs text-muted-foreground mt-1">
              {task.date && format(new Date(task.date), 'MMM d, yyyy')}
              {task.date && task.time && ' at '}
              {task.time}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {subTasks.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAddingSubTask(!isAddingSubTask)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isAddingSubTask && (
        <div className="pl-6">
          <TodoForm
            onSubmit={handleAddSubTask}
            onCancel={() => setIsAddingSubTask(false)}
            parentTaskId={task.id}
          />
        </div>
      )}

      {isExpanded && subTasks.length > 0 && (
        <div className="pl-6 space-y-2">
          {subTasks.map((subTask) => (
            <Todo key={subTask.id} task={subTask} />
          ))}
        </div>
      )}
    </div>
  );
} 