import React from 'react';
import { useTasks } from '../contexts/TaskContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

function FolderSelector({ value, onChange }) {
  const { folders } = useTasks();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select folder" />
      </SelectTrigger>
      <SelectContent>
        {folders.map(folder => (
          <SelectItem key={folder.id} value={folder.id}>
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: folder.color }}
              />
              {folder.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default FolderSelector; 