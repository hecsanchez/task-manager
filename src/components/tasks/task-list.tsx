"use client"

import { Task, TaskStatus } from "@/lib/db/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TaskListProps {
  tasks: Task[]
  projectId: string
}

const statusColors = {
  todo: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  "in-progress": "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  done: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
} as const

export function TaskList({ tasks, projectId }: TaskListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card 
          key={task.id} 
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => {
            const newSearchParams = new URLSearchParams(searchParams.toString())
            newSearchParams.set('taskId', task.id)
            router.push(`/projects/${projectId}?${newSearchParams.toString()}`)
          }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{task.title}</CardTitle>
              <Badge 
                variant="secondary" 
                className={statusColors[task.status as keyof typeof statusColors]}
              >
                {task.status === TaskStatus.TODO ? 'To do' : 
                 task.status === TaskStatus.IN_PROGRESS ? 'In progress' : 'Done'}
              </Badge>
            </div>
            <CardDescription>
                {task.dueDate ? `Due: ${format(new Date(task.dueDate), 'dd MMM yyyy', { locale: es })}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {task.description || "No description provided"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 