"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';

const newTaskSchema = z.object({
  content: z.string().min(1, 'Task description is required').max(150, 'Task cannot exceed 150 characters'),
});

type NewTaskFormValues = z.infer<typeof newTaskSchema>;

type TaskFormProps = {
  projectName: string;
  onTaskAdd: (content: string) => void;
};

export function TaskForm({ projectName, onTaskAdd }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<NewTaskFormValues>({
    resolver: zodResolver(newTaskSchema),
    defaultValues: { content: '' },
  });

  const taskContentValue = watch('content');

  const onSubmit = (data: NewTaskFormValues) => {
    onTaskAdd(data.content);
    reset();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div className="relative">
        <Textarea
          id="task-content"
          {...register('content')}
          onKeyDown={handleKeyDown}
          placeholder={`What needs to be done in ${projectName}? (Press Enter to submit)`}
          className="min-h-[80px] resize-none pr-16"
        />
        <p className={`absolute bottom-2 right-3 text-xs ${taskContentValue.length > 150 ? 'text-destructive' : 'text-muted-foreground'}`}>
          {taskContentValue.length} / 150
        </p>
      </div>
      {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
    </form>
  );
}
