import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTasks } from '../contexts/TaskContext';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { TodoForm } from './TodoForm';
import { cn } from '../lib/utils';
import { ChevronDown, ChevronRight, Plus, Trash2, StickyNote, FolderOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import FolderSelector from './FolderSelector';

export function Todo({ task }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingSubTask, setIsAddingSubTask] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showFolderSelect, setShowFolderSelect] = useState(false);
  const { updateTask, deleteTask, addTask, getSubTasks, folders } = useTasks();

  const subTasks = getSubTasks(task.id);
  const taskFolder = folders.find(f => f.id === task.folderId) || folders.find(f => f.id === 'default');

  const handleToggle = () => {
    const newCompleted = !task.completed;
    updateTask(task.id, { ...task, completed: newCompleted });
    
    // If this is a main task and we're completing it, complete all subtasks
    if (newCompleted && task.isMainTask) {
      subTasks.forEach(subTask => {
        updateTask(subTask.id, { ...subTask, completed: true });
      });
    }
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  const handleAddSubTask = (subTask) => {
    if (!task.isMainTask) return;
    
    addTask({
      ...subTask,
      parentTaskId: task.id,
      isMainTask: false,
      folderId: task.folderId, // Inherit folder from parent task
      date: task.date // Inherit date from parent task
    });
    setIsAddingSubTask(false);
  };

  const handleFolderChange = (newFolderId) => {
    updateTask(task.id, { ...task, folderId: newFolderId });
    setShowFolderSelect(false);
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
          <div className="flex items-center gap-2 mt-1">
            {(task.date || task.time) && (
              <p className="text-xs text-muted-foreground">
                {task.date && format(new Date(task.date), 'MMM d, yyyy')}
                {task.date && task.time && ' at '}
                {task.time}
              </p>
            )}
            {taskFolder && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <FolderOpen className="h-3 w-3" style={{ color: taskFolder.color }} />
                <span>{taskFolder.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {task.notes && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotes(!showNotes)}
            >
              <StickyNote className="h-4 w-4" />
            </Button>
          )}
          
          {task.isMainTask && subTasks.length > 0 && (
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
          
          {task.isMainTask && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAddingSubTask(!isAddingSubTask)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}

          {/* Only show folder selector for main tasks */}
          {!task.parentTaskId && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFolderSelect(!showFolderSelect)}
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showFolderSelect && !task.parentTaskId && (
        <div className="pl-6 pr-2 py-2">
          <FolderSelector
            value={task.folderId}
            onChange={handleFolderChange}
          />
        </div>
      )}

      {showNotes && task.notes && (
        <div className="pl-6 pr-2 py-2 bg-muted rounded-md">
          <h4 className="text-sm font-medium mb-1">Notes:</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.notes}</p>
        </div>
      )}

      {isAddingSubTask && task.isMainTask && (
        <div className="pl-6">
          <TodoForm
            onSubmit={handleAddSubTask}
            onCancel={() => setIsAddingSubTask(false)}
            isSubtask={true}
            parentTaskId={task.id}
            initialDate={task.date ? new Date(task.date) : new Date()}
            initialFolderId={task.folderId} // Pass the parent's folder ID
          />
        </div>
      )}

      {isExpanded && task.isMainTask && subTasks.length > 0 && (
        <div className="pl-6 space-y-2">
          {subTasks.map((subTask) => (
            <Todo key={subTask.id} task={subTask} />
          ))}
        </div>
      )}
    </div>
  );
} 