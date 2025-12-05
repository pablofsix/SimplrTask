"use client";

import { useState, useMemo, useRef } from 'react';
import type { GlobalActivity } from '@/lib/types';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, FilePlus, Pencil, Trash2, CheckCircle, Download, Upload, ClipboardCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type GlobalHistoryDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activity: GlobalActivity[];
  onActivityImport: (newActivity: GlobalActivity[]) => void;
};

const formatDate = (date: Date) => format(date, "dd/MM/yy HH:mm");
const getShortId = (id?: string) => id ? `...${id.slice(-4)}` : null;

const renderActivity = (act: GlobalActivity) => {
  const shortId = getShortId(act.taskId);

  switch (act.type) {
    case 'created':
      return {
        icon: <FilePlus className="h-4 w-4 text-green-500" />,
        title: <p className="font-medium">Task Created: <span className="font-normal text-muted-foreground">"{act.taskContent}"</span></p>,
        description: shortId && <Badge variant="outline" className="font-mono">{shortId}</Badge>
      };
    case 'content':
      return {
        icon: <Pencil className="h-4 w-4 text-blue-500" />,
        title: <div className="flex items-center gap-2"><p className="font-medium">Task Updated</p>{shortId && <Badge variant="outline" className="font-mono">{shortId}</Badge>}</div>,
        description: <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap">Changed from <span className="line-through">"{act.from}"</span> to <span>"{act.to}"</span></p>
      };
    case 'status':
      return {
        icon: <CheckCircle className="h-4 w-4 text-purple-500" />,
        title: <p className="font-medium">Status Changed for: <span className="font-normal text-muted-foreground">"{act.taskContent}"</span></p>,
        description: (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{act.from}</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">{act.to}</Badge>
            {shortId && <Badge variant="outline" className="font-mono">{shortId}</Badge>}
          </div>
        )
      };
    case 'deleted':
      return {
        icon: <Trash2 className="h-4 w-4 text-red-500" />,
        title: <p className="font-medium">Task Deleted: <span className="font-normal text-muted-foreground line-through">"{act.taskContent}"</span></p>,
        description: shortId && <Badge variant="outline" className="font-mono">{shortId}</Badge>
      };
    case 'reported':
        return {
          icon: <ClipboardCheck className="h-4 w-4 text-gray-500" />,
          title: <p className="font-medium">Task Reported: <span className="font-normal text-muted-foreground">"{act.taskContent}"</span></p>,
          description: shortId && <Badge variant="outline" className="font-mono">{shortId}</Badge>
        };
    default:
      return {
        icon: null,
        title: null,
        description: null
      };
  }
};

export function GlobalHistoryDialog({ isOpen, setIsOpen, activity = [], onActivityImport }: GlobalHistoryDialogProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const importFileInput = useRef<HTMLInputElement>(null);

  const filteredActivity = useMemo(() => {
    if (!searchTerm) {
      return activity;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return activity.filter(act => {
      const date = formatDate(new Date(act.timestamp)).toLowerCase();
      const type = act.type.toLowerCase();
      const content = act.taskContent.toLowerCase();
      const from = act.from?.toLowerCase();
      const to = act.to?.toLowerCase();
      const taskId = act.taskId?.toLowerCase();

      return date.includes(lowercasedFilter) ||
             type.includes(lowercasedFilter) ||
             content.includes(lowercasedFilter) ||
             (from && from.includes(lowercasedFilter)) ||
             (to && to.includes(lowercasedFilter)) ||
             (taskId && taskId.includes(lowercasedFilter));
    });
  }, [searchTerm, activity]);

  const handleExportActivity = () => {
    if (activity.length === 0) return;
    
    const sortedActivity = [...activity].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const dataStr = JSON.stringify(sortedActivity, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `activity_log_${format(new Date(), "yyyy-MM-dd")}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    importFileInput.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("File could not be read.");
        }
        const importedActivity = JSON.parse(text);

        // Basic validation
        if (!Array.isArray(importedActivity) || !importedActivity.every(item => 'id' in item && 'timestamp' in item && 'type' in item && 'taskContent' in item)) {
            throw new Error("Invalid activity file format. The 'taskId' property might be missing in some entries.");
        }
        
        onActivityImport(importedActivity);
        toast({ title: 'Success', description: 'Activity log merged successfully.' });
        setIsOpen(false);
      } catch (error) {
        console.error("Failed to import activity log:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
          title: 'Import Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    };
    reader.onerror = () => {
        toast({
            title: 'Error',
            description: 'Failed to read the file.',
            variant: 'destructive',
        });
    };
    reader.readAsText(file);

    // Reset file input
    if(event.target) {
        event.target.value = '';
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Global Activity</DialogTitle>
          <DialogDescription>
            A log of all activities across the project.
          </DialogDescription>
        </DialogHeader>
        <div className="my-2">
            <Input
              placeholder="Search activity by keyword or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <ScrollArea className="max-h-[60vh] -mx-6 px-6">
          <div className="space-y-4 py-4">
            {filteredActivity.length > 0 ? (
              [...filteredActivity].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(act => {
                const { icon, title, description } = renderActivity(act);
                return (
                  <Card key={act.id} className="p-4 bg-muted/50">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{icon}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {title}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1 ml-4 flex-shrink-0">
                            {formatDate(new Date(act.timestamp))}
                          </p>
                        </div>
                        {description && <div className="mt-1">{description}</div>}
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">
                {searchTerm ? 'No activity found for your search.' : 'No activity has been recorded yet.'}
              </p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="gap-2">
          <input type="file" accept=".json" ref={importFileInput} onChange={handleFileImport} className="hidden" />
          <Button variant="outline" onClick={handleImportClick}>
            <Upload className="mr-2 h-4 w-4" />
            Importar desde JSON
          </Button>
          <Button variant="outline" onClick={handleExportActivity} disabled={activity.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Exportar como JSON
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
