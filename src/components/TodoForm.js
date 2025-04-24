import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import FolderSelector from './FolderSelector';

export function TodoForm({ onSubmit, onCancel, parentTaskId = null }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [folderId, setFolderId] = useState('default');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      date: date ? format(date, 'yyyy-MM-dd') : null,
      time: time || null,
      completed: false,
      parentTaskId
    });

    setTitle('');
    setDate(null);
    setTime('');
    setShowDatePicker(false);
    setFolderId('default');
  };

  // Generate time options (every 30 minutes)
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-2">
        <Input
          type="text"
          placeholder={parentTaskId ? "Enter subtask title" : "Enter task title"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full"
        />
        
        <div className="flex gap-2">
          <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "flex-1 justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'MMM d, yyyy') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate);
                  setShowDatePicker(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">
          {parentTaskId ? 'Add Subtask' : 'Add Task'}
        </Button>
      </div>

      {!parentTaskId && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isMainTask"
            checked={!parentTaskId}
            onChange={(e) => {
              // This is a placeholder for the checkbox. The checkbox is not provided in the new component
            }}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="isMainTask">This is a main task (can have sub-tasks)</Label>
        </div>
      )}

      <FolderSelector
        value={folderId}
        onChange={setFolderId}
      />
    </form>
  );
} 