
export type Modification = {
  id: string;
  taskId: string;
  timestamp: Date;
  type: 'content' | 'status';
  from: string;
  to: string;
};

export type TaskStatus = 'Pendiente' | 'En proceso' | 'Listo';

export type Task = {
  id: string;
  content: string;
  createdAt: Date;
  modifications: Modification[];
  status: TaskStatus;
};

export type GlobalActivity = {
  id: string;
  taskId: string;
  timestamp: Date;
  type: 'created' | 'content' | 'status' | 'deleted' | 'reported';
  taskContent: string;
  from?: string;
  to?: string;
};

export type Project = {
  id: string;
  name: string;
  tasks: Task[];
  activity: GlobalActivity[];
};

export type CopyFormat = 'text' | 'html';

export type StatusColors = {
  'Pendiente': string;
  'En proceso': string;
  'Listo': string;
}

export type AppSettings = {
  copyFormat: CopyFormat;
  statusColors: StatusColors;
};

export type AppData = {
  projects: Project[];
  activeProjectId: string | null;
  settings: AppSettings;
};

export type PopoutPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

    
