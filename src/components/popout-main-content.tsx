
"use client";

import type { Task, TaskStatus } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TaskForm } from '@/components/task-form';
import { TaskItem } from '@/components/task-item';

type PopoutMainContentProps = {
  tasks: Task[];
  projectName: string;
  onTaskAdd: (content: string) => void;
  onTaskUpdate: (taskId: string, newContent: string) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskHistoryView: (task: Task) => void;
  onTaskStatusUpdate: (taskId: string, newStatus: TaskStatus) => void;
};

export function PopoutMainContent({
  tasks,
  projectName,
  onTaskAdd,
  onTaskUpdate,
  onTaskDelete,
  onTaskHistoryView,
  onTaskStatusUpdate,
}: PopoutMainContentProps) {
  return (
    <main className="flex-1 flex flex-col w-full bg-white overflow-hidden">
      <div className="p-4 border-b">
        <TaskForm projectName={projectName} onTaskAdd={onTaskAdd} />
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-0 p-4">
          {tasks.length > 0 ? tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onHistoryClick={onTaskHistoryView}
              onUpdate={onTaskUpdate}
              onDelete={onTaskDelete}
              onStatusUpdate={onTaskStatusUpdate}
            />
          )) : (
            <div className="text-center py-16">
              <h3 className="text-lg font-medium text-foreground">No tasks yet!</h3>
              <p className="text-muted-foreground mt-1">Add a task above to get started.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </main>
  );
}
