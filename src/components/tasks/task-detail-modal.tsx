'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { TaskStatus } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

interface TaskDetailModalProps {
  task: {
    id: string
    title: string
    description: string | null
    status: string
    dueDate: Date | null
    projectId: string
    project: {
      title: string
    }
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailModal({ task, open, onOpenChange }: TaskDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">Project: {task.project.title}</p>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              {
                "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400": task.status === TaskStatus.TODO,
                "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400": task.status === TaskStatus.IN_PROGRESS,
                "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400": task.status === TaskStatus.DONE,
              }
            )}>
              {task.status === TaskStatus.TODO ? 'To do' : 
               task.status === TaskStatus.IN_PROGRESS ? 'In progress' : 'Done'}
            </div>
            
            {task.dueDate && (
              <div className="text-sm text-muted-foreground">
                Due: {format(new Date(task.dueDate), 'dd MMM yyyy', { locale: es })}
              </div>
            )}
          </div>

          {task.description && (
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-medium mb-2">Descripción</h3>
              <p className="text-muted-foreground">{task.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 