

"use client";

import { useState, useEffect } from 'react';
import { PopoutMainContent } from '@/components/popout-main-content';
import type { Task, Modification, TaskStatus, PopoutPosition, AppData, Project, GlobalActivity } from '@/lib/types';
import { getAppData, saveAppData, savePopoutPosition, getPopoutPosition } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { HistoryDialog } from '@/components/history-dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings, MoveUpLeft, MoveUpRight, MoveDownLeft, MoveDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';


export default function PopoutPage() {
  const { toast } = useToast();
  const [appData, setAppData] = useState<AppData | null>(null);
  const [historyTask, setHistoryTask] = useState<Task | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<PopoutPosition>('center');

  useEffect(() => {
    setAppData(getAppData());
    setCurrentPosition(getPopoutPosition());

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'app-data') {
        setAppData(getAppData());
      }
      if (event.key === 'popout-position') {
        const newPosition = getPopoutPosition();
        setCurrentPosition(newPosition);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const activeProject = appData?.projects.find(p => p.id === appData.activeProjectId);

  const updateAppData = (newAppData: AppData) => {
    setAppData(newAppData);
    saveAppData(newAppData);
  };
  
  const addActivity = (updatedProjects: Project[], taskId: string, type: GlobalActivity['type'], taskContent: string, from?: string, to?: string) => {
    if (!activeProject || !appData) return;
    const newActivityEntry: GlobalActivity = {
      id: `act-${Date.now()}`,
      taskId,
      timestamp: new Date(),
      type,
      taskContent,
      from,
      to,
    };
    
    const newProjects = updatedProjects.map(p => 
      p.id === appData.activeProjectId 
        ? { ...p, activity: [newActivityEntry, ...p.activity] } 
        : p
    );
    updateAppData({ ...appData, projects: newProjects });
  };

  const updateTasks = (newTasks: Task[]) => {
    if (!activeProject || !appData) return;
    const newProjects = appData.projects.map(p => 
      p.id === appData.activeProjectId ? { ...p, tasks: newTasks } : p
    );
    updateAppData({ ...appData, projects: newProjects });
    return newProjects;
  }

  const handleAddTask = (content: string) => {
    if (content.trim() === '' || !activeProject) return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      content: content,
      createdAt: new Date(),
      modifications: [],
      status: 'Pendiente',
    };
    const updatedProjectsWithTask = updateTasks([newTask, ...activeProject.tasks]);
    addActivity(updatedProjectsWithTask, newTask.id, 'created', content);
  };

  const handleUpdateTask = (taskId: string, newContent: string) => {
    if (!activeProject) return;
    let originalContent = '';
    const newTasks = activeProject.tasks.map(t => {
      if (t.id === taskId) {
        if (t.content === newContent) return t;
        originalContent = t.content;
        const newModification: Modification = {
          id: `mod-${Date.now()}`,
          taskId: taskId,
          timestamp: new Date(),
          type: 'content',
          from: t.content,
          to: newContent,
        };
        return { ...t, content: newContent, modifications: [newModification, ...t.modifications] };
      }
      return t;
    });
    const updatedProjects = updateTasks(newTasks);
    if(originalContent && appData) {
      addActivity(updatedProjects, taskId, 'content', newContent, originalContent, newContent);
    }
    toast({ title: 'Task Updated' });
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    if (!activeProject) return;
    let taskContent = '';
    let originalStatus: TaskStatus | undefined = undefined;

    const newTasks = activeProject.tasks.map(t => {
      if (t.id === taskId && t.status !== newStatus) {
        taskContent = t.content;
        originalStatus = t.status;
        const newModification: Modification = {
          id: `mod-${Date.now()}`,
          taskId: taskId,
          timestamp: new Date(),
          type: 'status',
          from: t.status,
          to: newStatus,
        };
        return { ...t, status: newStatus, modifications: [newModification, ...t.modifications] };
      }
      return t;
    });
    const updatedProjects = updateTasks(newTasks);
    if (originalStatus && appData) {
      addActivity(updatedProjects, taskId, 'status', taskContent, originalStatus, newStatus);
    }
    toast({ title: 'Task Status Updated' });
  };
  
  const handleDeleteTask = (taskId: string) => {
    if (!activeProject) return;
    const taskToDelete = activeProject.tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;
    
    const newTasks = activeProject.tasks.filter(t => t.id !== taskId);
    const updatedProjects = updateTasks(newTasks);
    if (appData) {
        addActivity(updatedProjects, taskId, 'deleted', taskToDelete.content);
    }
    toast({ title: 'Task Deleted' });
  };

  const viewHistory = (task: Task) => {
    setHistoryTask(task);
    setIsHistoryDialogOpen(true);
  };
  
  const handleSetPosition = (position: PopoutPosition) => {
    savePopoutPosition(position);
    setCurrentPosition(position);
    toast({ title: 'Popout Position Saved' });
  };

  const positionOptions: { value: PopoutPosition; label: string; icon: React.ReactNode }[] = [
    { value: 'top-left', label: 'Arriba a la izquierda', icon: <MoveUpLeft className="h-4 w-4" /> },
    { value: 'top-right', label: 'Arriba a la derecha', icon: <MoveUpRight className="h-4 w-4" /> },
    { value: 'bottom-left', label: 'Abajo a la izquierda', icon: <MoveDownLeft className="h-4 w-4" /> },
    { value: 'bottom-right', label: 'Abajo a la derecha', icon: <MoveDownRight className="h-4 w-4" /> },
  ];

  if (!activeProject) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-lg font-semibold">Esperando la selección de proyecto en la ventana principal...</h1>
        <p className="text-sm text-muted-foreground mt-2">Los datos se sincronizarán automáticamente.</p>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col h-screen">
        <header className="p-4 flex items-center justify-between border-b">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
                {activeProject.name}
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                      <Settings className="h-5 w-5" />
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-semibold">Posición de la ventana</div>
                  {positionOptions.map((option) => (
                      <DropdownMenuItem 
                          key={option.value} 
                          onSelect={() => handleSetPosition(option.value)}
                          className={cn(currentPosition === option.value && "bg-accent")}
                      >
                          <div className="flex items-center gap-2">
                              {option.icon}
                              <span>{option.label}</span>
                          </div>
                      </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
          </DropdownMenu>
        </header>
      <PopoutMainContent
          tasks={activeProject.tasks}
          projectName={activeProject.name}
          onTaskAdd={handleAddTask}
          onTaskUpdate={handleUpdateTask}
          onTaskDelete={handleDeleteTask}
          onTaskHistoryView={viewHistory}
          onTaskStatusUpdate={handleUpdateTaskStatus}
        />
      <HistoryDialog
        isOpen={isHistoryDialogOpen}
        setIsOpen={setIsHistoryDialogOpen}
        task={historyTask}
      />
      <Toaster />
    </div>
  );
}


    

