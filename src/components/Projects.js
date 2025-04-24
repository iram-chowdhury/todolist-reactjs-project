import React, { useState } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';
import { Trash2, Plus, Folder } from 'lucide-react';

function Projects() {
  const { folders, tasks, addFolder, updateFolder, deleteFolder } = useTasks();
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState(null);
  const [editName, setEditName] = useState('');
  const { toast } = useToast();

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    
    addFolder({
      name: newFolderName.trim(),
      color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color
    });
    
    setNewFolderName('');
    
    toast({
      title: "Folder created",
      description: "Your new folder has been created",
    });
  };

  const handleStartEdit = (folder) => {
    setEditingFolder(folder.id);
    setEditName(folder.name);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    
    updateFolder(editingFolder, { name: editName.trim() });
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

  const getTaskCount = (folderId) => {
    return tasks.filter(task => task.folderId === folderId).length;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Projects</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Folder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddFolder()}
            />
            <Button onClick={handleAddFolder}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
      
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Projects; 