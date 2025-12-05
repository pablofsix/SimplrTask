
"use client";

import { useState, useEffect } from 'react';
import type { AppSettings, CopyFormat, StatusColors, TaskStatus } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from './ui/separator';
import { Input } from './ui/input';

type SettingsDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  settings: AppSettings;
  onSettingsSave: (newSettings: AppSettings) => void;
};

export function SettingsDialog({ isOpen, setIsOpen, settings, onSettingsSave }: SettingsDialogProps) {
  const [copyFormat, setCopyFormat] = useState<CopyFormat>(settings.copyFormat);
  const [statusColors, setStatusColors] = useState<StatusColors>(settings.statusColors);

  useEffect(() => {
    if (isOpen) {
      setCopyFormat(settings.copyFormat);
      setStatusColors(settings.statusColors);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    onSettingsSave({ copyFormat, statusColors });
    setIsOpen(false);
  };
  
  const handleColorChange = (status: TaskStatus, color: string) => {
    setStatusColors(prev => ({...prev, [status]: color}));
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configuración</DialogTitle>
          <DialogDescription>
            Personaliza el comportamiento de la aplicación.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Formato de Copiado de Tareas</h3>
            <RadioGroup
              value={copyFormat}
              onValueChange={(value) => setCopyFormat(value as CopyFormat)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="text" />
                <Label htmlFor="text">Texto plano</Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">Ideal para pegar en editores simples o donde no se necesita formato.</p>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="html" id="html" />
                <Label htmlFor="html">Texto enriquecido (HTML)</Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">Mantiene colores y negrita. Ideal para Teams, Word, o Google Docs.</p>
            </RadioGroup>
          </div>

          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Colores de Estado para Copiado HTML</h3>
            <div className="space-y-2">
                {(Object.keys(statusColors) as TaskStatus[]).map(status => (
                  <div key={status} className="flex items-center justify-between gap-4">
                    <Label htmlFor={`color-${status}`}>{status}</Label>
                    <div className="flex items-center gap-2">
                        <Input 
                          id={`color-${status}`}
                          type="color" 
                          value={statusColors[status]}
                          onChange={(e) => handleColorChange(status, e.target.value)}
                          className="w-10 h-10 p-1"
                        />
                        <Input
                          value={statusColors[status]}
                          onChange={(e) => handleColorChange(status, e.target.value)}
                          className="w-24 font-mono text-sm"
                        />
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
