import { useCallback } from 'react';
import { AppData, Project, Task, TaskStatus, Modification, GlobalActivity } from '@/lib/types';
import { saveAppData } from '@/lib/storage';

export function useTaskManager(
  appData: AppData | null,
  activeProject: Project | null,
  setAppData: (data: AppData) => void
) {
  const updateAppData = useCallback((newData: AppData) => {
    setAppData(newData);
    saveAppData(newData);
  }, [setAppData]);

  const updateTasks = useCallback(
    (newTasks: Task[]): Project[] | undefined => {
      if (!activeProject || !appData) return undefined;
      const newProjects = appData.projects.map(p =>
        p.id === appData.activeProjectId ? { ...p, tasks: newTasks } : p
      );
      updateAppData({ ...appData, projects: newProjects });
      return newProjects;
    },
    [activeProject, appData, updateAppData]
  );

  const addActivity = useCallback(
    (
      projects: Project[],
      taskId: string,
      activityType: 'created' | 'content' | 'status' | 'deleted' | 'reported',
      taskContent: string,
      from?: string,
      to?: string
    ) => {
      if (!appData || !activeProject) return;
      const newActivity: GlobalActivity = {
        id: `act-${Date.now()}`,
        taskId,
        type: activityType,
        timestamp: new Date(),
        taskContent,
        from,
        to,
      };
      const newProjects = projects.map(p =>
        p.id === activeProject.id
          ? { ...p, activity: [newActivity, ...p.activity] }
          : p
      );
      updateAppData({ ...appData, projects: newProjects });
    },
    [activeProject, appData, updateAppData]
  );

  const createTask = useCallback(
    (content: string): string | undefined => {
      if (!activeProject || !appData) return undefined;
      const newTask: Task = {
        id: `task-${Date.now()}`,
        content,
        createdAt: new Date(),
        modifications: [],
        status: 'Pendiente',
      };
      const updatedTasks = [newTask, ...activeProject.tasks];
      const updatedProjects = updateTasks(updatedTasks);
      if (updatedProjects) addActivity(updatedProjects, newTask.id, 'created', content);
      return newTask.id;
    },
    [activeProject, appData, updateTasks, addActivity]
  );

  const updateTask = useCallback(
    (taskId: string, newContent: string): boolean => {
      if (!activeProject) return false;
      let originalContent = '';
      let changed = false;
      const newTasks = activeProject.tasks.map(t => {
        if (t.id === taskId) {
          if (t.content === newContent) return t;
          changed = true;
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
      if (!changed) return false;
      const updatedProjects = updateTasks(newTasks);
      if (originalContent && appData && updatedProjects) {
        addActivity(updatedProjects, taskId, 'content', newContent, originalContent, newContent);
      }
      return true;
    },
    [activeProject, appData, updateTasks, addActivity]
  );

  const updateTaskStatus = useCallback(
    (taskId: string, newStatus: TaskStatus): boolean => {
      if (!activeProject) return false;
      let taskContent = '';
      let originalStatus: TaskStatus | undefined = undefined;
      let changed = false;

      const newTasks = activeProject.tasks.map(t => {
        if (t.id === taskId && t.status !== newStatus) {
          changed = true;
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
      if (!changed) return false;
      const updatedProjects = updateTasks(newTasks);

      if (originalStatus && appData && updatedProjects) {
        addActivity(updatedProjects, taskId, 'status', taskContent, originalStatus, newStatus);
      }
      return true;
    },
    [activeProject, appData, updateTasks, addActivity]
  );

  const deleteTask = useCallback(
    (taskId: string): boolean => {
      if (!activeProject) return false;
      const taskToDelete = activeProject.tasks.find(t => t.id === taskId);
      if (!taskToDelete) return false;

      const newTasks = activeProject.tasks.filter(t => t.id !== taskId);
      const updatedProjects = updateTasks(newTasks);
      if (appData && updatedProjects) {
        addActivity(updatedProjects, taskId, 'deleted', taskToDelete.content);
      }
      return true;
    },
    [activeProject, appData, updateTasks, addActivity]
  );

  return {
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    addActivity,
  };
}
