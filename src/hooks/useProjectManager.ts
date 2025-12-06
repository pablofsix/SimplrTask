import { useCallback } from 'react';
import { AppData, Project } from '@/lib/types';
import { saveAppData } from '@/lib/storage';

export function useProjectManager(
  appData: AppData | null,
  setAppData: (data: AppData) => void
) {
  const updateAppData = useCallback((newData: AppData) => {
    setAppData(newData);
    saveAppData(newData);
  }, [setAppData]);

  const createProject = useCallback(
    (name: string) => {
      if (!appData || !name.trim()) return;
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: name.trim(),
        tasks: [],
        activity: [],
      };
      const newProjects = [...appData.projects, newProject];
      updateAppData({ ...appData, projects: newProjects });
    },
    [appData, updateAppData]
  );

  const deleteProject = useCallback(
    (projectId: string) => {
      if (!appData) return;
      const newProjects = appData.projects.filter(p => p.id !== projectId);
      const newActiveProjectId =
        appData.activeProjectId === projectId
          ? newProjects[0]?.id || null
          : appData.activeProjectId;
      updateAppData({
        ...appData,
        projects: newProjects,
        activeProjectId: newActiveProjectId,
      });
    },
    [appData, updateAppData]
  );

  const setActiveProject = useCallback(
    (projectId: string | null) => {
      if (!appData) return;
      updateAppData({ ...appData, activeProjectId: projectId });
    },
    [appData, updateAppData]
  );

  const renameProject = useCallback(
    (projectId: string, newName: string) => {
      if (!appData || !newName.trim()) return;
      const newProjects = appData.projects.map(p =>
        p.id === projectId ? { ...p, name: newName.trim() } : p
      );
      updateAppData({ ...appData, projects: newProjects });
    },
    [appData, updateAppData]
  );

  return {
    createProject,
    deleteProject,
    setActiveProject,
    renameProject,
  };
}
