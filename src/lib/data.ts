import type { Task } from '@/lib/types';

// This data is now only for initial setup if localStorage is empty,
// but our logic in page.tsx will handle that.
// We can clear this out to rely solely on localStorage.
export const initialTasks: Task[] = [];
