
import type { Task, PopoutPosition, GlobalActivity, AppData, Project, AppSettings } from '@/lib/types';

const APP_DATA_KEY = 'app-data';
const POPOUT_POSITION_KEY = 'popout-position';

function getInitialAppSettings(): AppSettings {
  return {
    copyFormat: 'text',
    statusColors: {
      'Pendiente': '#ef4444', // red-500
      'En proceso': '#3b82f6', // blue-500
      'Listo': '#22c55e',   // green-500
    }
  }
}

function getInitialAppData(): AppData {
  const initialProject: Project = {
    id: `project-${new Date().getTime()}`,
    name: 'My Project',
    tasks: [],
    activity: [],
  };
  return {
    projects: [initialProject],
    activeProjectId: initialProject.id,
    settings: getInitialAppSettings(),
  };
}

export function getAppData(): AppData {
  if (typeof window === 'undefined') {
      // This is a placeholder for server-side rendering, real data is loaded client-side
      return { projects: [], activeProjectId: null, settings: getInitialAppSettings() };
  }
  try {
    const storedData = localStorage.getItem(APP_DATA_KEY);
    if (!storedData) {
      const initialData = getInitialAppData();
      saveAppData(initialData);
      return initialData;
    }

    let parsedData = JSON.parse(storedData) as AppData;
    
    // Backwards compatibility for settings
    if (!parsedData.settings) {
      parsedData.settings = getInitialAppSettings();
    }
    if (!parsedData.settings.statusColors) {
      parsedData.settings.statusColors = getInitialAppSettings().statusColors;
    }

    // Re-hydrate dates
    parsedData.projects.forEach(project => {
      project.tasks.forEach(task => {
        task.createdAt = new Date(task.createdAt);
        task.modifications.forEach(mod => {
          mod.timestamp = new Date(mod.timestamp);
        });
      });
      project.activity.forEach(act => {
        act.timestamp = new Date(act.timestamp);
      });
    });

    if (!parsedData.activeProjectId && parsedData.projects.length > 0) {
      parsedData.activeProjectId = parsedData.projects[0].id;
    } else if (parsedData.projects.length === 0) {
        const initialData = getInitialAppData();
        saveAppData(initialData);
        return initialData;
    }
    
    return parsedData;

  } catch (error) {
    console.error("Failed to parse AppData from localStorage", error);
    const initialData = getInitialAppData();
    saveAppData(initialData);
    return initialData;
  }
}

export function saveAppData(data: AppData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
    window.dispatchEvent(new StorageEvent('storage', { key: APP_DATA_KEY }));
  } catch (error) {
    console.error("Failed to save AppData to localStorage", error);
  }
}


// These functions are now wrappers around the new AppData structure
// They are kept for now to minimize refactoring in components, but could be phased out.

export function getTasks(): Task[] {
  const appData = getAppData();
  const activeProject = appData.projects.find(p => p.id === appData.activeProjectId);
  return activeProject ? activeProject.tasks : [];
}

export function saveTasks(tasks: Task[]): void {
  const appData = getAppData();
  const activeProjectIndex = appData.projects.findIndex(p => p.id === appData.activeProjectId);
  if (activeProjectIndex !== -1) {
    appData.projects[activeProjectIndex].tasks = tasks;
    saveAppData(appData);
  }
}

export function getProjectName(): string {
  const appData = getAppData();
  const activeProject = appData.projects.find(p => p.id === appData.activeProjectId);
  return activeProject ? activeProject.name : "No Project";
}

export function saveProjectName(name: string): void {
   const appData = getAppData();
  const activeProjectIndex = appData.projects.findIndex(p => p.id === appData.activeProjectId);
  if (activeProjectIndex !== -1) {
    appData.projects[activeProjectIndex].name = name;
    saveAppData(appData);
  }
}

export function getGlobalActivity(): GlobalActivity[] {
    const appData = getAppData();
    const activeProject = appData.projects.find(p => p.id === appData.activeProjectId);
    return activeProject ? activeProject.activity : [];
}

export function saveGlobalActivity(activity: GlobalActivity[]): void {
  const appData = getAppData();
  const activeProjectIndex = appData.projects.findIndex(p => p.id === appData.activeProjectId);
  if (activeProjectIndex !== -1) {
    appData.projects[activeProjectIndex].activity = activity;
    saveAppData(appData);
  }
}


export function savePopoutPosition(position: PopoutPosition): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(POPOUT_POSITION_KEY, position);
        window.dispatchEvent(new StorageEvent('storage', { key: POPOUT_POSITION_KEY }));
    } catch (error) {
        console.error("Failed to save popout position to localStorage", error);
    }
}

export function getPopoutPosition(): PopoutPosition {
    if (typeof window === 'undefined') return 'center';
    try {
        const storedPosition = localStorage.getItem(POPOUT_POSITION_KEY);
        return (storedPosition as PopoutPosition) || 'center';
    } catch (error) {
        console.error("Failed to get popout position from localStorage", error);
        return 'center';
    }
}
