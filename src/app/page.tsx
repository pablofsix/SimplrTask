
"use client";

import { useState, useEffect } from 'react';
import type { Task, Modification, TaskStatus, GlobalActivity, AppData, Project, CopyFormat, AppSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { MainContent } from '@/components/main-content';
import { HistoryDialog } from '@/components/history-dialog';
import { GlobalHistoryDialog } from '@/components/global-history-dialog';
import { SettingsDialog } from '@/components/settings-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowUpRightFromSquare, Activity, ClipboardCopy, ChevronsUpDown, PlusCircle, Loader2, ClipboardCheck, Trash2, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getPopoutPosition, type PopoutPosition, getAppData, saveAppData } from '@/lib/storage';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Home() {
  const { toast } = useToast();
  const [appData, setAppData] = useState<AppData | null>(null);
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [editProjectName, setEditProjectName] = useState("");
  
  const [historyTask, setHistoryTask] = useState<Task | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isGlobalHistoryDialogOpen, setIsGlobalHistoryDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isConfirmingClearTasks, setIsConfirmingClearTasks] = useState(false);
  const [isConfirmingDeleteProject, setIsConfirmingDeleteProject] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");


  useEffect(() => {
    setAppData(getAppData());

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'app-data') {
        setAppData(getAppData());
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const activeProject = appData?.projects.find(p => p.id === appData.activeProjectId);

  useEffect(() => {
    if (activeProject) {
      setEditProjectName(activeProject.name);
    }
  }, [activeProject]);

  const updateAppData = (newAppData: AppData) => {
    setAppData(newAppData);
    saveAppData(newAppData);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    if (!appData) return;
    updateAppData({ ...appData, settings: newSettings });
    toast({ title: "Settings saved" });
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

  const handleProjectNameSave = () => {
    if (editProjectName.trim() && activeProject && appData) {
      const newName = editProjectName.trim();
      const newProjects = appData.projects.map(p => 
        p.id === appData.activeProjectId ? { ...p, name: newName } : p
      );
      updateAppData({ ...appData, projects: newProjects });
    }
    setIsEditingProjectName(false);
  };
  
  const handleProjectNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleProjectNameSave();
    }
    if (event.key === 'Escape') {
      setEditProjectName(activeProject?.name || "");
      setIsEditingProjectName(false);
    }
  };

  const handleAddTask = (content: string) => {
    if (content.trim() === '' || !activeProject) return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      content: content,
      createdAt: new Date(),
      modifications: [],
      status: 'Pendiente',
    };
    const updatedTasks = [newTask, ...activeProject.tasks];
    const updatedProjects = updateTasks(updatedTasks);
    addActivity(updatedProjects, newTask.id, 'created', content);
    toast({ title: 'Task Added' });
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

  const handleClearCompletedTasks = () => {
    if (!activeProject || !appData) return;

    const completedTasks = activeProject.tasks.filter(t => t.status === 'Listo');
    if (completedTasks.length === 0) {
      toast({ title: 'Sin tareas completadas', description: 'No hay tareas "Listo" para eliminar.' });
      setIsConfirmingClearTasks(false);
      return;
    }

    const newTasks = activeProject.tasks.filter(t => t.status !== 'Listo');

    const newActivityEntries: GlobalActivity[] = completedTasks.map(task => ({
      id: `act-${Date.now()}-${task.id}`,
      taskId: task.id,
      timestamp: new Date(),
      type: 'reported',
      taskContent: task.content,
    }));

    const newProjects = appData.projects.map(p =>
      p.id === appData.activeProjectId
        ? { ...p, tasks: newTasks, activity: [...newActivityEntries, ...p.activity] }
        : p
    );

    updateAppData({ ...appData, projects: newProjects });
    
    toast({ title: 'Tareas informadas', description: `${completedTasks.length} tarea(s) completada(s) ha(n) sido archivada(s).` });
    setIsConfirmingClearTasks(false);
};

  const handleActivityImport = (importedActivity: GlobalActivity[]) => {
    if (!activeProject || !appData) return;
    
    // Re-hydrate dates just in case
    const hydratedImportedActivity = importedActivity.map(act => ({
      ...act,
      timestamp: new Date(act.timestamp),
    }));

    const existingActivityIds = new Set(activeProject.activity.map(act => act.id));
    const mergedActivity = [...activeProject.activity];

    hydratedImportedActivity.forEach(importedAct => {
      if (!existingActivityIds.has(importedAct.id)) {
        mergedActivity.push(importedAct);
      }
    });

    mergedActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const newProjects = appData.projects.map(p => 
      p.id === appData.activeProjectId ? { ...p, activity: mergedActivity } : p
    );
    updateAppData({ ...appData, projects: newProjects });
  };

  const viewHistory = (task: Task) => {
    setHistoryTask(task);
    setIsHistoryDialogOpen(true);
  };

  const openPopout = () => {
    const width = 600;
    const height = 400;
    const position = getPopoutPosition();
    
    let top = (window.screen.height - height) / 2;
    let left = (window.screen.width - width) / 2;

    switch (position) {
        case 'top-left':
            top = 0;
            left = 0;
            break;
        case 'top-right':
            top = 0;
            left = window.screen.width - width;
            break;
        case 'bottom-left':
            top = window.screen.height - height;
            left = 0;
            break;
        case 'bottom-right':
            top = window.screen.height - height;
            left = window.screen.width - width;
            break;
    }

    // Use a relative path (no leading slash) so this opens under the current
    // base path (works on GitHub Pages where the app is served at
    // /<repo>/). Opening `/popout` would point to the site root and cause a 404.
    window.open('popout', 'task-popout', `width=${width},height=${height},top=${top},left=${left}`);
  }
  
const handleCopyTasks = () => {
    if (!appData || !activeProject || activeProject.tasks.length === 0) {
      toast({
        title: "No hay tareas para copiar",
        description: "Añade algunas tareas antes de copiar.",
      });
      return;
    }

    const statusOrder: Record<TaskStatus, number> = { 'Listo': 1, 'En proceso': 2, 'Pendiente': 3 };
    const sortedTasks = [...activeProject.tasks].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    
    const copyFormat = appData.settings.copyFormat;

    const promise = copyFormat === 'html' 
        ? copyHtmlToClipboard(sortedTasks, activeProject.name, appData.settings)
        : copyTextToClipboard(sortedTasks, activeProject.name);

    promise.then(() => {
        toast({ title: 'Tareas copiadas', description: 'La lista de tareas ha sido copiada al portapapeles.' });
      })
      .catch(err => {
        console.error('Failed to copy tasks: ', err);
        toast({ title: 'Error', description: 'No se pudieron copiar las tareas.', variant: 'destructive' });
      });
  };

  const copyTextToClipboard = (tasks: Task[], projectName: string) => {
    const tasksList = tasks
      .map(task => `${task.status === 'Listo' ? '[x]' : '[ ]'} ${task.content} -> ${task.status.toUpperCase()}`)
      .join('\n');
    const textToCopy = `${projectName}\n\n${tasksList}`;
    return navigator.clipboard.writeText(textToCopy);
  }

  const copyHtmlToClipboard = (tasks: Task[], projectName: string, settings: AppSettings) => {
    const { statusColors } = settings;

    const tasksHtml = tasks.map(task => {
        const checkbox = task.status === 'Listo' ? '<b>[x]</b>' : '[ ]';
        const content = task.content;
        const status = `<b style="color: ${statusColors[task.status]};">${task.status.toUpperCase()}</b>`;
        return `<p>${checkbox} ${content} -&gt; ${status}</p>`;
    }).join('');

    const htmlString = `
      <div>
        <p><b>${projectName}</b></p>
        ${tasksHtml}
      </div>
    `;

    const blob = new Blob([htmlString], { type: 'text/html' });
    const clipboardItem = new ClipboardItem({ 'text/html': blob });

    return navigator.clipboard.write([clipboardItem]);
}

  const handleAddNewProject = () => {
    if (!appData) return;
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: `Project ${appData.projects.length + 1}`,
      tasks: [],
      activity: [],
    };
    const newAppData = {
      ...appData,
      projects: [...appData.projects, newProject],
      activeProjectId: newProject.id,
    };
    updateAppData(newAppData);
    setIsEditingProjectName(true);
    setEditProjectName(newProject.name);
    toast({ title: `Project "${newProject.name}" created` });
  };

  const handleSwitchProject = (projectId: string) => {
    if (appData && projectId !== appData.activeProjectId) {
      updateAppData({ ...appData, activeProjectId: projectId });
      toast({ title: `Switched to project "${appData.projects.find(p => p.id === projectId)?.name}"` });
    }
  };

  const handleDeleteProject = () => {
    if (!appData || !activeProject) return;

    const remainingProjects = appData.projects.filter(p => p.id !== appData.activeProjectId);
    const newActiveProjectId = remainingProjects.length > 0 ? remainingProjects[0].id : null;

    const newAppData: AppData = {
      projects: remainingProjects,
      activeProjectId: newActiveProjectId,
      settings: appData.settings,
    };
    
    updateAppData(newAppData);
    toast({ title: `Project "${activeProject.name}" deleted` });
    setIsConfirmingDeleteProject(false);
    setDeleteConfirmationText("");
  };

  if (!appData || !activeProject) {
    return (
      <div className="bg-neutral-950 min-h-screen flex flex-col items-center justify-center text-white">
        {appData && appData.projects.length === 0 ? (
          <>
            <h1 className="text-2xl font-bold">No project found</h1>
            <p className="mt-4">Please create a new project to get started.</p>
            <Button onClick={handleAddNewProject} className="mt-6">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Project
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading projects...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-neutral-950 min-h-screen flex flex-col items-center py-8">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl flex flex-col h-[calc(100vh-4rem)]">
        <header className="w-full flex items-center justify-between p-4 md:p-6 lg:p-8 border-b">
            {isEditingProjectName ? (
              <div className="flex items-center gap-2 w-full">
                <Input
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                  onKeyDown={handleProjectNameKeyDown}
                  className="text-3xl font-bold tracking-tight h-auto p-0 border-none focus-visible:ring-0"
                  autoFocus
                  onFocus={(e) => e.currentTarget.select()}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleProjectNameSave}>
                  <Check className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                  setEditProjectName(activeProject.name);
                  setIsEditingProjectName(false);
                }}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
               <div className="flex items-center justify-between w-full">
                 <div className="flex items-center gap-2">
                    <h2 
                      className="text-3xl font-bold tracking-tight text-foreground cursor-pointer"
                      onClick={() => {
                        setEditProjectName(activeProject.name);
                        setIsEditingProjectName(true);
                      }}
                    >
                      {activeProject.name}
                    </h2>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronsUpDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {appData.projects.map(project => (
                          <DropdownMenuItem key={project.id} onSelect={() => handleSwitchProject(project.id)}>
                            {project.name}
                            {project.id === appData.activeProjectId && <Check className="ml-auto h-4 w-4" />}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={handleAddNewProject}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Añadir nuevo proyecto
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onSelect={() => setIsConfirmingDeleteProject(true)} 
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          disabled={appData.projects.length <= 1}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar proyecto
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
                <TooltipProvider>
                  <div className="flex items-center gap-1">
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setIsSettingsDialogOpen(true)}>
                                  <Settings className="h-5 w-5" />
                                  <span className="sr-only">Configuración</span>
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                              <p>Configuración</p>
                          </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setIsGlobalHistoryDialogOpen(true)}>
                                  <Activity className="h-5 w-5" />
                                  <span className="sr-only">Ver actividad general</span>
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                              <p>Ver actividad general</p>
                          </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleCopyTasks}>
                                <ClipboardCopy className="h-5 w-5" />
                                <span className="sr-only">Copiar tareas</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Copiar lista de tareas</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setIsConfirmingClearTasks(true)}>
                                  <ClipboardCheck className="h-5 w-5" />
                                  <span className="sr-only">Informar tareas</span>
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                              <p>Informar tareas (eliminar las completadas)</p>
                          </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={openPopout}>
                                  <ArrowUpRightFromSquare className="h-5 w-5" />
                                  <span className="sr-only">Open in new window</span>
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                              <p>Abrir en nueva ventana</p>
                          </TooltipContent>
                      </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            )}
        </header>
        <MainContent
          tasks={activeProject.tasks}
          projectName={activeProject.name}
          onTaskAdd={handleAddTask}
          onTaskUpdate={handleUpdateTask}
          onTaskDelete={handleDeleteTask}
          onTaskHistoryView={viewHistory}
          onTaskStatusUpdate={handleUpdateTaskStatus}
        />
      </div>
      
      <HistoryDialog
        isOpen={isHistoryDialogOpen}
        setIsOpen={setIsHistoryDialogOpen}
        task={historyTask}
      />
      <GlobalHistoryDialog
        isOpen={isGlobalHistoryDialogOpen}
        setIsOpen={setIsGlobalHistoryDialogOpen}
        activity={activeProject.activity}
        onActivityImport={handleActivityImport}
      />
      <SettingsDialog
        isOpen={isSettingsDialogOpen}
        setIsOpen={setIsSettingsDialogOpen}
        settings={appData.settings}
        onSettingsSave={handleUpdateSettings}
      />
      <AlertDialog open={isConfirmingClearTasks} onOpenChange={setIsConfirmingClearTasks}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente todas las tareas marcadas como "Listo". Desapareceran las tareas terminadas de la lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearCompletedTasks}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={isConfirmingDeleteProject} onOpenChange={setIsConfirmingDeleteProject}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro que quiere eliminar el proyecto "{activeProject.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se borrarán permanentemente el proyecto y todas sus tareas y actividades asociadas.
              <br/><br/>
              Por favor, escriba <strong>delete</strong> para confirmar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input 
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
            placeholder='delete'
            className="my-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmationText("")}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProject}
              disabled={deleteConfirmationText.toLowerCase() !== 'delete'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar proyecto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    

    
