"use client";

import type { Task, Modification } from '@/lib/types';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

type HistoryDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  task: Task | null;
};

const formatDate = (date: Date) => format(date, "dd/MM/yy HH:mm");

const renderModification = (mod: Modification) => {
  if (mod.type === 'content') {
    return (
      <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap">
        Changed from <span className="line-through">"{mod.from}"</span> to <span>"{mod.to}"</span>
      </p>
    );
  }
  if (mod.type === 'status') {
    return (
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">Status changed:</p>
        <Badge variant="outline">{mod.from}</Badge>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <Badge variant="outline">{mod.to}</Badge>
      </div>
    );
  }
  return null;
}

export function HistoryDialog({ isOpen, setIsOpen, task }: HistoryDialogProps) {
  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modification History</DialogTitle>
          <DialogDescription className="break-words">
            Showing changes for task: "{task.content}"
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] -mx-6 px-6">
          <div className="space-y-4 py-4">
              <Card className="p-4 bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">
                    {formatDate(task.createdAt)}
                  </p>
                  <p className="text-sm font-medium">Task created</p>
              </Card>

            {[...task.modifications].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(mod => (
              <Card key={mod.id} className="p-4 bg-muted/50">
                <p className="text-xs text-muted-foreground mb-2">
                  {formatDate(new Date(mod.timestamp))}
                </p>
                {renderModification(mod)}
              </Card>
            ))}
            
            {task.modifications.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No modifications have been made to this task yet.</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
