import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import FolderSelector from './FolderSelector';

export function TodoForm({ onSubmit, onCancel, initialDate, requireDateTime = false, isSubtask = false, parentTaskId = null, initialFolderId = 'default' }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate || new Date());
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [folderId, setFolderId] = useState(initialFolderId);
  const [isMainTask, setIsMainTask] = useState(!isSubtask);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If date and time are required, validate them
    if (requireDateTime && (!date || !time)) {
      return;
    }

    // If this is a subtask, we don't need to send the date
    // The parent task's date will be used
    const taskData = {
      title,
      time,
      notes,
      folderId: isSubtask ? initialFolderId : folderId, // Use parent's folder for subtasks
      isMainTask: isSubtask ? false : isMainTask, // Force subtasks to be non-main tasks
      parentTaskId
    };

    // Only include date if this is not a subtask
    if (!isSubtask) {
      taskData.date = date ? format(date, 'yyyy-MM-dd') : null;
    }

    onSubmit(taskData);

    // Reset form
    setTitle('');
    setDate(initialDate || new Date());
    setTime('');
    setNotes('');
    setFolderId(initialFolderId);
    setIsMainTask(!isSubtask);
  };

  // Generate time options in 12-hour format
  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const timeStr = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    const valueStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    return { display: timeStr, value: valueStr };
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">{isSubtask ? 'Subtask' : 'Title'}</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={isSubtask ? "Enter subtask title" : "Enter task title"}
          required
        />
      </div>

      {!isSubtask && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {timeOptions.map(({ display, value }) => (
                  <SelectItem key={value} value={value}>
                    {display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {isSubtask && (
        <div className="space-y-2">
          <Label>Time</Label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {timeOptions.map(({ display, value }) => (
                <SelectItem key={value} value={value}>
                  {display}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes (optional)"
        />
      </div>

      {/* Only show folder selector for main tasks */}
      {!isSubtask && (
        <div className="space-y-2">
          <Label>Folder</Label>
          <FolderSelector
            value={folderId}
            onChange={setFolderId}
          />
        </div>
      )}

      {!isSubtask && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isMainTask"
            checked={isMainTask}
            onCheckedChange={setIsMainTask}
          />
          <Label htmlFor="isMainTask">Main Task</Label>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Task</Button>
      </div>
    </form>
  );
} 