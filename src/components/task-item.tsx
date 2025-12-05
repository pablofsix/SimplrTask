"use client";

import { useState } from 'react';
import type { Task, TaskStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { History, Save, X, Trash2, CheckCircle, Circle, Dot } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

type TaskItemProps = {
  task: Task;
  onHistoryClick: (task: Task) => void;
  onUpdate: (taskId: string, newContent: string) => void;
  onDelete: (taskId: string) => void;
  onStatusUpdate: (taskId: string, newStatus: TaskStatus) => void;
};

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
  'Pendiente': { label: 'Pendiente', color: 'bg-red-500', icon: <Circle className="h-3 w-3" /> },
  'En proceso': { label: 'En proceso', color: 'bg-blue-500', icon: <Dot className="h-4 w-4" /> },
  'Listo': { label: 'Listo', color: 'bg-green-500', icon: <CheckCircle className="h-3 w-3" /> },
};


export function TaskItem({ task, onHistoryClick, onUpdate, onDelete, onStatusUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);

  const handleSave = () => {
    if (editContent.trim() && editContent.trim() !== task.content) {
      onUpdate(task.id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(task.content);
    setIsEditing(false);
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSave();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    onStatusUpdate(task.id, checked ? 'Listo' : 'Pendiente');
  };

  const currentStatusConfig = statusConfig[task.status];

  return (
    <div className="py-2 flex flex-col gap-2 transition-all group rounded-md hover:bg-muted/50">
      {isEditing ? (
        <div>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="mb-2 min-h-[80px]"
            maxLength={150}
            autoFocus
            onFocus={(e) => e.currentTarget.select()}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
             <div className="mt-1">
                <Checkbox
                    checked={task.status === 'Listo'}
                    onCheckedChange={handleCheckboxChange}
                    aria-label="Task status"
                />
            </div>
            <div className="flex-1 min-w-0" onClick={() => setIsEditing(true)}>
              <p className={cn("text-foreground whitespace-pre-wrap break-all cursor-pointer", task.status === 'Listo' && 'line-through text-muted-foreground')}>
                {task.content}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-4">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge variant="outline" className="cursor-pointer flex items-center justify-start gap-1.5 w-28">
                  <span className={cn("h-2 w-2 rounded-full", currentStatusConfig.color)} />
                  {task.status}
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.keys(statusConfig).map((statusKey) => {
                  const status = statusKey as TaskStatus;
                  return (
                    <DropdownMenuItem key={status} onSelect={() => onStatusUpdate(task.id, status)}>
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", statusConfig[status].color)} />
                        {statusConfig[status].label}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onHistoryClick(task)}>
                <History className="h-4 w-4" />
                <span className="sr-only">View History</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive" onClick={() => onDelete(task.id)}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete Task</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
