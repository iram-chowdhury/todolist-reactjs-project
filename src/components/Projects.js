import React, { useState } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';
import { Trash2, Plus, Folder, StickyNote } from 'lucide-react';
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

function Projects() {
  const { folders, tasks, addFolder, updateFolder, deleteFolder, updateTask } = useTasks();
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0].value);
  const [editingFolder, setEditingFolder] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [expandedNotes, setExpandedNotes] = useState({});
  const { toast } = useToast();

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    
    addFolder({
      name: newFolderName.trim(),
      color: newFolderColor
    });
    
    setNewFolderName('');
    setNewFolderColor(FOLDER_COLORS[0].value);
    
    toast({
      title: "Folder created",
      description: "Your new folder has been created",
    });
  };

  const handleStartEdit = (folder) => {
    setEditingFolder(folder.id);
    setEditName(folder.name);
    setEditColor(folder.color);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    
    updateFolder(editingFolder, { 
      name: editName.trim(),
      color: editColor
    });
    setEditingFolder(null);
    
    toast({
      title: "Folder updated",
      description: "Your folder has been updated",
    });
  };

  const handleDeleteFolder = (folderId) => {
    deleteFolder(folderId);
    
    toast({
      title: "Folder deleted",
      description: "Your folder has been deleted",
    });
  };

  const toggleNotes = (taskId) => {
    setExpandedNotes(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const getTaskCount = (folderId) => {
    return tasks.filter(task => task.folderId === folderId).length;
  };

  const getTasksForFolder = (folderId) => {
    return tasks.filter(task => task.folderId === folderId);
  };

  const getColorName = (colorValue) => {
    return FOLDER_COLORS.find(c => c.value === colorValue)?.name || 'Custom';
  };

  return (
    <div className="p-6 space-y-6 bg-background animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Folders</h1>
      </div>
      
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="New folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          className="max-w-xs"
        />
        <Select value={newFolderColor} onValueChange={setNewFolderColor}>
          <SelectTrigger className="w-[180px]">
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
        <Button onClick={handleAddFolder}>
          <Plus className="h-4 w-4 mr-2" />
          Add Folder
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map(folder => (
          <Card key={folder.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: folder.color }}
                  />
                  {editingFolder === folder.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8"
                      />
                      <Select value={editColor} onValueChange={setEditColor}>
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: editColor }}
                              />
                              {getColorName(editColor)}
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
                      <Button 
                        size="sm" 
                        onClick={handleSaveEdit}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{folder.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        ({getTaskCount(folder.id)} tasks)
                      </span>
                    </div>
                  )}
                </div>
                {folder.id !== 'default' && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEdit(folder)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFolder(folder.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="mt-4 space-y-2">
                {getTasksForFolder(folder.id).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => updateTask(task.id, { ...task, completed: !task.completed })}
                        className="h-4 w-4"
                      />
                      <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {task.notes && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleNotes(task.id)}
                        >
                          <StickyNote className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {getTasksForFolder(folder.id).map(task => (
                  expandedNotes[task.id] && task.notes && (
                    <div key={`notes-${task.id}`} className="ml-6 p-2 bg-muted rounded-md">
                      <h4 className="text-sm font-medium mb-1">Notes:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.notes}</p>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Projects; 